package com.cosmic.crates.crate;

import com.cosmic.crates.CosmicCratesPlugin;
import com.cosmic.crates.utils.ColorUtil;
import org.bukkit.Location;
import org.bukkit.Material;
import org.bukkit.World;
import org.bukkit.block.Block;
import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.configuration.file.FileConfiguration;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CrateManager {
    private final CosmicCratesPlugin plugin;
    private final Map<String, Crate> crates = new HashMap<>();
    private final Map<String, String> locationIndex = new HashMap<>(); 

    public CrateManager(CosmicCratesPlugin plugin) {
        this.plugin = plugin;
    }

    public void loadAll() {
        crates.clear();
        locationIndex.clear();
        FileConfiguration cfg = plugin.getConfig();
        ConfigurationSection cratesSec = cfg.getConfigurationSection("crates");
        if (cratesSec == null) return;

        ConfigurationSection locsSec = cfg.getConfigurationSection("crate-locations");
        if (locsSec != null) {
            for (String crateId : locsSec.getKeys(false)) {
                String path = locsSec.getString(crateId + ".location");
                String typeId = locsSec.getString(crateId + ".type");
                if (path == null || typeId == null) continue;
                Location loc = parseLocation(path);
                if (loc == null) continue;

                Crate crate = buildCrateFromConfig(crateId, typeId, loc);
                if (crate != null) {
                    registerCrate(crate);
                    updateBlockState(crate);
                }
            }
        }
    }

    private void updateBlockState(Crate crate) {
        try {
            Block block = crate.getLocation().getBlock();
            Material mat = Material.matchMaterial(crate.getBlockMaterial());
            if (mat != null && block.getType() != mat) {
                block.setType(mat, true);
            }
        } catch (Exception ignored) {}
    }

    private Crate buildCrateFromConfig(String id, String typeId, Location loc) {
        ConfigurationSection sec = plugin.getConfig().getConfigurationSection("crates." + typeId);
        if (sec == null) return null;

        Crate crate = new Crate(id, typeId, loc);
        crate.setDisplayName(sec.getString("display-name", "&fSkrzynka"));
        crate.setBlockMaterial(sec.getString("block", "SHULKER_BOX"));
        crate.setGlow(sec.getBoolean("glow", false));
        crate.setHologramLines(sec.getStringList("hologram"));

        ConfigurationSection keySec = sec.getConfigurationSection("key");
        if (keySec != null) {
            crate.setKey(new Crate.KeyDefinition(
                    keySec.getString("material", "TRIPWIRE_HOOK"),
                    keySec.getString("display-name", "&fKlucz"),
                    keySec.getStringList("lore"),
                    keySec.getBoolean("glow", false),
                    keySec.getInt("custom-model-data", 0)
            ));
        }

        ConfigurationSection sndSec = sec.getConfigurationSection("sounds");
        if (sndSec != null) {
            crate.setSounds(new Crate.Sounds(
                    sndSec.getString("open", "BLOCK_CHEST_OPEN"),
                    sndSec.getString("roll", "UI_BUTTON_CLICK"),
                    sndSec.getString("win", "ENTITY_PLAYER_LEVELUP"),
                    sndSec.getString("lose", "BLOCK_NOTE_BLOCK_BASS")
            ));
        }

        ConfigurationSection partSec = sec.getConfigurationSection("particles");
        if (partSec != null) {
            crate.setParticles(new Crate.Particles(
                    partSec.getStringList("win"),
                    partSec.getStringList("ambient")
            ));
        }

        List<Crate.Reward> rewards = new java.util.ArrayList<>();
        ConfigurationSection rewSec = sec.getConfigurationSection("rewards");
        if (rewSec != null) {
            for (String key : rewSec.getKeys(false)) {
                ConfigurationSection r = rewSec.getConfigurationSection(key);
                if (r == null) continue;
                rewards.add(new Crate.Reward(
                        r.getString("display", "&fNagroda"),
                        r.getString("material", "PAPER"),
                        r.getInt("weight", 1),
                        r.getStringList("commands")
                ));
            }
        }
        crate.setRewards(rewards);
        return crate;
    }

    public void registerCrate(Crate crate) {
        crates.put(crate.getId(), crate);
        locationIndex.put(locateKey(crate.getLocation()), crate.getId());
        if (plugin.getConfig().getBoolean("settings.holograms-enabled")) {
            plugin.getHologramManager().spawn(crate);
        }
    }

    public void unregisterCrate(String id) {
        Crate crate = crates.remove(id);
        if (crate != null) {
            locationIndex.remove(locateKey(crate.getLocation()));
            plugin.getHologramManager().remove(crate);
        }
    }

    public Crate getCrateById(String id) {
        return crates.get(id);
    }

    public Crate getCrateAtLocation(Location loc) {
        return crates.get(locationIndex.get(locateKey(loc)));
    }

    public Collection<Crate> getAll() {
        return crates.values();
    }

    public boolean exists(String id) {
        return crates.containsKey(id);
    }

    public boolean createCrate(String id, String typeId, Location loc) {
        if (crates.containsKey(id)) return false;
        if (plugin.getConfig().getConfigurationSection("crates." + typeId) == null) return false;

        Crate crate = buildCrateFromConfig(id, typeId, loc);
        if (crate == null) return false;

        registerCrate(crate);
        updateBlockState(crate);
        saveCrateLocation(crate);
        return true;
    }

    public void saveCrateLocation(Crate crate) {
        String path = "crate-locations." + crate.getId();
        plugin.getConfig().set(path + ".location", serializeLocation(crate.getLocation()));
        plugin.getConfig().set(path + ".type", crate.getTypeId());
        plugin.saveConfig();
    }

    public void removeCrateLocation(String id) {
        plugin.getConfig().set("crate-locations." + id, null);
        plugin.saveConfig();
    }

    public void saveAll() {
        plugin.saveConfig();
    }

    public String locateKey(Location loc) {
        return loc.getWorld().getName() + "," + loc.getBlockX() + "," + loc.getBlockY() + "," + loc.getBlockZ();
    }

    public String serializeLocation(Location loc) {
        return loc.getWorld().getName() + ";" + loc.getBlockX() + ";" + loc.getBlockY() + ";" + loc.getBlockZ();
    }

    public Location parseLocation(String s) {
        String[] parts = s.split(";");
        if (parts.length != 4) return null;
        World w = plugin.getServer().getWorld(parts[0]);
        if (w == null) return null;
        return new Location(w, Integer.parseInt(parts[1]), Integer.parseInt(parts[2]), Integer.parseInt(parts[3]));
    }

    public String formatHologramLine(String line, int keys) {
        return ColorUtil.color(line.replace("{keys}", String.valueOf(keys)));
    }
}