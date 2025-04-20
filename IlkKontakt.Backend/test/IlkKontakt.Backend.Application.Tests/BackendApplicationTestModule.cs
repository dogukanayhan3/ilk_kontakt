using Volo.Abp.Modularity;

namespace IlkKontakt.Backend;

[DependsOn(
    typeof(BackendApplicationModule),
    typeof(BackendDomainTestModule)
)]
public class BackendApplicationTestModule : AbpModule
{

}
