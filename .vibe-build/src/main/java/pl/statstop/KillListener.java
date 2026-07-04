package pl.statstop;

import net.kyori.adventure.text.Component;
import org.bukkit.Particle;
import org.bukkit.Sound;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.EntityDeathEvent;
import org.bukkit.event.entity.PlayerDeathEvent;

public class KillListener implements Listener {

    private final StatsPlugin plugin;

    public KillListener(StatsPlugin plugin) {
        this.plugin = plugin;
    }

    @EventHandler(priority = EventPriority.MONITOR, ignoreCancelled = true)
    public void onEntityDeath(EntityDeathEvent event) {
        Player killer = event.getEntity().getKiller();
        if (killer == null) return;
        if (event.getEntity() instanceof Player) return;
        if (!plugin.getConfigManager().trackMobKills()) return;

        StatsHolder holder = plugin.getStatsManager().getOrCreate(killer.getUniqueId(), killer.getName());
        holder.addMobKill();
        sendFeedback(killer, "mob", 1, holder.getMobKills());
    }

    @EventHandler(priority = EventPriority.MONITOR, ignoreCancelled = true)
    public void onPlayerDeath(PlayerDeathEvent event) {
        Player victim = event.getEntity();
        if (plugin.getConfigManager().trackDeaths()) {
            StatsHolder victimHolder = plugin.getStatsManager().getOrCreate(victim.getUniqueId(), victim.getName());
            victimHolder.addDeath();
            sendFeedback(victim, "death", 1, victimHolder.getDeaths());
        }

        Player killer = victim.getKiller();
        if (killer != null && plugin.getConfigManager().trackPlayerKills()) {
            StatsHolder killerHolder = plugin.getStatsManager().getOrCreate(killer.getUniqueId(), killer.getName());
            killerHolder.addPlayerKill();
            sendFeedback(killer, "player", 1, killerHolder.getPlayerKills());
            playEffects(killer);
        }
    }

    private void sendFeedback(Player player, String type, int value, int total) {
        String template = switch (type) {
            case "player" -> plugin.getConfigManager().getPlayerKillMessage();
            case "mob" -> plugin.getConfigManager().getMobKillMessage();
            case "death" -> plugin.getConfigManager().getDeathMessage();
            default -> "";
        };
        if (template.isEmpty()) return;

        String msg = template.replace("%value%", String.valueOf(value)).replace("%total%", String.valueOf(total));
        Component cmp = plugin.getMiniMessage().deserialize(plugin.getConfigManager().getPrefix() + msg);
        player.sendActionBar(cmp);
    }

    private void playEffects(Player killer) {
        String soundName = plugin.getConfigManager().getPlayerKillSound();
        if (!soundName.isEmpty()) {
            try {
                Sound s = Sound.valueOf(soundName);
                killer.playSound(killer.getLocation(), s,
                        plugin.getConfigManager().getPlayerKillSoundVolume(),
                        plugin.getConfigManager().getPlayerKillSoundPitch());
            } catch (IllegalArgumentException ignored) {}
        }
        String particleName = plugin.getConfigManager().getPlayerKillParticle();
        if (!particleName.isEmpty()) {
            try {
                Particle p = Particle.valueOf(particleName);
                killer.getWorld().spawnParticle(p, killer.getLocation().add(0, 1, 0), 10, 0.5, 0.5, 0.5, 0.1);
            } catch (IllegalArgumentException ignored) {}
        }
    }
}