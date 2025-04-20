using IlkKontakt.Backend.Samples;
using Xunit;

namespace IlkKontakt.Backend.EntityFrameworkCore.Applications;

[Collection(BackendTestConsts.CollectionDefinitionName)]
public class EfCoreSampleAppServiceTests : SampleAppServiceTests<BackendEntityFrameworkCoreTestModule>
{

}
