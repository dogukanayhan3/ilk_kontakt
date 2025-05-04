using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.Guids;

namespace IlkKontakt.Backend.Posts;

public class Post : AuditedAggregateRoot<Guid>
{
    public Guid CreatorUserId { get; set; }
    public string Content { get; set; }
    public DateTime PublishDate { get; set; } = DateTime.UtcNow;

    // Backing field for a JSON array of user-ids who liked the post
    private List<Guid> _userLikes = new();
    public IReadOnlyCollection<Guid> UserLikes => _userLikes;

    // Backing field for a JSON array of comments
    private List<Comment> _userComments = new();
    public IReadOnlyCollection<Comment> UserComments => _userComments;

    // Computed property (not mapped) for convenience
    [NotMapped]
    public int NumberOfLikes => _userLikes.Count;

    // Domain methods
    public void AddLike(Guid userId)
    {
        if (!_userLikes.Contains(userId)) _userLikes.Add(userId);
    }

    public void RemoveLike(Guid userId)
    {
        _userLikes.Remove(userId);
    }

    public Comment AddComment(Guid userId, string content, IGuidGenerator guidGenerator)
    {
        var c = new Comment(
            guidGenerator.Create(),
            userId,
            content,
            DateTime.UtcNow);
        _userComments.Add(c);
        return c;
    }
}

[Owned]
public class Comment
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string Content { get; private set; }
    public DateTime CreationTime { get; private set; }

    private Comment() { } // EF Core

    public Comment(Guid id, Guid userId, string content, DateTime creationTime)
    {
        Id = id;
        UserId = userId;
        Content = content;
        CreationTime = creationTime;
    }
}
