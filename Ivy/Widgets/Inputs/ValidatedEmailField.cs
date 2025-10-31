using Ivy.Core;
using Ivy.Core.Hooks;
using Ivy.Views.Forms;
using Ivy.Core.Helpers;
using System.ComponentModel.DataAnnotations;

namespace Ivy.Widgets.Inputs;

/// <summary>A field wrapper that adds email validation to standalone email inputs.</summary>
public class ValidatedEmailField : ViewBase
{
    private readonly IAnyState _state;
    private readonly string? _placeholder;
    private readonly string? _label;
    private readonly bool _required;

    public ValidatedEmailField(IAnyState state, string? placeholder = null, string? label = null, bool required = false)
    {
        _state = state;
        _placeholder = placeholder;
        _label = label;
        _required = required;
    }

    public override object? Build()
    {
        var invalidState = UseState((string?)null);
        var blurOnceState = UseState(false);

        void OnBlur()
        {
            blurOnceState.Set(true);
            var value = _state.As<string?>().Value;

            if (!string.IsNullOrWhiteSpace(value))
            {
                // Use the same EmailAddressAttribute validation as forms
                var emailValidator = new EmailAddressAttribute();
                var validationContext = new ValidationContext(new { })
                {
                    MemberName = "Email",
                    DisplayName = "Email"
                };

                var result = emailValidator.GetValidationResult(value, validationContext);
                if (result != null)  // null means success
                {
                    invalidState.Set((string?)(result?.ErrorMessage ?? "Please enter a valid email address"));
                }
                else
                {
                    invalidState.Set((string?)null);
                }
            }
            else
            {
                invalidState.Set((string?)null);
            }
        }

        // Create the email input
        var input = (TextInputBase)_state.ToTextInput(_placeholder, false, TextInputs.Email);

        // Apply validation state if present - this is the key!
        if (!string.IsNullOrEmpty(invalidState.Value))
        {
            input = (TextInputBase)input.Invalid(invalidState.Value);
        }

        // Add blur handler
        input = (TextInputBase)input.HandleBlur(_ => OnBlur());

        // Wrap in Field for consistent styling
        var field = new Field(input, _label, null, _required);

        return field;
    }
}

/// <summary>Extension methods for creating validated email fields.</summary>
public static class ValidatedEmailFieldExtensions
{
    /// <summary>Creates a validated email field that shows validation errors on blur.</summary>
    public static ValidatedEmailField ToValidatedEmailField(this IAnyState state, string? placeholder = null, string? label = null, bool required = false)
    {
        return new ValidatedEmailField(state, placeholder, label, required);
    }
}
