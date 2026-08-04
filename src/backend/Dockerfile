# HuflitCampus.Api — multi-stage production image
# Build from repo root:
#   docker build -f src/backend/Dockerfile -t huflit-campus-api .

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY src/backend/HuflitCampus.Domain/HuflitCampus.Domain.csproj HuflitCampus.Domain/
COPY src/backend/HuflitCampus.Application/HuflitCampus.Application.csproj HuflitCampus.Application/
COPY src/backend/HuflitCampus.Infrastructure/HuflitCampus.Infrastructure.csproj HuflitCampus.Infrastructure/
COPY src/backend/HuflitCampus.Api/HuflitCampus.Api.csproj HuflitCampus.Api/

RUN dotnet restore HuflitCampus.Api/HuflitCampus.Api.csproj

COPY src/backend/HuflitCampus.Domain/ HuflitCampus.Domain/
COPY src/backend/HuflitCampus.Application/ HuflitCampus.Application/
COPY src/backend/HuflitCampus.Infrastructure/ HuflitCampus.Infrastructure/
COPY src/backend/HuflitCampus.Api/ HuflitCampus.Api/

WORKDIR /src/HuflitCampus.Api
RUN dotnet publish -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

RUN mkdir -p /app/wwwroot/uploads

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "HuflitCampus.Api.dll"]
