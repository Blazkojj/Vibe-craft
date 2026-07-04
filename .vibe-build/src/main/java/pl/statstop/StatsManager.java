package pl.statstop;

import org.bukkit.Bukkit;
import org.bukkit.OfflinePlayer;

import java.sql.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class StatsManager {

    private final StatsPlugin plugin;
    private final Map<UUID, StatsHolder> cache = new ConcurrentHashMap<>();
    private Connection connection;

    public StatsManager(StatsPlugin plugin) {
        this.plugin = plugin;
    }

    public void initDatabase() throws SQLException {
        Connection conn = DriverManager.getConnection("jdbc:sqlite:" + plugin.getDataFolder().getAbsolutePath() + "/stats.db");
        try (Statement stmt = conn.createStatement()) {
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS stats (" +
                    "uuid TEXT PRIMARY KEY, " +
                    "last_name TEXT, " +
                    "player_kills INTEGER DEFAULT 0, " +
                    "mob_kills INTEGER DEFAULT 0, " +
                    "deaths INTEGER DEFAULT 0, " +
                    "last_updated INTEGER DEFAULT 0)");
            stmt.executeUpdate("CREATE INDEX IF NOT EXISTS idx_player_kills ON stats(player_kills DESC)");
            stmt.executeUpdate("CREATE INDEX IF NOT EXISTS idx_mob_kills ON stats(mob_kills DESC)");
            stmt.executeUpdate("CREATE INDEX IF NOT EXISTS idx_deaths ON stats(deaths DESC)");
        }
        this.connection = conn;
    }

    public Connection getConnection() throws SQLException {
        if (connection == null || connection.isClosed()) {
            initDatabase();
        }
        return connection;
    }

    public void loadAllStatsIntoCache() throws SQLException {
        Connection conn = getConnection();
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT uuid, last_name, player_kills, mob_kills, deaths FROM stats")) {
            while (rs.next()) {
                UUID uuid = UUID.fromString(rs.getString("uuid"));
                StatsHolder holder = new StatsHolder(
                        rs.getInt("player_kills"),
                        rs.getInt("mob_kills"),
                        rs.getInt("deaths"),
                        rs.getString("last_name")
                );
                cache.put(uuid, holder);
            }
        }
        plugin.getLogger().info("Zaladowano " + cache.size() + " graczy z bazy do cache.");
    }

    public StatsHolder getOrCreate(UUID uuid, String name) {
        return cache.computeIfAbsent(uuid, k -> {
            StatsHolder holder = new StatsHolder(0, 0, 0, name);
            // Zapis do bazy asynchronicznie
            Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
                try {
                    insertNew(uuid, name);
                } catch (SQLException e) {
                    plugin.getLogger().warning("Blad przy tworzeniu wpisu gracza: " + e.getMessage());
                }
            });
            return holder;
        });
    }

    private void insertNew(UUID uuid, String name) throws SQLException {
        Connection conn = getConnection();
        try (PreparedStatement ps = conn.prepareStatement(
                "INSERT OR IGNORE INTO stats (uuid, last_name, player_kills, mob_kills, deaths, last_updated) VALUES (?, ?, 0, 0, 0, ?)")) {
            ps.setString(1, uuid.toString());
            ps.setString(2, name);
            ps.setLong(3, System.currentTimeMillis());
            ps.executeUpdate();
        }
    }

    public void saveAllDirty() throws SQLException {
        Connection conn = getConnection();
        boolean autoCommit = conn.getAutoCommit();
        conn.setAutoCommit(false);
        try (PreparedStatement ps = conn.prepareStatement(
                "UPDATE stats SET last_name=?, player_kills=?, mob_kills=?, deaths=?, last_updated=? WHERE uuid=?")) {
            for (Map.Entry<UUID, StatsHolder> e : cache.entrySet()) {
                StatsHolder h = e.getValue();
                if (!h.isDirty()) continue;
                ps.setString(1, h.getLastName());
                ps.setInt(2, h.getPlayerKills());
                ps.setInt(3, h.getMobKills());
                ps.setInt(4, h.getDeaths());
                ps.setLong(5, System.currentTimeMillis());
                ps.setString(6, e.getKey().toString());
                ps.addBatch();
                h.setDirty(false);
            }
            ps.executeBatch();
            conn.commit();
        } finally {
            conn.setAutoCommit(autoCommit);
        }
    }

    public List<Map.Entry<UUID, StatsHolder>> getTopBy(String type, int limit) {
        Comparator<Map.Entry<UUID, StatsHolder>> comparator;
        switch (type.toLowerCase()) {
            case "mob" -> comparator = Comparator.comparingInt((Map.Entry<UUID, StatsHolder> e) -> e.getValue().getMobKills()).reversed();
            case "deaths" -> comparator = Comparator.comparingInt((Map.Entry<UUID, StatsHolder> e) -> e.getValue().getDeaths()).reversed();
            default -> comparator = Comparator.comparingInt((Map.Entry<UUID, StatsHolder> e) -> e.getValue().getPlayerKills()).reversed();
        }
        return cache.entrySet().stream()
                .sorted(comparator)
                .limit(limit)
                .toList();
    }

    public void resetPlayer(UUID uuid) {
        StatsHolder h = cache.get(uuid);
        if (h != null) h.reset();
        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
            try {
                Connection conn = getConnection();
                try (PreparedStatement ps = conn.prepareStatement(
                        "UPDATE stats SET player_kills=0, mob_kills=0, deaths=0, last_updated=? WHERE uuid=?")) {
                    ps.setLong(1, System.currentTimeMillis());
                    ps.setString(2, uuid.toString());
                    ps.executeUpdate();
                }
            } catch (SQLException e) {
                plugin.getLogger().warning("Blad przy resetowaniu gracza: " + e.getMessage());
            }
        });
    }

    public void resetAll() {
        for (StatsHolder h : cache.values()) h.reset();
        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
            try {
                Connection conn = getConnection();
                try (Statement stmt = conn.createStatement()) {
                    stmt.executeUpdate("UPDATE stats SET player_kills=0, mob_kills=0, deaths=0, last_updated=" + System.currentTimeMillis());
                }
            } catch (SQLException e) {
                plugin.getLogger().warning("Blad przy resetowaniu wszystkich: " + e.getMessage());
            }
        });
    }

    public Map<UUID, StatsHolder> getCache() {
        return cache;
    }

    public String resolveName(UUID uuid) {
        StatsHolder h = cache.get(uuid);
        if (h != null && h.getLastName() != null && !h.getLastName().isEmpty()) {
            return h.getLastName();
        }
        OfflinePlayer op = Bukkit.getOfflinePlayer(uuid);
        String name = op.getName();
        if (name == null) name = "?";
        return name;
    }
}