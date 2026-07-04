package com.example.portableenderchest;

import net.kyori.adventure.sound.Sound;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.minimessage.MiniMessage;
import net.kyori.adventure.title.Title;
import org.bukkit.entity.Player;

import java.time.Duration;

public class EnderChestManager {

    private final PortableEnderChestPlugin plugin;
    private final MiniMessage miniMessage;

    public EnderChestManager(PortableEnderChestPlugin plugin) {
        this.plugin = plugin;
        this.miniMessage = MiniMessage.miniMessage();
    }

    public void openEnderChest(Player player) {
        player.openInventory(player.getEnderChest());
        playOpenEffects(player);
        sendOpenTitle(player);
    }

    private void playOpenEffects(Player player) {
        if (plugin.getConfig().getBoolean("effects.sound.enabled", true)) {
            String soundName = plugin.getConfig().getString("effects.sound.type", "BLOCK_ENDER_CHEST_OPEN");
            try {
                org.bukkit.Sound bukkitSound = org.bukkit.Sound.valueOf(soundName.toUpperCase());
                float volume = (float) plugin.getConfig().getDouble("effects.sound.volume", 1.0);
                float pitch = (float) plugin.getConfig().getDouble("effects.sound.pitch", 1.0);
                
                Sound adventureSound = Sound.sound(bukkitSound, Sound.Source.MASTER, volume, pitch);
                player.playSound(adventureSound);
            } catch (IllegalArgumentException ignored) {}
        }
    }

    private void sendOpenTitle(Player player) {
        if (!plugin.getConfig().getBoolean("title.enabled", true)) return;
        Component title = miniMessage.deserialize(plugin.getConfig().getString("title.title", ""));
        Component subtitle = miniMessage.deserialize(plugin.getConfig().getString("title.subtitle", ""));
        int fadeIn = plugin.getConfig().getInt("title.fade-in", 10);
        int stay = plugin.getConfig().getInt("title.stay", 40);
        int fadeOut = plugin.getConfig().getInt("title.fade-out", 10);

        Title.Times times = Title.Times.times(
                Duration.ofMillis(fadeIn * 50L),
                Duration.ofMillis(stay * 50L),
                Duration.ofMillis(fadeOut * 50L)
        );
        player.showTitle(Title.title(title, subtitle, times));
    }
}