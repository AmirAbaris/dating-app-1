namespace api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class LikeController(ILikesRepository _likesRepository) : BaseApiController
{
    [HttpPost("{targetMemberEmail}")]
    public async Task<ActionResult> AddLike(string targetMemberEmail, CancellationToken cancellationToken)
    {
        string? loggedInUserEmail = User.GetUserEmail();

        if (!string.IsNullOrEmpty(loggedInUserEmail))
        {
            if (loggedInUserEmail == targetMemberEmail)
                return BadRequest("Liking yourself is great but is not stored!");

            LikeStatus likeStatus = await _likesRepository.AddLikeAsync(loggedInUserEmail, targetMemberEmail, cancellationToken);
            if (likeStatus.IsSuccess)
                return Ok();

            if (likeStatus.IsAlreadyLiked)
                return BadRequest("The user is already liked.");

            return BadRequest("Liking the member failed. Try agian.");
        }

        return BadRequest("Operation failed. Contact the admin.");
    }

    [HttpGet("{predicate}")]
    public async Task<ActionResult<IEnumerable<Like>?>> GetLikes(string predicate, CancellationToken cancellationToken)
    {
        string? loggedInUserEmail = User.GetUserEmail();

        if (string.IsNullOrEmpty(loggedInUserEmail)) return BadRequest("No user is logged-in!");

        List<Like>? likes = await _likesRepository.GetLikedMembersAsync(loggedInUserEmail, predicate, cancellationToken);

        if (likes?.Count == 0) return NoContent();

        return likes;
    }
}