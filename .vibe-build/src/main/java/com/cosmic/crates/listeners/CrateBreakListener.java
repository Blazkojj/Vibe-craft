package com.cosmic.crates.listeners;

import com.cosmic.crates.CosmicCratesPlugin;
import com.cosmic.crates.crate.Crate;
import org.bukkit.block.Block;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.block.BlockBreakEvent;

public class CrateBreakListener implements Listener {

    private final CosmicCratesPlugin plugin;

    public CrateBreakListener(CosmicCratesPlugin plugin) {
        this.plugin = plugin;
    }

    @EventHandler
    public void onBreak(BlockBreakEvent event) {
        Block block = event.getBlock();
        Crate crate = plugin.getCrateManager().getCrateAtLocation(block.getLocation());
        if (crate != null) {
            event.setCancelled(true);
            event.getPlayer().sendMessage(plugin.getConfig().getString("messages.prefix", "") + 
                plugin.getConfig().getString("messages.crate-protected", ""));
        }
    }
}