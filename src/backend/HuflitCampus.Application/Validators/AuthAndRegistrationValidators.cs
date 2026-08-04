using FluentValidation;
using HuflitCampus.Application.DTOs.Auth;
using HuflitCampus.Application.Features.Auth.Commands;
using HuflitCampus.Application.Features.Registrations.Commands;

namespace HuflitCampus.Application.Validators;

public class GuestOtpRequestValidator : AbstractValidator<GuestOtpRequest>
{
    public GuestOtpRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.")
            .MaximumLength(256);
    }
}

public class RequestGuestOtpCommandValidator : AbstractValidator<RequestGuestOtpCommand>
{
    public RequestGuestOtpCommandValidator()
    {
        RuleFor(x => x.Request).SetValidator(new GuestOtpRequestValidator());
    }
}

public class GuestOtpVerifyRequestValidator : AbstractValidator<GuestOtpVerifyRequest>
{
    public GuestOtpVerifyRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);

        RuleFor(x => x.Code)
            .NotEmpty()
            .Length(4, 8);

        RuleFor(x => x.FullName)
            .MaximumLength(200)
            .When(x => !string.IsNullOrWhiteSpace(x.FullName));
    }
}

public class VerifyGuestOtpCommandValidator : AbstractValidator<VerifyGuestOtpCommand>
{
    public VerifyGuestOtpCommandValidator()
    {
        RuleFor(x => x.Request).SetValidator(new GuestOtpVerifyRequestValidator());
    }
}

public class RegisterForEventCommandValidator : AbstractValidator<RegisterForEventCommand>
{
    public RegisterForEventCommandValidator()
    {
        RuleFor(x => x.EventId).NotEmpty();
        RuleFor(x => x.Request.Notes)
            .MaximumLength(1000)
            .When(x => x.Request is not null && !string.IsNullOrWhiteSpace(x.Request.Notes));
    }
}
