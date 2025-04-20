using IlkKontakt.Backend.Localization;
using Volo.Abp.Application.Services;

namespace IlkKontakt.Backend;

/* Inherit your application services from this class.
 */
public abstract class BackendAppService : ApplicationService
{
    protected BackendAppService()
    {
        LocalizationResource = typeof(BackendResource);
    }
}
