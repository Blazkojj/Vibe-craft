package com.cosmic.crates.gui;

import com.cosmic.crates.CosmicCratesPlugin;
import com.cosmic.crates.crate.Crate;
import com.cosmic.crates.utils.ColorUtil;
import com.cosmic.crates.utils.ItemBuilder;
import org.bukkit.Bukkit;
import org.bukkit.Material;
import org.bukkit.Particle;
import org.bukkit.Sound;
import org.bukkit.entity.Player;
import org.bukkit.inventory.Inventory;
import org.bukkit.inventory.ItemStack;
import org.bukkit.scheduler.BukkitRunnable;

import java.util.List;
import java.util.Random;

public class CrateRollTask {

    private final CosmicCratesPlugin plugin;
    private final Player player;
    private final Crate crate;
    private Inventory inv;
    private int ticksRun = 0;
    private int currentInterval;
    private int currentRewardIndex = 0;

    public CrateRollTask(CosmicCratesPlugin plugin, Player player, Crate crate) {
        this.plugin = plugin;
        this.player = player;
        this.crate = crate;
        this.currentInterval = plugin.getConfig().getInt("settings.roll-min-interval", 2);
    }

    public void start() {
        inv = Bukkit.createInventory(null, 27, ColorUtil.color("&8Losowanie: " + crate.getDisplayName()));
        
        // Wypelnienie tla szklem
        ItemStack glass = new ItemBuilder("BLACK_STAINED_GLASS_PANE").name(" ").build();
        for (int i = 0; i < 27; i++) {
            inv.setItem(i, glass);
        }
        
        // Ramka
        ItemStack frame = new ItemBuilder("YELLOW_STAINED_GLASS_PANE").name(" ").build();
        for (int i = 0; i < 27; i++) {
            if (i < 9 || i > 17 || i % 9 == 0 || i % 9 == 8) {
                inv.setItem(i, frame);
            }
        }
        
        player.openInventory(inv);
        playSound(crate.getSounds().open());
        
        runLoop();
    }

    private void runLoop() {
        new BukkitRunnable() {
            @Override
            public void run() {
                if (!player.isOnline() || ticksRun > plugin.getConfig().getInt("settings.roll-duration-ticks", 100)) {
                    finalizeRoll();
                    cancel();
                    return;
                }
                
                // Aktualizuj nagrode na srodku (slot 13)
                List<Crate.Reward> rewards = crate.getRewards();
                currentRewardIndex = (currentRewardIndex + 1) % rewards.size();
                Crate.Reward rewardToShow = rewards.get(currentRewardIndex);
                
                String matName = rewardToShow.material() != null ? rewardToShow.material() : "PAPER";
                ItemStack display = new ItemBuilder(matName.toUpperCase())
                    .name(ColorUtil.color(rewardToShow.display()))
                    .build();
                
                inv.setItem(13, display);
                playSound(crate.getSounds().roll());
                
                ticksRun += currentInterval;
                
                // Zwalnianie tempo
                if (ticksRun > plugin.getConfig().getInt("settings.roll-duration-ticks", 100) / 2) {
                    currentInterval += 2;
                }
                
                if (currentInterval > 10) currentInterval = 10; // Max delay
            }
        }.runTaskTimer(plugin, 0L, currentInterval);
    }

    private void finalizeRoll() {
        // Wybierz ostateczna nagrode na podstawie wag
        Crate.Reward finalReward = selectRandomReward();
        
        // Wyswietl ja
        String matName = finalReward.material() != null ? finalReward.material() : "PAPER";
        ItemStack finalDisplay = new ItemBuilder(matName.toUpperCase())
            .name(ColorUtil.color(finalReward.display()))
            .glow(true)
            .build();
        inv.setItem(13, finalDisplay);
        
        // Wykonaj komendy
        for (String cmd : finalReward.commands()) {
            Bukkit.dispatchCommand(Bukkit.getConsoleSender(), cmd.replace("%player%", player.getName()));
        }
        
        // Efekty
        playSound(crate.getSounds().win());
        spawnParticles(crate.getParticles().win());
        
        // Title
        player.sendTitle(
            ColorUtil.color(plugin.getConfig().getString("titles.win-title", "")),
            ColorUtil.color(plugin.getConfig().getString("titles.win-subtitle", "").replace("{reward}", finalReward.display())),
            10, 60, 10
        );
        
        // Zamknij po 3 sekundach
        new BukkitRunnable() {
            @Override
            public void run() {
                player.closeInventory();
            }
        }.runTaskLater(plugin, 60L);
    }

    private Crate.Reward selectRandomReward() {
        List<Crate.Reward> rewards = crate.getRewards();
        int totalWeight = crate.getTotalWeight();
        int random = new Random().nextInt(totalWeight);
        int current = 0;
        for (Crate.Reward r : rewards) {
            current += r.weight();
            if (random < current) return r;
        }
        return rewards.get(rewards.size() - 1);
    }

    private void playSound(String soundName) {
        try {
            Sound sound = Sound.valueOf(soundName.toUpperCase());
            player.playSound(player.getLocation(), sound, 1.0f, 1.0f);
        } catch (Exception ignored) {}
    }

    private void spawnParticles(List<String> particleNames) {
        if (particleNames == null) return;
        for (String pName : particleNames) {
            try {
                Particle particle = Particle.valueOf(pName.toUpperCase());
                player.getWorld().spawnParticle(particle, player.getLocation().add(0, 1, 0), 30, 0.5, 0.5, 0.5, 0.1);
            } catch (Exception ignored) {}
        }
    }
}