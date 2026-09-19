namespace HuflitCampus.Application.Common.Interfaces;

public interface IAskRoutingSettings
{
    string DefaultProvider { get; }
    string DefaultModel { get; }
    bool Failover { get; }
}
