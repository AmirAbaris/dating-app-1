namespace api.Controllers;

[Authorize]
public class MemberController(IMemberRepository _memberRepository, IUserRepository _userRepository) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MemberDto?>>> GetMembers([FromQuery] UserParams userParams, CancellationToken cancellationToken)
    {
        List<MemberDto?> memberDtos = [];

        AppUser? appUser = await _userRepository.GetUserByIdAsync(User.GetUserId(), cancellationToken);

        if (appUser is not null && string.IsNullOrEmpty(userParams.Gender))
        {
            userParams.CurrentUserId = appUser.Id;
            userParams.Gender = appUser.Gender;
        }

        PagedList<AppUser> pagedAppUsers = await _memberRepository.GetMembersAsync(userParams, cancellationToken);

        /*  1- Response only exists in Contoller. So we have to set PaginationHeader here before converting AppUser to UserDto.
                If we convert AppUser before here, we'll lose PagedList's pagination values, e.g. CurrentPage, PageSize, etc.
        */
        Response.AddPaginationHeader(new PaginationHeader(pagedAppUsers.CurrentPage, pagedAppUsers.PageSize, pagedAppUsers.TotalCount, pagedAppUsers.TotalPages));

        /*  2- PagedList<T> has to be AppUser first to retrieve data from DB and set pagination values. 
                After that step we can convert AppUser to UserDto in here (NOT in the UserRepository) */
        foreach (AppUser pagedAppUser in pagedAppUsers)
        {
            memberDtos.Add(Mappers.ConvertAppUserToMemberDto(pagedAppUser));
        }

        return memberDtos;
    }

    [HttpGet("id/{memberId}")]
    public async Task<ActionResult<MemberDto>> GetMemberById(string memberId, CancellationToken cancellationToken)
    {
        MemberDto? memberDto = await _memberRepository.GetMemberByIdAsync(memberId, cancellationToken);

        return memberDto is null ? BadRequest("No member found by this ID.") : memberDto;
    }

    [HttpGet("email/{email}")]
    public async Task<ActionResult<MemberDto>> GetMemberByEmail(string email, CancellationToken cancellationToken)
    {
        MemberDto? memberDto = await _memberRepository.GetMemberByEmailAsync(email, cancellationToken);

        return memberDto is null ? BadRequest("No user found by this Email.") : memberDto;
    }
}
