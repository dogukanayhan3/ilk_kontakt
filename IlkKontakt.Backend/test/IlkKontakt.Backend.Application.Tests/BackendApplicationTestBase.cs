using Volo.Abp.Modularity;

namespace IlkKontakt.Backend;

public abstract class BackendApplicationTestBase<TStartupModule> : BackendTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
