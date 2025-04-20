using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using IlkKontakt.Backend.Data;
using Volo.Abp.DependencyInjection;

namespace IlkKontakt.Backend.EntityFrameworkCore;

public class EntityFrameworkCoreBackendDbSchemaMigrator
    : IBackendDbSchemaMigrator, ITransientDependency
{
    private readonly IServiceProvider _serviceProvider;

    public EntityFrameworkCoreBackendDbSchemaMigrator(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task MigrateAsync()
    {
        /* We intentionally resolving the BackendDbContext
         * from IServiceProvider (instead of directly injecting it)
         * to properly get the connection string of the current tenant in the
         * current scope.
         */

        await _serviceProvider
            .GetRequiredService<BackendDbContext>()
            .Database
            .MigrateAsync();
    }
}
