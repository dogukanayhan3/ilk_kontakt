using System;
using Volo.Abp.ObjectExtending;  // if you use ABP's enum export feature. Do we?


namespace IlkKontakt.Backend.Connections;

public enum ConnectionStatus
{
    Pending,
    Accepted,
    Rejected
}
