namespace ShopVima.Application.Dtos.User;

public class UserOptionDto
{
    private Guid id;
    private string fullName;
    private string email;

    public UserOptionDto(Guid id, string fullName)
    {
        this.id = id;
        this.fullName = fullName;
    }

    public UserOptionDto(Guid id, string fullName, string email)
    {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
    }
}