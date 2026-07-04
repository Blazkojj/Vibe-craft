package com.cosmic.crates.gui;

import com.cosmic.crates.CosmicCratesPlugin;
import com.cosmic.crates.crate.Crate;
import com.cosmic.crates.utils.ColorUtil;
import com.cosmic.crates.utils.ItemBuilder;
import org.bukkit.Bukkit;
import org.bukkit.Material;
import org.bukkit.entity.Player;
import org.bukkit.inventory.Inventory;
import org.bukkit.inventory.ItemStack;

import java.util.ArrayList;
import java.util.List;

public class CrateMenu {

    public static final String MAIN_TITLE = ColorUtil.color("&8Kosmiczne Skrzynki");
    public static final String PREVIEW_TITLE_PREFIX = "&8Podglad: ";

    public static void openMainMenu(CosmicCratesPlugin plugin, Player player) {
        Inventory inv = Bukkit.createInventory(null, 27, MAIN_TITLE);
        
        int slot = 10;
        for (Crate crate : plugin.getCrateManager().getAll().stream().distinct().toList()) {
            ItemStack icon = new ItemBuilder(crate.getBlockMaterial().toUpperCase())
                .name(ColorUtil.color(crate.getDisplayName()))
                .lore(getCrateLore(plugin, player, crate))
                .glow(crate.isGlow())
                .build();
            
            inv.setItem(slot, icon);
            slot += 2;
            if (slot > 16) break; // Zabezpieczenie
        }
        
        player.openInventory(inv);
    }

    private static List<String> getCrateLore(CosmicCratesPlugin plugin, Player player, Crate crate) {
        List<String> lore = new ArrayList<>();
        lore.add(ColorUtil.color("&7Kliknij, aby zobaczyc nagrody."));
        int keys = plugin.getKeyManager().countKeysOfType(player, crate.getTypeId());
        lore.add(ColorUtil.color("&7Twoje klucze: &e" + keys));
        return lore;
    }

    public static void openPreview(CosmicCratesPlugin plugin, Player player, Crate crate) {
        String title = ColorUtil.color(PREVIEW_TITLE_PREFIX + crate.getDisplayName());
        Inventory inv = Bukkit.createInventory(null, 54, title);
        
        // Wypelnienie nagrodami
        int slot = 10;
        for (Crate.Reward reward : crate.getRewards()) {
            String matName = reward.material() != null ? reward.material() : "PAPER";
            ItemStack item = new ItemBuilder(matName.toUpperCase())
                .name(ColorUtil.color(reward.display()))
                .lore(ColorUtil.color("&7Szansa: &e" + calculateChance(crate, reward) + "%"))
                .build();
            
            inv.setItem(slot, item);
            slot++;
            if ((slot + 1) % 9 == 0) slot += 2; // Przeskoki na kolejny rzad
            if (slot > 43) break;
        }
        
        // Przycisk "Otworz"
        ItemStack openButton = new ItemBuilder(Material.EMERALD)
            .name(ColorUtil.color("&a&lOTWORZ SKRZYNKE"))
            .lore(ColorUtil.color("&7Kliknij tutaj, aby uzyc klucza."), ColorUtil.color("&7Wymagany klucz: &e" + crate.getKey().displayName()))
            .glow(true)
            .build();
        inv.setItem(49, openButton);
        
        // Przycisk "Wroc"
        ItemStack backButton = new ItemBuilder(Material.ARROW)
            .name(ColorUtil.color("&c&lWROC"))
            .build();
        inv.setItem(45, backButton);
        
        player.openInventory(inv);
    }

    private static int calculateChance(Crate crate, Crate.Reward reward) {
        int total = crate.getTotalWeight();
        if (total <= 0) return 0;
        return (reward.weight() * 100) / total;
    }
}