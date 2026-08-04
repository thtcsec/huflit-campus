namespace HuflitCampus.Application.Common.Exceptions;

public class UnauthorizedAppException : Exception
{
    public UnauthorizedAppException()
        : base("Authentication is required.")
    {
    }

    public UnauthorizedAppException(string message) : base(message)
    {
    }
}
