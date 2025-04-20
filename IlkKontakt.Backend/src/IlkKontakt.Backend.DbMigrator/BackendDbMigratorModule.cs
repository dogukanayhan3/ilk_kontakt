using IlkKontakt.Backend.EntityFrameworkCore;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;

namespace IlkKontakt.Backend.DbMigrator;

[DependsOn(
    typeof(AbpAutofacModule),
    typeof(BackendEntityFrameworkCoreModule),
    typeof(BackendApplicationContractsModule)
)]
public class BackendDbMigratorModule : AbpModule
{
}
