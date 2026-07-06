package pl.advancedplots;

import org.bukkit.plugin.java.JavaPlugin;
import pl.advancedplots.command.PlotAdminCommand;
import pl.advancedplots.command.PlotCommand;
import pl.advancedplots.listener.PlayerMoveListener;
import pl.advancedplots.listener.ProtectionListener;
import pl.advancedplots.listener.SelectionListener;
import pl.advancedplots.manager.PlayerDataManager;
import pl.advancedplots.manager.PlotManager;
import pl.advancedplots.manager.VisualizationManager;
import pl.advancedplots.storage.PlotStorage;
import pl.advancedplots.util.MessageUtil;

import java.util.Objects;
import java.util.logging.Level;

public class AdvancedPlotsPlugin extends JavaPlugin {

    private staticAdvancedPlotsPlugin instance;
    private PlotManager plotManager;
    private PlayerDataManager playerDataManager;
    private VisualizationManager visualizationManager;
    private PlotStorage plotStorage;

    @Override
    public void onEnable() {
        instance = this;
        saveDefaultConfig();

        this.plotStorage = new PlotStorage(this);
        this.playerDataManager = new PlayerDataManager(this);
        this.plotManager = new PlotManager(this);
        this.visualizationManager = new VisualizationManager(this);

        // Wczytaj dane
        plotStorage.loadAll();
        playerDataManager.loadAll();

        // Rejestracja komend
        Objects.requireNonNull(getCommand("plot")).setExecutor(new PlotCommand(this));
        Objects.requireNonNull(getCommand("plot")).setTabCompleter(new PlotCommand(this));
        Objects.requireNonNull(getCommand("plotadmin")).setExecutor(new PlotAdminCommand(this));
        Objects.requireNonNull(getCommand("plotadmin")).setTabCompleter(new