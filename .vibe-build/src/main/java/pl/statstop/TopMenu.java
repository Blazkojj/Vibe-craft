package pl.statstop;

import net.kyori.adventure.text.Component;
import org.bukkit.Bukkit;
import org.bukkit.Material;
import org.bukkit.OfflinePlayer;
import org.bukkit.inventory.Inventory;
import org.bukkit.inventory.InventoryHolder;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.ItemMeta;
import org.bukkit.inventory.meta.SkullMeta;
import org.jetbrains.annotations.NotNull;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class TopMenu implements InventoryHolder {

    private final StatsPlugin plugin;
    private final String type;
    private final int page;
    private Inventory inventory;

    public TopMenu(StatsPlugin plugin, String type, int page) {
        this.plugin = plugin;
        this.type = type;
        this.page = page;
    }

    public String getType() { return type; }
    public int getPage() { return page; }

    public Inventory build() {
        String titleRaw = plugin.getConfigManager().getGuiTitle().replace("%page%", String.valueOf(page));
        Component title = plugin.getMiniMessage().deserialize(titleRaw);
        int size = plugin.getConfigManager().getGuiSize();
        this.inventory = Bukkit.createInventory(this, size, title);

        Material filler = safeMaterial(plugin.getConfigManager().getFillerItem(), Material.GRAY_STAINED_GLASS_PANE);
        ItemStack fillerItem = new ItemStack(filler);
        ItemMeta fillerMeta = fillerItem.getItemMeta();
        fillerMeta.displayName(Component.empty());
        fillerItem.setItemMeta(fillerMeta);

        for (int i = 0; i < size; i++) {
            inventory.setItem(i, fillerItem);
        }

        int perPage = plugin.getConfigManager().getGuiMaxPerPage();
        int offset = (page - 1) * perPage;
        int totalNeeded = offset + perPage;
        List<Map.Entry<UUID, StatsHolder>> top = plugin.getStatsManager().getTopBy(type, totalNeeded);

        for (int i = 0; i < perPage && (offset + i) < top.size(); i++) {
            Map.Entry<UUID, StatsHolder> e = top.get(offset + i);
            int rank = offset + i + 1;
            ItemStack item = createPlayerItem(e.getKey(), e.getValue(), rank);
            inventory.setItem(i, item);
        }

        // Nawigacja
        int slotPrev = plugin.getConfigManager().getSlotPrevious();
        int slotNext = plugin.getConfigManager().getSlotNext();
        int slotClose = plugin.getConfigManager().getSlotClose();

        if (page > 1) {
            inventory.setItem(slotPrev, createNav(plugin.getConfigManager().getPreviousItem(),
                    plugin.getConfigManager().getPreviousName(), "prev"));
        }
        int maxPage = (int) Math.ceil((double) top.size() / perPage);
        // Recalc total more accurately:
        int totalPlayers = plugin.getStatsManager().getCache().size();
        maxPage = (int) Math.max(1, Math.ceil((double) totalPlayers / perPage));
        if (page < maxPage) {
            inventory.setItem(slotNext, createNav(plugin.getConfigManager().getNextItem(),
                    plugin.getConfigManager().getNextName(), "next"));
        }
        inventory.setItem(slotClose, createNav(plugin.getConfigManager().getCloseItem(),
                plugin.getConfigManager().getCloseName(), "close"));

        return inventory;
    }

    private ItemStack createNav(String matName, String displayName, String pdcTag) {
        Material mat = safeMaterial(matName, Material.ARROW);
        ItemStack item = new ItemStack(mat);
        ItemMeta meta = item.getItemMeta();
        meta.displayName(plugin.getMiniMessage().deserialize(displayName));
        meta.getPersistentDataContainer().set(
                new org.bukkit.NamespacedKey(plugin, "nav"),
                org.bukkit.persistence.PersistentDataType.STRING,
                pdcTag
        );
        item.setItemMeta(meta);
        return item;
    }

    private ItemStack createPlayerItem(UUID uuid, StatsHolder holder, int rank) {
        ItemStack item;
        ItemMeta meta;

        if (plugin.getConfigManager().usePlayerHeads()) {
            item = new ItemStack(Material.PLAYER_HEAD);
            meta = item.getItemMeta();
            if (meta instanceof SkullMeta skull) {
                OfflinePlayer op = Bukkit.getOfflinePlayer(uuid);
                skull.setOwningPlayer(op);
            }
        } else {
            // Fallback - crown-like item for top 3
            if (rank == 1) item = new ItemStack(Material.GOLDEN_HELMET);
            else if (rank == 2) item = new ItemStack(Material.IRON_HELMET);
            else if (rank == 3) item = new ItemStack(Material.DIAMOND_HELMET);
            else item = new ItemStack(Material.STONE);
            meta = item.getItemMeta();
        }

        String name = plugin.getStatsManager().resolveName(uuid);
        String displayRaw = plugin.getConfigManager().getGuiDisplayName()
                .replace("%player%", name)
                .replace("%rank%", String.valueOf(rank));
        meta.displayName(plugin.getMiniMessage().deserialize(displayRaw));

        List<Component> lore = new ArrayList<>();
        for (String line : plugin.getConfigManager().getGuiLore()) {
            String parsed = line
                    .replace("%rank%", String.valueOf(rank))
                    .replace("%player%", name)
                    .replace("%player_kills%", String.valueOf(holder.getPlayerKills()))
                    .replace("%mob_kills%", String.valueOf(holder.getMobKills()))
                    .replace("%deaths%", String.valueOf(holder.getDeaths()))
                    .replace("%kdr%", String.format("%.2f", holder.getKDR()));
            lore.add(plugin.getMiniMessage().deserialize(parsed));
        }
        meta.lore(lore);

        // PDC do identyfikacji
        meta.getPersistentDataContainer().set(
                new org.bukkit.NamespacedKey(plugin, "top_uuid"),
                org.bukkit.persistence.PersistentDataType.STRING,
                uuid.toString()
        );

        item.setItemMeta(meta);
        return item;
    }

    private Material safeMaterial(String name, Material fallback) {
        try {
            return Material.valueOf(name.toUpperCase());
        } catch (IllegalArgumentException e) {
            return fallback;
        }
    }

    @Override
    public @NotNull Inventory getInventory() {
        return inventory;
    }
}