package com.example.portableenderchest;

import org.bukkit.plugin.java.JavaPlugin;

public class PortableEnderChestPlugin extends JavaPlugin {

    private static PortableEnderChestPlugin instance;
    private EnderChestManager manager;

    @Override
    public void onEnable() {
        instance = this;
        saveDefaultConfig();

        this.manager = new EnderChestManager(this);

        getCommand("enderchest").setExecutor(new EnderChestCommand(this, manager));

        getLogger().info("PortableEnderChest v" + getPluginMeta().getVersion() + " zostal wlaczony!");
    }

    @Override
    public void onDisable() {
        getLogger().info("PortableEnderChest zostal wylaczony!");
    }

    public static PortableEnderChestPlugin getInstance() {
        return instance;
    }

    public EnderChestManager getManager() {
        return manager;
    }
}