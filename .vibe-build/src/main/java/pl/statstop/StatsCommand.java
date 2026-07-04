package pl.statstop;

import net.kyori.adventure.text.Component;
import org.bukkit.Bukkit;
import org.bukkit.OfflinePlayer;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import org.jetbrains.annotations.NotNull;

import java.util.ArrayList;
import java.util.List;

public class StatsCommand implements CommandExecutor, TabCompleter {

    private final StatsPlugin plugin;

    public StatsCommand(StatsPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(@NotNull CommandSender sender, @NotNull Command command, @NotNull String label, @NotNull String[] args) {
        if (!sender.hasPermission("statstop.admin")) {
            send(sender, "no-permission");
            return true;
        }

        if (args.length == 0) {
            send(sender, "unknown-argument");
            return true;
        }

        switch (args[0].toLowerCase()) {
            case "reload" -> {
                plugin.getConfigManager().reload();
                send(sender, "reload-success");
            }
            case "show" -> {
                if (args.length < 2) {
                    send(sender, "player-only");
                    return true;
                }
                OfflinePlayer target = Bukkit.getOfflinePlayer(args[1]);
                StatsHolder h = plugin.getStatsManager().getOrCreate(target.getUniqueId(), target.getName());
                String msg = "<gold>Statystyki <yellow>" + target.getName() +
                        "<gold>: <red>PK: <white>" + h.getPlayerKills() +
                        " <green>MK: <white>" + h.getMobKills() +
                        " <gray>D: <white>" + h.getDeaths() +
                        " <gold>KDR: <white>" + String.format("%.2f", h.getKDR());
                sender.sendMessage(plugin.getMiniMessage().deserialize(msg));
            }
            case "set" -> {
                if (args.length < 4) {
                    send(sender, "usage-set");
                    return true;
                }
                OfflinePlayer target = Bukkit.getOfflinePlayer(args[1]);
                String type = args[2].toLowerCase();
                int value;
                try { value = Integer.parseInt(args[3]); } catch (NumberFormatException e) {
                    send(sender, "invalid-number");
                    return true;
                }
                if (!isValidType(type)) {
                    send(sender, "invalid-stat-type");
                    return true;
                }
                StatsHolder h = plugin.getStatsManager().getOrCreate(target.getUniqueId(), target.getName());
                applySet(h, type, value);
                sender.sendMessage(plugin.getMiniMessage().deserialize(
                        plugin.getConfigManager().getMessage("set-success")
                                .replace("%type%", type)
                                .replace("%player%", target.getName())
                                .replace("%value%", String.valueOf(value))
                ));
            }
            case "add" -> {
                if (args.length < 4) {
                    send(sender, "usage-add");
                    return true;
                }
                OfflinePlayer target = Bukkit.getOfflinePlayer(args[1]);
                String type = args[2].toLowerCase();
                int value;
                try { value = Integer.parseInt(args[3]); } catch (NumberFormatException e) {
                    send(sender, "invalid-number");
                    return true;
                }
                if (!isValidType(type)) {
                    send(sender, "invalid-stat-type");
                    return true;
                }
                StatsHolder h = plugin.getStatsManager().getOrCreate(target.getUniqueId(), target.getName());
                applyAdd(h, type, value);
                sender.sendMessage(plugin.getMiniMessage().deserialize(
                        plugin.getConfigManager().getMessage("add-success")
                                .replace("%type%", type)
                                .replace("%player%", target.getName())
                                .replace("%value%", String.valueOf(value))
                ));
            }
            case "reset" -> {
                if (args.length < 2) {
                    send(sender, "player-only");
                    return true;
                }
                if (args[1].equalsIgnoreCase("all")) {
                    plugin.getStatsManager().resetAll();
                    send(sender, "reset-all-success");
                    return true;
                }
                OfflinePlayer target = Bukkit.getOfflinePlayer(args[1]);
                plugin.getStatsManager().resetPlayer(target.getUniqueId());
                sender.sendMessage(plugin.getMiniMessage().deserialize(
                        plugin.getConfigManager().getMessage("reset-success").replace("%player%", target.getName())
                ));
            }
            default -> send(sender, "unknown-argument");
        }
        return true;
    }

    private void applySet(StatsHolder h, String type, int v) {
        switch (type) {
            case "player" -> h.setPlayerKills(v);
            case "mob" -> h.setMobKills(v);
            case "deaths" -> h.setDeaths(v);
        }
    }

    private void applyAdd(StatsHolder h, String type, int v) {
        switch (type) {
            case "player" -> h.setPlayerKills(h.getPlayerKills() + v);
            case "mob" -> h.setMobKills(h.getMobKills() + v);
            case "deaths" -> h.setDeaths(h.getDeaths() + v);
        }
    }

    private boolean isValidType(String type) {
        return type.equals("player") || type.equals("mob") || type.equals("deaths");
    }

    private void send(CommandSender sender, String key) {
        Component cmp = plugin.getMiniMessage().deserialize(
                plugin.getConfigManager().getPrefix() + plugin.getConfigManager().getMessage(key)
        );
        sender.sendMessage(cmp);
    }

    @Override
    public List<String> onTabComplete(@NotNull CommandSender sender, @NotNull Command command, @NotNull String alias, @NotNull String[] args) {
        List<String> out = new ArrayList<>();
        if (args.length == 1) {
            for (String s : List.of("reload", "set", "add", "reset", "show")) {
                if (s.startsWith(args[0].toLowerCase())) out.add(s);
            }
        } else if (args.length == 2) {
            if (args[0].equalsIgnoreCase("set") || args[0].equalsIgnoreCase("add") || args[0].equalsIgnoreCase("reset") || args[0].equalsIgnoreCase("show")) {
                if (args[0].equalsIgnoreCase("reset") && "all".startsWith(args[1].toLowerCase())) out.add("all");
                for (OfflinePlayer op : Bukkit.getOnlinePlayers()) {
                    if (op.getName().toLowerCase().startsWith(args[1].toLowerCase())) out.add(op.getName());
                }
            }
        } else if (args.length == 3) {
            if (args[0].equalsIgnoreCase("set") || args[0].equalsIgnoreCase("add")) {
                for (String s : List.of("player", "mob", "deaths")) {
                    if (s.startsWith(args[2].toLowerCase())) out.add(s);
                }
            }
        } else if (args.length == 4) {
            if (args[0].equalsIgnoreCase("set") || args[0].equalsIgnoreCase("add")) {
                out.add("0");
                out.add("10");
                out.add("100");
            }
        }
        return out;
    }
}