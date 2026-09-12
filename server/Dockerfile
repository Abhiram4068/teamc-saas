# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files
COPY SaaS.Api/SaaS.Api.csproj SaaS.Api/
COPY SaaS.Application/SaaS.Application.csproj SaaS.Application/
COPY SaaS.Domain/SaaS.Domain.csproj SaaS.Domain/
COPY SaaS.Infrastructure/SaaS.Infrastructure.csproj SaaS.Infrastructure/

# Restore dependencies
RUN dotnet restore SaaS.Api/SaaS.Api.csproj

# Copy source code
COPY . .

# Build and publish
RUN dotnet publish SaaS.Api/SaaS.Api.csproj \
    -c Release \
    -o /app/publish \
    --no-restore


# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

# Render uses port 10000 by default
ENV ASPNETCORE_URLS=http://0.0.0.0:10000

ENTRYPOINT ["dotnet", "SaaS.Api.dll"]