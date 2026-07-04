package com.cosmic.crates.gui;

import com.cosmic.crates.CosmicCratesPlugin;
import com.cosmic.crates.crate.Crate;
import com.cosmic.crates.utils.ColorUtil;
import org.bukkit.Material;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.inventory.InventoryClickEvent;
import org.bukkit.inventory.Inventory;
import org.bukkit.inventory.ItemStack;

public class CrateMenuListener implements Listener {
    private final CosmicCratesPlugin plugin;

    public CrateMenuListener(CosmicCratesPlugin plugin) {
        this.plugin = plugin;
    }

    @EventHandler
    public void onClick(InventoryClickEvent event) {
        if (!(event.getWhoClicked() instanceof Player player)) return;
        Inventory inv = event.getInventory();
        String title = event.getView().getTitle();

        if (title.equals(CrateMenu.MAIN_TITLE)) {
            event.setCancelled(true);
            ItemStack clicked = event.getCurrentItem();
            if (clicked == null || clicked.getType().isAir()) return;
            for (Crate crate : plugin.getCrateManager().getAll()) {
                if (ColorUtil.color(crate.getDisplayName()).equals(event.getCurrentItem().getItemMeta().getDisplayName())) {
                    CrateMenu.openPreview(plugin, player, crate);
                    return;
                }
            }
        } else if (title.startsWith(ColorUtil.color(CrateMenu.PREVIEW_TITLE_PREFIX))) {
            event.setCancelled(true);
            ItemStack clicked = event.getCurrentItem();
            if (clicked == null || clicked.getType().isAir()) return;
            String crateName = ColorUtil.color(clicked.getItemMeta().getDisplayName());
            if (clicked.getType() == Material.ARROW && crateName.equals(ColorUtil.color("&c&lWROC"))) {
                CrateMenu.openMainMenu(plugin, player);
                return;
            }
            if (clicked.getType() == Material.EMERALD) {
                String rawTitle = title.replace(ColorUtil.color(CrateMenu.PREVIEW_TITLE_PREFIX), "");
                for (Crate crate : plugin.getCrateManager().getAll()) {
                    if (ColorUtil.color(crate.getDisplayName()).equals(rawTitle)) {
                        if (plugin.getKeyManager().consumeKeyOfType(player, crate.getTypeId(), 1)) {
                            player.closeInventory();
                            new CrateRollTask(plugin, player, crate).start();
                        } else {
                            player.sendMessage(ColorUtil.color(plugin.getConfig().getString("messages.prefix", "") +
                                    plugin.getConfig().getString("messages.no-key-in-hand", "")));
                        }
                        return;
                    }
                }
            }
        }
    }
}