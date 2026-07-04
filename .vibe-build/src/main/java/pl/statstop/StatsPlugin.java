package pl.statstop;

import net.kyori.adventure.text.minimessage.MiniMessage;
import org.bukkit.plugin.java.JavaPlugin;

import java.sql.SQLException;

public class StatsPlugin extends JavaPlugin {

    private static StatsPlugin instance;
    private MiniMessage miniMessage;
    private StatsManager statsManager;
    private ConfigManager configManager;

    @Override
    public void onEnable() {
        instance = this;
        saveDefaultConfig();

        this.miniMessage = MiniMessage.miniMessage();
        this.configManager = new ConfigManager(this);

        try {
            this.statsManager = new StatsManager(this);
            this.statsManager.initDatabase();
            this.statsManager.loadAllStatsIntoCache();
        } catch (SQLException e) {
            getLogger().severe("Nie udalo sie zainicjalizowac bazy danych: " + e.getMessage());
            getServer().getPluginManager().disablePlugin(this);
            return;
        }

        // Rejestracja listenera
        getServer().getPluginManager().registerEvents(new KillListener(this), this);
        getServer().getPluginManager().registerEvents(new TopMenuListener(this), this);

        // Rejestracja komend
        StatsCommand statsCmd = new StatsCommand(this);
        TopCommand topCmd = new TopCommand(this);
        getCommand("statstop").setExecutor(statsCmd);
        getCommand("statstop").setTabCompleter(statsCmd);
        getCommand("topkills").setExecutor(topCmd);
        getCommand("topkills").setTabCompleter(topCmd);

        // Start auto-save
        int interval = configManager.getAutoSaveMinutes() * 60 * 20;
        new AutoSaveTask(this).runTaskTimerAsynchronously(this, interval, interval);

        getLogger().info("StatsTop v1.0.0 wlaczony pomyslnie!");
    }

    @Override
    public void onDisable() {
        if (statsManager != null) {
            try {
                statsManager.saveAllDirty();
            } catch (SQLException e) {
                getLogger().severe("Blad podczas zamykania bazy: " + e.getMessage());
            }
        }
    }

    public static StatsPlugin getInstance() {
        return instance;
    }

    public MiniMessage getMiniMessage() {
        return miniMessage;
    }

    public StatsManager getStatsManager() {
        return statsManager;
    }

    public ConfigManager getConfigManager() {
        return configManager;
    }
}