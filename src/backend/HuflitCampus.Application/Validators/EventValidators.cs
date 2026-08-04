using FluentValidation;
using HuflitCampus.Application.DTOs.Events;
using HuflitCampus.Application.Features.Events.Commands;

namespace HuflitCampus.Application.Validators;

public class CreateEventRequestValidator : AbstractValidator<CreateEventRequest>
{
    public CreateEventRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(200);

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(10000);

        RuleFor(x => x.LocationName)
            .NotEmpty().WithMessage("Location is required.")
            .MaximumLength(300);

        RuleFor(x => x.Capacity)
            .GreaterThan(0).WithMessage("Capacity must be greater than zero.");

        RuleFor(x => x.MaxWaitlist)
            .GreaterThanOrEqualTo(0)
            .When(x => x.WaitlistEnabled);

        RuleFor(x => x.StartAt)
            .LessThan(x => x.EndAt).WithMessage("Start time must be before end time.");

        RuleFor(x => x.RegistrationDeadline)
            .LessThanOrEqualTo(x => x.StartAt)
            .WithMessage("Registration deadline must be on or before event start.");

        RuleFor(x => x.Category)
            .IsInEnum();

        RuleFor(x => x.CheckInEnd)
            .GreaterThan(x => x.CheckInStart)
            .When(x => x.CheckInStart.HasValue && x.CheckInEnd.HasValue);
    }
}

public class UpdateEventRequestValidator : AbstractValidator<UpdateEventRequest>
{
    public UpdateEventRequestValidator()
    {
        Include(new CreateEventRequestValidator());
    }
}

public class CreateEventCommandValidator : AbstractValidator<CreateEventCommand>
{
    public CreateEventCommandValidator()
    {
        RuleFor(x => x.Request).SetValidator(new CreateEventRequestValidator());
    }
}

public class UpdateEventCommandValidator : AbstractValidator<UpdateEventCommand>
{
    public UpdateEventCommandValidator()
    {
        RuleFor(x => x.EventId).NotEmpty();
        RuleFor(x => x.Request).SetValidator(new UpdateEventRequestValidator());
    }
}
