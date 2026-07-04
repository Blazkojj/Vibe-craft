package pl.statstop;

import net.kyori.adventure.text.Component;
import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import org.bukkit.entity.Player;
import org.jetbrains.annotations.NotNull;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class TopCommand implements CommandExecutor, TabCompleter {

    private final StatsPlugin plugin;

    public TopCommand(StatsPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(@NotNull CommandSender sender, @NotNull Command command, @NotNull String label, @NotNull String[] args) {
        String type = args.length > 0 ? args[0].toLowerCase() : plugin.getConfigManager().getDefaultSort();
        if (!type.equals("player") && !type.equals("mob") && !type.equals("deaths")) {
            type = plugin.getConfigManager().getDefaultSort();
        }

        if (args.length > 0 && args[0].equalsIgnoreCase("chat")) {
            if (!plugin.getConfigManager().isChatTopEnabled()) {
                sender.sendMessage(plugin.getMiniMessage().deserialize(plugin.getConfigManager().getPrefix() + "<red>Topka w chacie jest wylaczona."));
                return true;
            }
            sendChatTop(sender, type);
            return true;
        }

        if (!(sender instanceof Player player)) {
            sendChatTop(sender, type);
            return true;
        }

        int page = 1;
        if (args.length > 1) {
            try { page = Integer.parseInt(args[1]); } catch (NumberFormatException ignored) {
                if (args.length > 2) {
                    try { page = Integer.parseInt(args[2]); } catch (NumberFormatException ignored2) {}
                }
            }
        }
        if (page < 1) page = 1;

        TopMenu menu = new TopMenu(plugin, type, page);
        player.openInventory(menu.build());
        return true;
    }

    private void sendChatTop(CommandSender sender, String type) {
        int size = plugin.getConfigManager().getChatTopSize();
        List<Map.Entry<UUID, StatsHolder>> top = plugin.getStatsManager().getTopBy(type, size);

        if (!plugin.getConfigManager().getChatTopHeader().isEmpty()) {
            String header = plugin.getConfigManager().getChatTopHeader()
                    .replace("%size%", String.valueOf(top.size()))
                    .replace("%type%", type);
            sender.sendMessage(plugin.getMiniMessage().deserialize(header));
        }

        String format = plugin.getConfigManager().getChatTopFormat();
        int rank = 1;
        for (Map.Entry<UUID, StatsHolder> e : top) {
            StatsHolder h = e.getValue();
            String name = plugin.getStatsManager().resolveName(e.getKey());
            String line = format
                    .replace("%rank%", String.valueOf(rank))
                    .replace("%player%", name)
                    .replace("%player_kills%", String.valueOf(h.getPlayerKills()))
                    .replace("%mob_kills%", String.valueOf(h.getMobKills()))
                    .replace("%deaths%", String.valueOf(h.getDeaths()))
                    .replace("%kdr%", String.format("%.2f", h.getKDR()));
            sender.sendMessage(plugin.getMiniMessage().deserialize(line));
            rank++;
        }

        if (!plugin.getConfigManager().getChatTopFooter().isEmpty()) {
            String footer = plugin.getConfigManager().getChatTopFooter().replace("%size%", String.valueOf(top.size()));
            sender.sendMessage(plugin.getMiniMessage().deserialize(footer));
        }
    }

    @Override
    public List<String> onTabComplete(@NotNull CommandSender sender, @NotNull Command command, @NotNull String alias, @NotNull String[] args) {
        List<String> out = new ArrayList<>();
        if (args.length == 1) {
            for (String s : List.of("player", "mob", "deaths", "chat")) {
                if (s.startsWith(args[0].toLowerCase())) out.add(s);
            }
        } else if (args.length == 2) {
            if (args[0].equalsIgnoreCase("chat")) {
                for (String s : List.of("player", "mob", "deaths")) {
                    if (s.startsWith(args[1].toLowerCase())) out.add(s);
                }
            } else {
                out.add("1");
            }
        }
        return out;
    }
}