using IlkKontakt.Backend.Books;
using Xunit;

namespace IlkKontakt.Backend.EntityFrameworkCore.Applications.Books;

[Collection(BackendTestConsts.CollectionDefinitionName)]
public class EfCoreBookAppService_Tests : BookAppService_Tests<BackendEntityFrameworkCoreTestModule>
{

}