using Simpled.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using Simpled.Hubs;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.OpenApi.Models;
using Simpled.Repository;
using Simpled.Services;
using System.Reflection;
using Simpled.Exception;
using Microsoft.AspNetCore.SignalR;
using Simpled.Helpers;
using Microsoft.AspNetCore.Authentication;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// --------------------------------------------------
//  DbContext 
// --------------------------------------------------
builder.Services.AddDbContext<SimpledDbContext>(options =>
    options.UseSqlite(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

// --------------------------------------------------
//  Authentication: JWT + Cookies + Google + GitHub
// --------------------------------------------------
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["Key"]!;
var issuer = jwtSettings["Issuer"];
var audience = jwtSettings["Audience"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ValidateIssuer = true,
        ValidIssuer = issuer,
        ValidateAudience = true,
        ValidAudience = audience,
        ClockSkew = TimeSpan.Zero
    };
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"].FirstOrDefault();
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) &&
                (path.StartsWithSegments("/hubs/board") || path.StartsWithSegments("/api/sse/invitations")))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
})
.AddCookie()
// Google
.AddGoogle("Google", options =>
{
    var section = builder.Configuration.GetSection("Authentication:Google");
    options.ClientId = section["ClientId"]!;
    options.ClientSecret = section["ClientSecret"]!;
    options.CallbackPath = section["CallbackPath"];
    options.Events.OnCreatingTicket = ctx =>
    {
        var email = ctx.User.GetProperty("email").GetString();
        string name = string.Empty;
        string picture = string.Empty;
        if (ctx.User.TryGetProperty("name", out var nameElement) && nameElement.ValueKind == System.Text.Json.JsonValueKind.String)
            name = nameElement.GetString() ?? string.Empty;
        if (ctx.User.TryGetProperty("picture", out var pictureElement) && pictureElement.ValueKind == System.Text.Json.JsonValueKind.String)
            picture = pictureElement.GetString() ?? string.Empty;
        if (!string.IsNullOrEmpty(email))
            ctx.Identity?.AddClaim(new Claim(ClaimTypes.Email, email));
        if (!string.IsNullOrEmpty(name))
            ctx.Identity?.AddClaim(new Claim(ClaimTypes.Name, name));
        if (!string.IsNullOrEmpty(picture))
            ctx.Identity?.AddClaim(new Claim("picture", picture));
        return Task.CompletedTask;
    };
})
// GitHub
.AddGitHub(options =>
{
    var section = builder.Configuration.GetSection("Authentication:GitHub");
    options.ClientId = section["ClientId"]!;
    options.ClientSecret = section["ClientSecret"]!;
    options.CallbackPath = section["CallbackPath"];
    options.Scope.Add("user:email");
    options.ClaimActions.MapJsonKey(ClaimTypes.Email, "email");
    options.ClaimActions.MapJsonKey(ClaimTypes.Name, "name");
    options.ClaimActions.MapJsonKey("picture", "avatar_url");
});

// --------------------------------------------------
//  CORS
// --------------------------------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()
    );
});

// --------------------------------------------------
//  Controladores + FluentValidation
// --------------------------------------------------
builder.Services.AddControllers();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// --------------------------------------------------
//  Swagger + Bearer Authorization
// --------------------------------------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Introduce '<TOKEN>'"
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id   = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    options.IncludeXmlComments(xmlPath);
});

// --------------------------------------------------
//  SignalR, Authorization, Servicios y Repositorios
// --------------------------------------------------
builder.Services.AddSignalR();
builder.Services.AddAuthorization();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IAuthRepository, AuthService>();
builder.Services.AddScoped<IUserRepository, UserService>();
builder.Services.AddScoped<IBoardRepository, BoardService>();
builder.Services.AddScoped<IColumnRepository, ColumnService>();
builder.Services.AddScoped<IItemRepository, ItemService>();
builder.Services.AddScoped<IBoardMemberRepository, BoardMemberService>();
builder.Services.AddScoped<IBoardInvitationRepository, BoardInvitationService>();
builder.Services.AddScoped<AchievementsService>();
builder.Services.AddSingleton<IUserIdProvider, EmailBasedUserIdHelper>();
builder.Services.AddScoped<ITeamRepository, TeamService>();
builder.Services.AddScoped<ITeamMemberRepository, TeamService>();
builder.Services.AddScoped<ITeamInvitationRepository, TeamInvitationService>();
builder.Services.AddScoped<IDependencyRepository, DependencyService>();
builder.Services.AddScoped<DependencyService>();
builder.Services.AddScoped<ICommentRepository, CommentService>();
builder.Services.AddScoped<IActivityLogRepository, ActivityLogService>();
builder.Services.AddScoped<IChatRepository, ChatService>();
builder.Services.AddSingleton<SseInvitationBroadcastService>();

var app = builder.Build();

// --------------------------------------------------
//  Crear DB
// --------------------------------------------------
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<SimpledDbContext>();
    await db.Database.EnsureCreatedAsync();

    // Crear usuario admin global por defecto si no existe
    var adminEmail = "admin@admin.es";
    var admin = await db.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.Email == adminEmail);
    if (admin == null)
    {
        var adminUser = new Simpled.Models.User
        {
            Id = Guid.NewGuid(),
            Name = "Administrador",
            Email = adminEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("administrador"),
            CreatedAt = DateTime.UtcNow,
            ImageUrl = "/images/default/avatar-default.jpg",
            Roles = new List<Simpled.Models.UserRole>()
        };
        adminUser.Roles.Add(new Simpled.Models.UserRole
        {
            UserId = adminUser.Id,
            Role = "admin"
        });
        db.Users.Add(adminUser);
        await db.SaveChangesAsync();
    }
}

// --------------------------------------------------
//  Middlewares
// --------------------------------------------------
app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseStaticFiles();
app.UseGlobalExceptionHandler();
app.UseAuthentication();
app.UseMiddleware<Simpled.Helpers.UserBanMiddleware>();
app.UseAuthorization();

app.MapControllers();
app.MapHub<BoardHub>("/hubs/board");
app.MapHub<ChatHub>("/hubs/chat");

await app.RunAsync();
