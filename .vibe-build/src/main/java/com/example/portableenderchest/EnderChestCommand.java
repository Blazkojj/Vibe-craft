package com.example.portableenderchest;

import net.kyori.adventure.text.minimessage.MiniMessage;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.jetbrains.annotations.NotNull;

public class EnderChestCommand implements CommandExecutor {

    private final PortableEnderChestPlugin plugin;
    private final EnderChestManager manager;
    private final MiniMessage miniMessage;

    public EnderChestCommand(PortableEnderChestPlugin plugin, EnderChestManager manager) {
        this.plugin = plugin;
        this.manager = manager;
        this.miniMessage = MiniMessage.miniMessage();
    }

    @Override
    public boolean onCommand(@NotNull CommandSender sender, @NotNull Command command, @NotNull String label, @NotNull String[] args) {
        if (!(sender instanceof Player player)) {
            sendMessage(sender, "messages.player-only");
            return true;
        }
        if (!player.hasPermission("portableenderchest.use")) {
            sendMessage(player, "messages.no-permission");
            return true;
        }
        manager.openEnderChest(player);
        return true;
    }

    private void sendMessage(CommandSender sender, String path) {
        String prefix = plugin.getConfig().getString("messages.prefix", "");
        String message = prefix + plugin.getConfig().getString(path, "");
        sender.sendMessage(miniMessage.deserialize(message));
    }
}