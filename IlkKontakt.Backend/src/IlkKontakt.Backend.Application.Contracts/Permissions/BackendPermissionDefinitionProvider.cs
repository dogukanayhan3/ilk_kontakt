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
        
        var postPermission = myGroup.AddPermission(BackendPermissions.Posts.Default, L("Permission:Posts"));
        postPermission.AddChild(BackendPermissions.Posts.Create, L("Permission:Posts.Create"));
        postPermission.AddChild(BackendPermissions.Posts.Edit, L("Permission:Posts.Edit"));
        postPermission.AddChild(BackendPermissions.Posts.Delete, L("Permission:Posts.Delete"));

        var userProfilePermission = myGroup.AddPermission(BackendPermissions.UserProfiles.Default, L("Permission:UserProfiles"));
        userProfilePermission.AddChild(BackendPermissions.UserProfiles.Create, L("Permission:UserProfiles.Create"));
        userProfilePermission.AddChild(BackendPermissions.UserProfiles.Edit, L("Permission:UserProfiles.Edit"));
        userProfilePermission.AddChild(BackendPermissions.UserProfiles.Delete, L("Permission:UserProfiles.Delete"));
        
        var connectionPerm = myGroup
            .AddPermission(BackendPermissions.Connection.Default, L("Permission:Connections"));

        connectionPerm.AddChild(BackendPermissions.Connection.Create, L("Permission:ConnectionCreate"));
        connectionPerm.AddChild(BackendPermissions.Connection.Update, L("Permission:ConnectionUpdate"));
        connectionPerm.AddChild(BackendPermissions.Connection.Delete, L("Permission:ConnectionDelete"));
        connectionPerm.AddChild(BackendPermissions.Connection.View,   L("Permission:ConnectionView"));

    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<BackendResource>(name);
    }
}
