package com.cosmic.crates;

import com.cosmic.crates.commands.CosmicCratesCommand;
import com.cosmic.crates.crate.CrateManager;
import com.cosmic.crates.gui.CrateMenuListener;
import com.cosmic.crates.hologram.HologramManager;
import com.cosmic.crates.key.KeyManager;
import com.cosmic.crates.listeners.CrateBreakListener;
import com.cosmic.crates.listeners.CrateInteractListener;
import com.cosmic.crates.utils.ColorUtil;
import org.bukkit.command.CommandSender;
import org.bukkit.plugin.java.JavaPlugin;

public class CosmicCratesPlugin extends JavaPlugin {

    private static CosmicCratesPlugin instance;

    private CrateManager crateManager;
    private KeyManager keyManager;
    private HologramManager hologramManager;

    @Override
    public void onEnable() {
        instance = this;
        saveDefaultConfig();

        this.keyManager = new KeyManager(this);
        this.hologramManager = new HologramManager(this);
        this.crateManager = new CrateManager(this);

        // Rejestracja listenerow
        getServer().getPluginManager().registerEvents(new CrateInteractListener(this), this);
        getServer().getPluginManager().registerEvents(new CrateBreakListener(this), this);
        getServer().getPluginManager().registerEvents(new CrateMenuListener(this), this);

        // Rejestracja komendy
        CosmicCratesCommand cmd = new CosmicCratesCommand(this);
        getCommand("cosmiccrates").setExecutor(cmd);
        getCommand("cosmiccrates").setTabCompleter(cmd);

        // Ladowanie skrzynek z konfiguracji
        crateManager.loadAll();

        getLogger().info(ColorUtil.color("&aCosmicCrates wlaczony! Wersja: " + getDescription().getVersion()));
    }

    @Override
    public void onDisable() {
        if (hologramManager != null) {
            hologramManager.removeAll();
        }
        if (crateManager != null) {
            crateManager.saveAll();
        }
    }

    public void msg(CommandSender s, String path) {
        String prefix = getConfig().getString("messages.prefix", "");
        String raw = getConfig().getString("messages." + path, "&cBrak wiadomosci: " + path);
        s.sendMessage(ColorUtil.color(prefix + raw));
    }

    public static CosmicCratesPlugin getInstance() {
        return instance;
    }

    public CrateManager getCrateManager() { return crateManager; }
    public KeyManager getKeyManager() { return keyManager; }
    public HologramManager getHologramManager() { return hologramManager; }
}