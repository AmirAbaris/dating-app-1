namespace api.Models.Helpers;

public class PhotoUploadStatus
{
    public readonly int MaxPhotosLimit = 3;
    public bool IsMaxPhotoReached { get; set; }
    public Photo? Photo { get; set; }
}
