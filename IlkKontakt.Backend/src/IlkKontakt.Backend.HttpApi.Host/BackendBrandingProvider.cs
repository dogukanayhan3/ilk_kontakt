using Microsoft.Extensions.Localization;
using IlkKontakt.Backend.Localization;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Ui.Branding;

namespace IlkKontakt.Backend;

[Dependency(ReplaceServices = true)]
public class BackendBrandingProvider : DefaultBrandingProvider
{
    private IStringLocalizer<BackendResource> _localizer;

    public BackendBrandingProvider(IStringLocalizer<BackendResource> localizer)
    {
        _localizer = localizer;
    }

    public override string AppName => _localizer["AppName"];
}
