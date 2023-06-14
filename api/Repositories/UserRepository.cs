namespace api.Repositories;
public class UserRepository : IUserRepository
{

    #region Db and Token Settings
    const string _collectionName = "users";
    private readonly IMongoCollection<AppUser> _collection;
    private readonly ILogger<UserRepository> _logger;
    private readonly IPhotoService _photoService;

    // constructor - dependency injections
    public UserRepository(
        IMongoClient client, IMongoDbSettings dbSettings, ILogger<UserRepository> logger, IPhotoService photoService)
    {
        var dbName = client.GetDatabase(dbSettings.DatabaseName);
        _collection = dbName.GetCollection<AppUser>(_collectionName);

        _photoService = photoService;

        _logger = logger;
    }
    #endregion

    #region CRUD
    public async Task<List<MemberDto?>> GetUsers(CancellationToken cancellationToken)
    {
        List<MemberDto?> memberDtos = new();

        // For small lists
        // var appUsers = await _collection.Find<AppUser>(new BsonDocument()).ToListAsync(cancellationToken);

        // For large lists
        await _collection.Find<AppUser>(new BsonDocument())
        .ForEachAsync(appUser =>
        {
            memberDtos.Add(Mappers.GenerateMemberDto(appUser));
        }, cancellationToken);

        _logger.LogError("GetUsers was canceled.");

        return memberDtos;
    }

    public async Task<MemberDto?> GetUserById(string? userId, CancellationToken cancellationToken)
    {
        if (userId is not null)
        {
            AppUser user = await _collection.Find<AppUser>(user => user.Id == userId).FirstOrDefaultAsync(cancellationToken);

            return user is null ? null : Mappers.GenerateMemberDto(user);
        }

        return null;
    }

    public async Task<MemberDto?> GetUserByEmail(string email, CancellationToken cancellationToken)
    {
        AppUser user = await _collection.Find<AppUser>(user => user.Email == email.ToLower().Trim()).FirstOrDefaultAsync(cancellationToken);

        return user is null ? null : Mappers.GenerateMemberDto(user);
    }

    public async Task<UpdateResult?> UpdateUser(MemberUpdateDto memberUpdateDto, string? userId, CancellationToken cancellationToken)
    {
        if (userId is not null)
        {
            var updatedUser = Builders<AppUser>.Update
            .Set(user => user.Schema, AppVariablesExtensions.AppVersions.Last<string>())
            .Set(user => user.Introduction, memberUpdateDto.Introduction.Trim())
            .Set(user => user.LookingFor, memberUpdateDto.LookingFor.Trim())
            .Set(user => user.Interests, memberUpdateDto.Interests.Trim())
            .Set(user => user.City, memberUpdateDto.City.Trim())
            .Set(user => user.Country, memberUpdateDto.Country.Trim());

            return await _collection.UpdateOneAsync<AppUser>(user => user.Id == userId, updatedUser, null, cancellationToken);
        }

        return null;
    }

    public async Task<DeleteResult?> DeleteUser(string userId, CancellationToken cancellationToken) =>
        await _collection.DeleteOneAsync<AppUser>(user => user.Id == userId, cancellationToken);

    public async Task<UpdateResult?> UploadPhoto(IEnumerable<IFormFile> files, string? userId, CancellationToken cancellationToken)
    {
        if (userId is null)
        {
            _logger.LogError("userId is Null");
            return null;
        }

        var user = await GetUserById(userId, cancellationToken);
        if (user is null)
        {
            _logger.LogError("user is Null / not found");
            return null;
        }

        // save file in Storage using PhotoService / userId makes the folder name
        IEnumerable<PhotoAddResultsDto> photoAddResults = await _photoService.AddPhoto(files, userId);
        if (!photoAddResults.Any())
        {
            _logger.LogError("photoAddResult is Null");
            return null;
        }

        Photo photo;

        foreach (PhotoAddResultsDto photoAddResult in photoAddResults)
        {
            // if conversion fails
            if (photoAddResult.Url is null)
            {
                _logger.LogError("Photo addition failed. e.g. Height/Weight input is larger than the original image size.");
                return null;
            }
            else
            {
                // if user's album is empty
                if (!user.Photos.Any())
                {
                    photo = new Photo(
                        Schema: AppVariablesExtensions.AppVersions.Last<string>(),
                        Url: photoAddResult.Url,
                        IsMain: true
                    );
                }
                else
                {
                    photo = new Photo(
                        Schema: AppVariablesExtensions.AppVersions.Last<string>(),
                        Url: photoAddResult.Url,
                        IsMain: false
                    );
                }
                user.Photos.Add(photo);
            }
        }

        var updatedUser = Builders<AppUser>.Update
        .Set(user => user.Schema, AppVariablesExtensions.AppVersions.Last<string>())
        .Set(doc => doc.Photos, user.Photos);

        return await _collection.UpdateOneAsync<AppUser>(user => user.Id == userId, updatedUser, null, cancellationToken);
    }

    #endregion CRUD
}