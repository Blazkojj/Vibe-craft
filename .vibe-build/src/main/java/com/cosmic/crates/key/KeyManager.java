package com.cosmic.crates.key;

import com.cosmic.crates.CosmicCratesPlugin;
import com.cosmic.crates.crate.Crate;
import com.cosmic.crates.utils.ColorUtil;
import com.cosmic.crates.utils.ItemBuilder;
import org.bukkit.NamespacedKey;
import org.bukkit.entity.Player;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.PlayerInventory;
import org.bukkit.inventory.meta.ItemMeta;
import org.bukkit.persistence.PersistentDataContainer;
import org.bukkit.persistence.PersistentDataType;

public class KeyManager {
    public static final NamespacedKey KEY_TYPE = new NamespacedKey("cosmiccrates", "key_type");
    private final CosmicCratesPlugin plugin;

    public KeyManager(CosmicCratesPlugin plugin) {
        this.plugin = plugin;
    }

    public ItemStack createKey(String typeId, int amount) {
        Crate crate = plugin.getCrateManager().getAll().stream()
                .filter(c -> c.getTypeId().equals(typeId))
                .findFirst()
                .orElse(null);
        if (crate == null) return null;
        Crate.KeyDefinition def = crate.getKey();
        if (def == null) return null;

        ItemStack item = new ItemBuilder(def.material())
                .name(ColorUtil.color(def.displayName()))
                .lore(def.lore().stream().map(ColorUtil::color).toList())
                .glow(def.glow())
                .customModelData(def.customModelData())
                .amount(amount)
                .build();

        // KRYTYCZNA NAPRAWA: PDC trzeba ustawić na meta, a następnie zapisać meta z powrotem do itemu.
        // W Paper 1.21.4 getItemMeta() zwraca kopię, więc modyfikacja bez setItemMeta() jest tracona.
        ItemMeta meta = item.getItemMeta();
        if (meta != null) {
            PersistentDataContainer pdc = meta.getPersistentDataContainer();
            pdc.set(KEY_TYPE, PersistentDataType.STRING, typeId);
            item.setItemMeta(meta);
        }
        return item;
    }

    public boolean isKey(ItemStack item) {
        if (item == null || !item.hasItemMeta()) return false;
        PersistentDataContainer pdc = item.getItemMeta().getPersistentDataContainer();
        return pdc.has(KEY_TYPE, PersistentDataType.STRING);
    }

    public String getKeyType(ItemStack item) {
        if (!isKey(item)) return null;
        return item.getItemMeta().getPersistentDataContainer().get(KEY_TYPE, PersistentDataType.STRING);
    }

    public boolean hasKeyOfType(Player p, String typeId) {
        PlayerInventory inv = p.getInventory();
        for (ItemStack item : inv.getContents()) {
            if (isKey(item) && getKeyType(item).equals(typeId)) {
                return true;
            }
        }
        return false;
    }

    public int countKeysOfType(Player p, String typeId) {
        int count = 0;
        PlayerInventory inv = p.getInventory();
        for (ItemStack item : inv.getContents()) {
            if (isKey(item) && getKeyType(item).equals(typeId)) {
                count += item.getAmount();
            }
        }
        return count;
    }

    public boolean consumeKeyOfType(Player p, String typeId, int amount) {
        PlayerInventory inv = p.getInventory();
        int remaining = amount;
        int available = countKeysOfType(p, typeId);
        if (available < amount) return false;
        for (int i = 0; i < inv.getSize() && remaining > 0; i++) {
            ItemStack item = inv.getItem(i);
            if (!isKey(item) || !getKeyType(item).equals(typeId)) continue;
            int take = Math.min(item.getAmount(), remaining);
            item.setAmount(item.getAmount() - take);
            remaining -= take;
            if (item.getAmount() <= 0) inv.setItem(i, null);
        }
        p.updateInventory();
        return true;
    }
}