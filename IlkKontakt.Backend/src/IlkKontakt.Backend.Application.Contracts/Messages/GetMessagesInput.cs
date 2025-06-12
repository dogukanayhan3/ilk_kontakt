using System;
using System.ComponentModel.DataAnnotations;

namespace IlkKontakt.Backend.Messages;

/// <summary>
/// Input for retrieving all messages in a given connection.
/// </summary>
public class GetMessagesInput
{
    [Required]
    public Guid ConnectionId { get; set; }
}
