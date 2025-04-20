using Xunit;

namespace IlkKontakt.Backend.EntityFrameworkCore;

[CollectionDefinition(BackendTestConsts.CollectionDefinitionName)]
public class BackendEntityFrameworkCoreCollection : ICollectionFixture<BackendEntityFrameworkCoreFixture>
{

}
