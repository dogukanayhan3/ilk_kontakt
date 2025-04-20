using System.Threading.Tasks;

namespace IlkKontakt.Backend.Data;

public interface IBackendDbSchemaMigrator
{
    Task MigrateAsync();
}
