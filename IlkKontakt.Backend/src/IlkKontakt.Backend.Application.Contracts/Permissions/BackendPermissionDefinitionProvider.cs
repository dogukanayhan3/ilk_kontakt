using IlkKontakt.Backend.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;
using Volo.Abp.MultiTenancy;

namespace IlkKontakt.Backend.Permissions;

public class BackendPermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var myGroup = context.AddGroup(BackendPermissions.GroupName);

        var booksPermission = myGroup.AddPermission(BackendPermissions.Books.Default, L("Permission:Books"));
        booksPermission.AddChild(BackendPermissions.Books.Create, L("Permission:Books.Create"));
        booksPermission.AddChild(BackendPermissions.Books.Edit, L("Permission:Books.Edit"));
        booksPermission.AddChild(BackendPermissions.Books.Delete, L("Permission:Books.Delete"));
        //Define your own permissions here. Example:
        //myGroup.AddPermission(BackendPermissions.MyPermission1, L("Permission:MyPermission1"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<BackendResource>(name);
    }
}
