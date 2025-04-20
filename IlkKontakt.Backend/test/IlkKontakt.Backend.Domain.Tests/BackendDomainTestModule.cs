using Volo.Abp.Modularity;

namespace IlkKontakt.Backend;

[DependsOn(
    typeof(BackendDomainModule),
    typeof(BackendTestBaseModule)
)]
public class BackendDomainTestModule : AbpModule
{

}
