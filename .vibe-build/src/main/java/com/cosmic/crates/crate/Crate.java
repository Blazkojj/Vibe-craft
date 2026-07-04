package com.cosmic.crates.crate;

import org.bukkit.Location;
import org.bukkit.Sound;
import org.bukkit.Particle;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class Crate {

    private final String id;
    private final String typeId;
    private Location location;
    private String displayName;
    private String blockMaterial;
    private boolean glow;
    private List<String> hologramLines;
    private KeyDefinition key;
    private Sounds sounds;
    private Particles particles;
    private List<Reward> rewards;

    public Crate(String id, String typeId, Location location) {
        this.id = id;
        this.typeId = typeId;
        this.location = location;
    }

    public record KeyDefinition(String material, String displayName, List<String> lore, boolean glow,
                                 int customModelData) {}
    public record Sounds(String open, String roll, String win, String lose) {}
    public record Particles(List<String> win, List<String> ambient) {}
    public record Reward(String display, String material, int weight, List<String> commands) {}

    // Gettery / settery
    public String getId() { return id; }
    public String getTypeId() { return typeId; }
    public Location getLocation() { return location; }
    public void setLocation(Location loc) { this.location = loc; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String n) { this.displayName = n; }
    public String getBlockMaterial() { return blockMaterial; }
    public void setBlockMaterial(String m) { this.blockMaterial = m; }
    public boolean isGlow() { return glow; }
    public void setGlow(boolean g) { this.glow = g; }
    public List<String> getHologramLines() { return hologramLines; }
    public void setHologramLines(List<String> l) { this.hologramLines = l; }
    public KeyDefinition getKey() { return key; }
    public void setKey(KeyDefinition k) { this.key = k; }
    public Sounds getSounds() { return sounds; }
    public void setSounds(Sounds s) { this.sounds = s; }
    public Particles getParticles() { return particles; }
    public void setParticles(Particles p) { this.particles = p; }
    public List<Reward> getRewards() { return rewards; }
    public void setRewards(List<Reward> r) { this.rewards = r; }

    public int getTotalWeight() {
        return rewards.stream().mapToInt(Reward::weight).sum();
    }
}