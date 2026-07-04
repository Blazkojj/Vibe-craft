package com.cosmic.crates.hologram;

import com.cosmic.crates.CosmicCratesPlugin;
import com.cosmic.crates.crate.Crate;
import com.cosmic.crates.utils.ColorUtil;
import org.bukkit.Location;
import org.bukkit.entity.ArmorStand;
import org.bukkit.entity.EntityType;
import org.bukkit.entity.Player;
import org.bukkit.scheduler.BukkitRunnable;
import org.bukkit.util.Vector;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class HologramManager {

    private final CosmicCratesPlugin plugin;
    private final Map<String, ArmorStand> holograms = new HashMap<>();
    private final Map<UUID, BukkitRunnable> tasks = new HashMap<>();

    public HologramManager(CosmicCratesPlugin plugin) {
        this.plugin = plugin;
    }

    public void spawn(Crate crate) {
        remove(crate);
        double height = plugin.getConfig().getDouble("settings.hologram-height", 1.2);
        Location loc = crate.getLocation().clone().add(0.5, height, 0.5);

        List<String> lines = crate.getHologramLines();
        if (lines == null || lines.isEmpty()) return;

        // Glowny ArmorStand na dole, reszta powyzej
        ArmorStand base = null;
        for (int i = lines.size() - 1; i >= 0; i--) {
            Location lineLoc = loc.clone().add(0, (lines.size() - 1 - i) * 0.3, 0);
            ArmorStand stand = (ArmorStand) loc.getWorld().spawnEntity(lineLoc, EntityType.ARMOR_STAND);
            stand.setVisible(false);
            stand.setGravity(false);
            stand.setMarker(true);
            stand.setCustomNameVisible(true);
            stand.setCustomName(ColorUtil.color(lines.get(i)));
            stand.setPersistent(false);
            if (base == null) base = stand;
        }

        if (base != null) {
            holograms.put(crate.getId(), base);
        }
    }

    public void remove(Crate crate) {
        ArmorStand base = holograms.remove(crate.getId());
        if (base != null) {
            // Usun wszystkie ArmorStandy w okolicy hologramu
            String id = crate.getId();
            double height = plugin.getConfig().getDouble("settings.hologram-height", 1.2);
            Location loc = crate.getLocation().clone().add(0.5, height, 0.5);
            loc.getWorld().getNearbyEntities(loc, 1.5, 2.5, 1.5).stream()
                .filter(e -> e instanceof ArmorStand)
                .filter(e -> e.getCustomName() != null)
                .forEach(e -> e.remove());
        }
    }

    public void removeAll() {
        for (ArmorStand stand : holograms.values()) {
            if (stand != null && !stand.isDead()) {
                stand.remove();
            }
        }
        holograms.clear();
    }

    public void updateForPlayer(Player p) {
        // Aktualizacja licznika kluczy na hologramie
        for (Crate crate : plugin.getCrateManager().getAll()) {
            int keys = plugin.getKeyManager().countKeysOfType(p, crate.getTypeId());
            List<String> lines = crate.getHologramLines();
            if (lines == null) continue;

            // Szukaj ArmorStandow w okolicy skrzynki
            double height = plugin.getConfig().getDouble("settings.hologram-height", 1.2);
            Location loc = crate.getLocation().clone().add(0.5, height, 0.5);
            final int keysFinal = keys;
            loc.getWorld().getNearbyEntities(loc, 1.5, 2.5, 1.5).stream()
                .filter(e -> e instanceof ArmorStand)
                .filter(e -> e.getCustomName() != null)
                .forEach(e -> {
                    String name = e.getCustomName();
                    // Sprawdz czy linia zawiera placeholder {keys}
                    for (String line : lines) {
                        if (line.contains("{keys}")) {
                            String formatted = plugin.getCrateManager().formatHologramLine(line, keysFinal);
                            ((ArmorStand) e).setCustomName(formatted);
                        }
                    }
                });
        }
    }

    public void startPlayerTask(Player p) {
        stopPlayerTask(p.getUniqueId());
        BukkitRunnable task = new BukkitRunnable() {
            @Override
            public void run() {
                if (!p.isOnline()) {
                    cancel();
                    tasks.remove(p.getUniqueId());
                    return;
                }
                updateForPlayer(p);
            }
        };
        task.runTaskTimer(plugin, 20L, 40L); // aktualizacja co 2 sekundy
        tasks.put(p.getUniqueId(), task);
    }

    public void stopPlayerTask(UUID uuid) {
        BukkitRunnable task = tasks.remove(uuid);
        if (task != null) task.cancel();
    }
}