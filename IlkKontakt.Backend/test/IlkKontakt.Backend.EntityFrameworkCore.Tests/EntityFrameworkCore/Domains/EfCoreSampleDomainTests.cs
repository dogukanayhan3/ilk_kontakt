using IlkKontakt.Backend.Samples;
using Xunit;

namespace IlkKontakt.Backend.EntityFrameworkCore.Domains;

[Collection(BackendTestConsts.CollectionDefinitionName)]
public class EfCoreSampleDomainTests : SampleDomainTests<BackendEntityFrameworkCoreTestModule>
{

}
