package pl.statstop;

import net.kyori.adventure.sound.Sound;
import org.bukkit.NamespacedKey;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.inventory.InventoryClickEvent;
import org.bukkit.event.inventory.InventoryCloseEvent;
import org.bukkit.persistence.PersistentDataType;

public class TopMenuListener implements Listener {

    private final StatsPlugin plugin;

    public TopMenuListener(StatsPlugin plugin) {
        this.plugin = plugin;
    }

    @EventHandler
    public void onClick(InventoryClickEvent event) {
        if (!(event.getInventory().getHolder() instanceof TopMenu menu)) return;
        event.setCancelled(true);
        if (!(event.getWhoClicked() instanceof Player player)) return;
        if (event.getCurrentItem() == null) return;

        var pdc = event.getCurrentItem().getItemMeta().getPersistentDataContainer();
        String nav = pdc.get(new NamespacedKey(plugin, "nav"), PersistentDataType.STRING);
        if (nav == null) return;

        switch (nav) {
            case "prev" -> {
                if (menu.getPage() > 1) {
                    TopMenu newMenu = new TopMenu(plugin, menu.getType(), menu.getPage() - 1);
                    player.openInventory(newMenu.build());
                }
            }
            case "next" -> {
                TopMenu newMenu = new TopMenu(plugin, menu.getType(), menu.getPage() + 1);
                player.openInventory(newMenu.build());
            }
            case "close" -> player.closeInventory();
        }
    }
}