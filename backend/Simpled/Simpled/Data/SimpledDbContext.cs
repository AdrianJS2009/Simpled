using Microsoft.EntityFrameworkCore;
using Simpled.Models;

namespace Simpled.Data
{
    /// <summary>
    /// Contexto de base de datos.
    /// </summary>
    public class SimpledDbContext : DbContext
    {
        public SimpledDbContext(DbContextOptions<SimpledDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<UserRole> UserRoles => Set<UserRole>();
        public DbSet<Board> Boards => Set<Board>();
        public DbSet<BoardColumn> BoardColumns => Set<BoardColumn>();
        public DbSet<Item> Items => Set<Item>();
        public DbSet<Subtask> Subtasks => Set<Subtask>();
        public DbSet<Content> Contents => Set<Content>();
        public DbSet<BoardMember> BoardMembers => Set<BoardMember>();
        public DbSet<BoardInvitation> BoardInvitations => Set<BoardInvitation>();
        public DbSet<UserAchievement> UserAchievements => Set<UserAchievement>();
        public DbSet<Team> Teams => Set<Team>();
        public DbSet<TeamMember> TeamMembers => Set<TeamMember>();
        public DbSet<TeamInvitation> TeamInvitations => Set<TeamInvitation>();
        public DbSet<FavoriteBoards> FavoriteBoards => Set<FavoriteBoards>();
        public DbSet<Dependency> Dependencies => Set<Dependency>();
        public DbSet<Comment> Comments => Set<Comment>();
        public DbSet<ChatRoom> ChatRooms => Set<ChatRoom>();
        public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
        public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();

        /// <summary>
        /// Configura las relaciones y restricciones entre las entidades.
        /// </summary>
        /// <param name="modelBuilder">Constructor de modelo para definir entidades y relaciones.</param>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Relación Usuario ↔ Rol de Usuario (1:N)
            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.User)
                .WithMany(u => u.Roles)
                .HasForeignKey(ur => ur.UserId);

            // Relación Tablero ↔ Propietario (N:1)
            modelBuilder.Entity<Board>()
                .HasOne(b => b.Owner)
                .WithMany()
                .HasForeignKey(b => b.OwnerId);

            // Relación Columna ↔ Tablero (1:N)
            modelBuilder.Entity<BoardColumn>()
                .HasOne(c => c.Board)
                .WithMany(b => b.Columns)
                .HasForeignKey(c => c.BoardId);

            // Relación Ítem ↔ Columna (1:N)
            modelBuilder.Entity<Item>()
                .HasOne(i => i.Column)
                .WithMany(c => c.Items)
                .HasForeignKey(i => i.ColumnId);

            // Relación Subtarea ↔ Ítem (1:N, eliminación en cascada)
            modelBuilder.Entity<Subtask>()
                .HasOne(st => st.Item)
                .WithMany(i => i.Subtasks)
                .HasForeignKey(st => st.ItemId)
                .OnDelete(DeleteBehavior.Cascade);

            // Relación Contenido ↔ Ítem (1:N)
            modelBuilder.Entity<Content>()
                .HasOne(cnt => cnt.Item)
                .WithMany(i => i.Contents)
                .HasForeignKey(cnt => cnt.ItemId);

            // Relación Tablero ↔ Miembro de Tablero (N:M, clave compuesta)
            modelBuilder.Entity<BoardMember>()
                .HasKey(bm => new { bm.BoardId, bm.UserId });
            modelBuilder.Entity<BoardMember>()
                .HasOne(bm => bm.Board)
                .WithMany(b => b.BoardMembers)
                .HasForeignKey(bm => bm.BoardId);
            modelBuilder.Entity<BoardMember>()
                .HasOne(bm => bm.User)
                .WithMany(u => u.BoardMembers)
                .HasForeignKey(bm => bm.UserId);

            // Relación Invitación de Tablero ↔ Tablero (N:1)
            modelBuilder.Entity<BoardInvitation>()
                .HasOne(i => i.Board)
                .WithMany()
                .HasForeignKey(i => i.BoardId);

            // Relación Logro de Usuario ↔ Usuario (1:N)
            modelBuilder.Entity<UserAchievement>()
                .HasOne(a => a.User)
                .WithMany(u => u.Achievements)
                .HasForeignKey(a => a.UserId);

            // Relación Equipo ↔ Propietario (N:1, eliminación en cascada)
            modelBuilder.Entity<Team>()
                .HasOne(t => t.Owner)
                .WithMany(u => u.Teams)
                .HasForeignKey(t => t.OwnerId)
                .OnDelete(DeleteBehavior.Cascade);

            // Relación Equipo ↔ Miembro de Equipo (N:M, clave compuesta, eliminación en cascada)
            modelBuilder.Entity<TeamMember>()
                .HasKey(tm => new { tm.TeamId, tm.UserId });
            modelBuilder.Entity<TeamMember>()
                .HasOne(tm => tm.Team)
                .WithMany(t => t.Members)
                .HasForeignKey(tm => tm.TeamId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<TeamMember>()
                .HasOne(tm => tm.User)
                .WithMany(u => u.TeamMembers)
                .HasForeignKey(tm => tm.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Relación Invitación de Equipo ↔ Equipo (N:1)
            modelBuilder.Entity<TeamInvitation>()
                .HasOne(i => i.Team)
                .WithMany()
                .HasForeignKey(i => i.TeamId);

            // Relación Favoritos de Tablero (N:M, clave compuesta)
            modelBuilder.Entity<FavoriteBoards>()
                .HasKey(f => new { f.UserId, f.BoardId });

            // Relación Dependencia entre Ítems (N:1 restrictivo)
            modelBuilder.Entity<Dependency>()
                .HasOne(d => d.FromTask)
                .WithMany()
                .HasForeignKey(d => d.FromTaskId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Dependency>()
                .HasOne(d => d.ToTask)
                .WithMany()
                .HasForeignKey(d => d.ToTaskId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relación Comentario ↔ Ítem (1:N, eliminación en cascada)
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Item)
                .WithMany(i => i.Comments)
                .HasForeignKey(c => c.ItemId)
                .OnDelete(DeleteBehavior.Cascade);

            // Relación Comentario ↔ Usuario (N:1, eliminación en cascada)
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // ChatRoom ↔ ChatMessage (1:N, eliminación en cascada)
            modelBuilder.Entity<ChatRoom>()
                .HasMany(cr => cr.ChatMessages)
                .WithOne(m => m.ChatRoom)
                .HasForeignKey(m => m.ChatRoomId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
