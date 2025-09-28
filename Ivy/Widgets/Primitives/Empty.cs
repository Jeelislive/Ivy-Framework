using Ivy.Core;

// ReSharper disable once CheckNamespace
namespace Ivy;

/// <summary>
/// A utility widget that represents empty or null content in the widget tree.
/// Provides a clean way to handle conditional rendering, placeholder content, and layout spacing
/// without rendering any visible elements while maintaining proper widget tree structure.
/// </summary>
/// <remarks>
/// The Empty widget is designed for scenarios where no content should be displayed:
/// <list type="bullet">
/// <item>
/// <term>Conditional rendering</term>
/// <description>Use when content should be hidden based on conditions.</description>
/// </item>
/// <item>
/// <term>Placeholder content</term>
/// <description>Temporary placeholder that renders nothing visible.</description>
/// </item>
/// <item>
/// <term>Layout spacing</term>
/// <description>Maintain layout structure without visible content.</description>
/// </item>
/// <item>
/// <term>Null safety</term>
/// <description>Safe alternative to null widgets in collections and conditional scenarios.</description>
/// </item>
/// </list>
/// <para>The Empty widget renders no visual content but maintains proper widget tree participation for layout and rendering systems.</para>
/// </remarks>
public record Empty : WidgetBase<Empty>
{
}