package pl.statstop;

import org.bukkit.scheduler.BukkitRunnable;

import java.sql.SQLException;

public class AutoSaveTask extends BukkitRunnable {

    private final StatsPlugin plugin;

    public AutoSaveTask(StatsPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public void run() {
        try {
            plugin.getStatsManager().saveAllDirty();
        } catch (SQLException e) {
            plugin.getLogger().warning("Blad auto-save: " + e.getMessage());
        }
    }
}