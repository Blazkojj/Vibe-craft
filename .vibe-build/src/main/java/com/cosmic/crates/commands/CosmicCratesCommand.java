package com.cosmic.crates.commands;

import com.cosmic.crates.CosmicCratesPlugin;
import com.cosmic.crates.crate.Crate;
import com.cosmic.crates.gui.CrateMenu;
import com.cosmic.crates.utils.ColorUtil;
import org.bukkit.Bukkit;
import org.bukkit.FluidCollisionMode;
import org.bukkit.Location;
import org.bukkit.Material;
import org.bukkit.block.Block;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import org.bukkit.entity.Player;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class CosmicCratesCommand implements CommandExecutor, TabCompleter {
    private final CosmicCratesPlugin plugin;

    public CosmicCratesCommand(CosmicCratesPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender s, Command cmd, String label, String[] args) {
        if (args.length == 0) {
            sendUsage(s);
            return true;
        }
        String sub = args[0].toLowerCase();
        switch (sub) {
            case "give" -> handleGive(s, args);
            case "create" -> handleCreate(s, args);
            case "remove" -> handleRemove(s, args);
            case "list" -> handleList(s);
            case "reload" -> handleReload(s);
            case "keys" -> handleKeys(s, args);
            case "menu" -> handleMenu(s);
            default -> sendUsage(s);
        }
        return true;
    }

    private void handleGive(CommandSender s, String[] args) {
        if (!s.hasPermission("cosmiccrates.admin") && !s.hasPermission("cosmiccrates.give")) {
            plugin.msg(s, "no-permission");
            return;
        }
        if (args.length < 4) {
            s.sendMessage(ColorUtil.color("&7Uzyj: &e/cc give <gracz> <typ> <ilosc>"));
            return;
        }
        Player target = Bukkit.getPlayerExact(args[1]);
        if (target == null) {
            plugin.msg(s, "invalid-player");
            return;
        }
        String type = args[2];
        int amount;
        try {
            amount = Integer.parseInt(args[3]);
            if (amount <= 0 || amount > 64) {
                plugin.msg(s, "invalid-amount");
                return;
            }
        } catch (NumberFormatException e) {
            plugin.msg(s, "invalid-amount");
            return;
        }
        var key = plugin.getKeyManager().createKey(type, amount);
        if (key == null) {
            s.sendMessage(ColorUtil.color(plugin.getConfig().getString("messages.prefix", "") +
                    plugin.getConfig().getString("messages.invalid-key-type", "").replace("{type}", type)));
            return;
        }
        target.getInventory().addItem(key);
        target.sendMessage(ColorUtil.color(plugin.getConfig().getString("messages.prefix", "") +
                plugin.getConfig().getString("messages.key-received", "")
                        .replace("{amount}", String.valueOf(amount))
                        .replace("{type}", type)));
        s.sendMessage(ColorUtil.color(plugin.getConfig().getString("messages.prefix", "") +
                plugin.getConfig().getString("messages.key-given", "")
                        .replace("{amount}", String.valueOf(amount))
                        .replace("{type}", type)
                        .replace("{player}", target.getName())));
    }

    private void handleCreate(CommandSender s, String[] args) {
        if (!s.hasPermission("cosmiccrates.admin")) {
            plugin.msg(s, "no-permission");
            return;
        }
        if (!(s instanceof Player p)) {
            plugin.msg(s, "player-only");
            return;
        }
        if (args.length < 3) {
            s.sendMessage(ColorUtil.color("&7Uzyj: &e/cc create <nazwa> <typ>"));
            return;
        }
        String name = args[1];
        String type = args[2];
        if (plugin.getCrateManager().exists(name)) {
            plugin.msg(s, "crate-already-exists");
            return;
        }
        
        Block targetBlock = p.getTargetBlockExact(5, FluidCollisionMode.NEVER);
        if (targetBlock == null || targetBlock.getType() == Material.AIR) {
            s.sendMessage(ColorUtil.color(plugin.getConfig().getString("messages.prefix", "") + "&cMusisz patrzec na blok, aby utworzyc skrzynke!"));
            return;
        }
        
        Location loc = targetBlock.getLocation();
        boolean ok = plugin.getCrateManager().createCrate(name, type, loc);
        if (!ok) {
            s.sendMessage(ColorUtil.color(plugin.getConfig().getString("messages.prefix", "") +
                    plugin.getConfig().getString("messages.invalid-key-type", "").replace("{type}", type)));
            return;
        }
        s.sendMessage(ColorUtil.color(plugin.getConfig().getString("messages.prefix", "") +
                plugin.getConfig().getString("messages.crate-created", "")
                        .replace("{name}", name)
                        .replace("{type}", type)));
    }

    private void handleRemove(CommandSender s, String[] args) {
        if (!s.hasPermission("cosmiccrates.admin")) {
            plugin.msg(s, "no-permission");
            return;
        }
        if (args.length < 2) {
            s.sendMessage(ColorUtil.color("&7Uzyj: &e/cc remove <nazwa>"));
            return;
        }
        String name = args[1];
        if (!plugin.getCrateManager().exists(name)) {
            s.sendMessage(ColorUtil.color(plugin.getConfig().getString("messages.prefix", "") +
                    plugin.getConfig().getString("messages.crate-not-found", "").replace("{name}", name)));
            return;
        }
        Crate crate = plugin.getCrateManager().getCrateById(name);
        if (crate != null) {
            crate.getLocation().getBlock().setType(org.bukkit.Material.AIR);
        }
        plugin.getCrateManager().unregisterCrate(name);
        plugin.getCrateManager().removeCrateLocation(name);
        s.sendMessage(ColorUtil.color(plugin.getConfig().getString("messages.prefix", "") +
                plugin.getConfig().getString("messages.crate-removed", "").replace("{name}", name)));
    }

    private void handleList(CommandSender s) {
        if (!s.hasPermission("cosmiccrates.admin")) {
            plugin.msg(s, "no-permission");
            return;
        }
        s.sendMessage(ColorUtil.color(plugin.getConfig().getString("messages.crate-list-header", "")));
        for (Crate c : plugin.getCrateManager().getAll()) {
            Location loc = c.getLocation();
            String entry = plugin.getConfig().getString("messages.crate-list-entry", "")
                    .replace("{name}", c.getId())
                    .replace("{type}", c.getTypeId())
                    .replace("{world}", loc.getWorld().getName())
                    .replace("{x}", String.valueOf(loc.getBlockX()))
                    .replace("{y}", String.valueOf(loc.getBlockY()))
                    .replace("{z}", String.valueOf(loc.getBlockZ()));
            s.sendMessage(ColorUtil.color(entry));
        }
    }

    private void handleReload(CommandSender s) {
        if (!s.hasPermission("cosmiccrates.admin")) {
            plugin.msg(s, "no-permission");
            return;
        }
        plugin.reloadConfig();
        plugin.getCrateManager().loadAll();
        plugin.msg(s, "reloaded");
    }

    private void handleKeys(CommandSender s, String[] args) {
        if (!s.hasPermission("cosmiccrates.use")) {
            plugin.msg(s, "no-permission");
            return;
        }
        if (args.length < 2) {
            if (!(s instanceof Player p)) {
                plugin.msg(s, "player-only");
                return;
            }
            for (Crate c : plugin.getCrateManager().getAll()) {
                int count = plugin.getKeyManager().countKeysOfType(p, c.getTypeId());
                s.sendMessage(ColorUtil.color(plugin.getConfig().getString("messages.prefix", "") +
                        plugin.getConfig().getString("messages.keys-count", "")
                                .replace("{amount}", String.valueOf(count))
                                .replace("{type}", c.getTypeId())));
            }
            return;
        }
        if (!s.hasPermission("cosmiccrates.admin")) {
            plugin.msg(s, "no-permission");
            return;
        }
        Player target = Bukkit.getPlayerExact(args[1]);
        if (target == null) {
            plugin.msg(s, "invalid-player");
            return;
        }
        for (Crate c : plugin.getCrateManager().getAll()) {
            int count = plugin.getKeyManager().countKeysOfType(target, c.getTypeId());
            s.sendMessage(ColorUtil.color(plugin.getConfig().getString("messages.prefix", "") +
                    plugin.getConfig().getString("messages.keys-count-other", "")
                            .replace("{amount}", String.valueOf(count))
                            .replace("{type}", c.getTypeId())
                            .replace("{player}", target.getName())));
        }
    }

    private void handleMenu(CommandSender s) {
        if (!s.hasPermission("cosmiccrates.use")) {
            plugin.msg(s, "no-permission");
            return;
        }
        if (!(s instanceof Player p)) {
            plugin.msg(s, "player-only");
            return;
        }
        CrateMenu.openMainMenu(plugin, p);
    }

    private void sendUsage(CommandSender s) {
        s.sendMessage(ColorUtil.color(plugin.getConfig().getString("messages.usage", "&7Uzyj: &e/cc <give|create|remove|list|reload|keys|menu>")));
    }

    @Override
    public List<String> onTabComplete(CommandSender s, Command cmd, String label, String[] args) {
        if (args.length == 1) {
            List<String> subs = new ArrayList<>(Arrays.asList("give", "create", "remove", "list", "reload", "keys", "menu"));
            return subs.stream()
                    .filter(a -> a.startsWith(args[0].toLowerCase()))
                    .collect(Collectors.toList());
        }
        if (args.length == 2) {
            if (args[0].equalsIgnoreCase("give")) {
                return Bukkit.getOnlinePlayers().stream()
                        .map(Player::getName)
                        .filter(n -> n.toLowerCase().startsWith(args[1].toLowerCase()))
                        .collect(Collectors.toList());
            }
            if (args[0].equalsIgnoreCase("remove")) {
                return plugin.getCrateManager().getAll().stream()
                        .map(Crate::getId)
                        .filter(n -> n.toLowerCase().startsWith(args[1].toLowerCase()))
                        .collect(Collectors.toList());
            }
        }
        if (args.length == 3) {
            if (args[0].equalsIgnoreCase("give")) {
                return plugin.getConfig().getConfigurationSection("crates").getKeys(false).stream()
                        .filter(n -> n.toLowerCase().startsWith(args[2].toLowerCase()))
                        .collect(Collectors.toList());
            }
            if (args[0].equalsIgnoreCase("create")) {
                return plugin.getConfig().getConfigurationSection("crates").getKeys(false).stream()
                        .filter(n -> n.toLowerCase().startsWith(args[2].toLowerCase()))
                        .collect(Collectors.toList());
            }
        }
        if (args.length == 4) {
            if (args[0].equalsIgnoreCase("give")) {
                return Arrays.asList("1", "2", "4", "8", "16", "32", "64");
            }
        }
        return new ArrayList<>();
    }
}