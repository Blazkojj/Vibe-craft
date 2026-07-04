package com.cosmic.crates.listeners;

import com.cosmic.crates.CosmicCratesPlugin;
import com.cosmic.crates.crate.Crate;
import com.cosmic.crates.gui.CrateRollTask;
import com.cosmic.crates.utils.ColorUtil;
import org.bukkit.Location;
import org.bukkit.Material;
import org.bukkit.Sound;
import org.bukkit.block.Block;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.block.Action;
import org.bukkit.event.player.PlayerInteractEvent;
import org.bukkit.inventory.EquipmentSlot;
import org.bukkit.inventory.ItemStack;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class CrateInteractListener implements Listener {

    private final CosmicCratesPlugin plugin;
    private final Map<UUID, Long> cooldowns = new HashMap<>();

    public CrateInteractListener(CosmicCratesPlugin plugin) {
        this.plugin = plugin;
    }

    @EventHandler
    public void onInteract(PlayerInteractEvent event) {
        if (event.getHand() != EquipmentSlot.HAND) return;
        if (event.getAction() != Action.RIGHT_CLICK_BLOCK) return;

        Block block = event.getClickedBlock();
        if (block == null) return;

        Location loc = block.getLocation();
        Crate crate = plugin.getCrateManager().getCrateAtLocation(loc);
        
        if (crate != null) {
            event.setCancelled(true); // Zapobiegaj otwieraniu domyslnemu inventory shulker boxa
            
            Player player = event.getPlayer();
            
            // Cooldown
            int cd = plugin.getConfig().getInt("settings.open-cooldown-seconds", 3);
            if (cooldowns.containsKey(player.getUniqueId())) {
                long secondsLeft = ((cooldowns.get(player.getUniqueId()) / 1000) + cd) - (System.currentTimeMillis() / 1000);
                if (secondsLeft > 0) {
                    player.sendMessage(ColorUtil.color(plugin.getConfig().getString("messages.prefix", "") +
                        plugin.getConfig().getString("messages.cooldown-active", "").replace("{seconds}", String.valueOf(secondsLeft))));
                    return;
                }
            }
            
            ItemStack itemInHand = player.getInventory().getItemInMainHand();
            
            // Sprawdz czy gracz trzyma odpowiedni klucz
            if (!plugin.getKeyManager().isKey(itemInHand)) {
                player.sendTitle(
                    ColorUtil.color(plugin.getConfig().getString("titles.no-permission-title", "")),
                    ColorUtil.color(plugin.getConfig().getString("titles.no-permission-subtitle", "")),
                    10, 40, 10
                );
                player.sendMessage(ColorUtil.color(plugin.getConfig().getString("messages.prefix", "") +
                    plugin.getConfig().getString("messages.no-key-in-hand", "")));
                return;
            }
            
            String keyType = plugin.getKeyManager().getKeyType(itemInHand);
            if (!crate.getTypeId().equals(keyType)) {
                player.sendMessage(ColorUtil.color(plugin.getConfig().getString("messages.prefix", "") +
                    plugin.getConfig().getString("messages.key-does-not-match", "")));
                return;
            }
            
            // Zuzyj klucz
            if (!plugin.getKeyManager().consumeKeyOfType(player, crate.getTypeId(), 1)) {
                player.sendMessage(ColorUtil.color(plugin.getConfig().getString("messages.prefix", "") +
                    plugin.getConfig().getString("messages.no-key-in-hand", "")));
                return;
            }
            
            cooldowns.put(player.getUniqueId(), System.currentTimeMillis());
            
            // Rozpocznij animacje losowania
            new CrateRollTask(plugin, player, crate).start();
        }
    }
}