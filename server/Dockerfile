FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER app
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy all project files to restore dependencies
COPY ["SaaS.API/SaaS.Api.csproj", "SaaS.API/"]
COPY ["SaaS.Application/SaaS.Application.csproj", "SaaS.Application/"]
COPY ["SaaS.Domain/SaaS.Domain.csproj", "SaaS.Domain/"]
COPY ["SaaS.Infrastructure/SaaS.Infrastructure.csproj", "SaaS.Infrastructure/"]

# Restore dependencies for the API project (this will implicitly restore the others)
RUN dotnet restore "SaaS.API/SaaS.Api.csproj"

# Copy the rest of the source code
COPY . .
WORKDIR "/src/SaaS.API"
RUN dotnet build "SaaS.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "SaaS.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SaaS.Api.dll"]
