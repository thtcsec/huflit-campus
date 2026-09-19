using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Infrastructure.Options;
using Microsoft.Extensions.Options;

namespace HuflitCampus.Infrastructure.Ask;

public sealed class AskRoutingSettings(IOptions<AskRagOptions> options) : IAskRoutingSettings
{
    public string DefaultProvider =>
        string.IsNullOrWhiteSpace(options.Value.DefaultProvider) ? "auto" : options.Value.DefaultProvider;

    public string DefaultModel =>
        string.IsNullOrWhiteSpace(options.Value.DefaultModel) ? "auto" : options.Value.DefaultModel;

    public bool Failover => options.Value.Failover;
}
