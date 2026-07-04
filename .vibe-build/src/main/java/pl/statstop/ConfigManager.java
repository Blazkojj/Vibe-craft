package pl.statstop;

import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.configuration.file.FileConfiguration;

import java.util.ArrayList;
import java.util.List;

public class ConfigManager {

    private final StatsPlugin plugin;
    private final FileConfiguration config;

    public ConfigManager(StatsPlugin plugin) {
        this.plugin = plugin;
        this.config = plugin.getConfig();
    }

    public void reload() {
        plugin.reloadConfig();
    }

    public FileConfiguration raw() {
        return config;
    }

    public String getPrefix() {
        return config.getString("messages.prefix", "");
    }

    public String getMessage(String key) {
        return config.getString("messages." + key, "<red>Brak wiadomosci: " + key);
    }

    public int getAutoSaveMinutes() {
        return config.getInt("auto-save-minutes", 5);
    }

    public boolean trackPlayerKills() {
        return config.getBoolean("track-player-kills", true);
    }

    public boolean trackMobKills() {
        return config.getBoolean("track-mob-kills", true);
    }

    public boolean trackDeaths() {
        return config.getBoolean("track-deaths", true);
    }

    public int getTopSize() {
        return Math.min(config.getInt("top-size", 45), 45);
    }

    public String getPlayerKillMessage() {
        return config.getString("kill-messages.player-kill", "");
    }

    public String getMobKillMessage() {
        return config.getString("kill-messages.mob-kill", "");
    }

    public String getDeathMessage() {
        return config.getString("kill-messages.death", "");
    }

    public String getPlayerKillSound() {
        return config.getString("effects.player-kill-sound", "");
    }

    public float getPlayerKillSoundVolume() {
        return (float) config.getDouble("effects.player-kill-sound-volume", 1.0);
    }

    public float getPlayerKillSoundPitch() {
        return (float) config.getDouble("effects.player-kill-sound-pitch", 1.0);
    }

    public String getPlayerKillParticle() {
        return config.getString("effects.player-kill-particle", "");
    }

    public String getGuiTitle() {
        return config.getString("gui.title", "<gradient:gold:yellow>Top Kills</gradient>");
    }

    public int getGuiSize() {
        return config.getInt("gui.size", 54);
    }

    public int getGuiMaxPerPage() {
        return config.getInt("gui.max-per-page", 45);
    }

    public boolean usePlayerHeads() {
        return config.getBoolean("gui.use-player-heads", true);
    }

    public List<String> getGuiLore() {
        return config.getStringList("gui.lore");
    }

    public String getGuiDisplayName() {
        return config.getString("gui.display-name", "<yellow>%player%");
    }

    public int getSlotPrevious() {
        return config.getInt("gui.slots.previous", 45);
    }

    public int getSlotNext() {
        return config.getInt("gui.slots.next", 53);
    }

    public int getSlotClose() {
        return config.getInt("gui.slots.close", 49);
    }

    public String getFillerItem() {
        return config.getString("gui.filler-item", "GRAY_STAINED_GLASS_PANE");
    }

    public String getPreviousItem() {
        return config.getString("gui.previous-item", "ARROW");
    }

    public String getPreviousName() {
        return config.getString("gui.previous-name", "<gold>< Poprzednia strona");
    }

    public String getNextItem() {
        return config.getString("gui.next-item", "ARROW");
    }

    public String getNextName() {
        return config.getString("gui.next-name", "<gold>Nastepna strona >");
    }

    public String getCloseItem() {
        return config.getString("gui.close-item", "BARRIER");
    }

    public String getCloseName() {
        return config.getString("gui.close-name", "<red>Zamknij");
    }

    public String getDefaultSort() {
        return config.getString("default-sort", "player");
    }

    public boolean isChatTopEnabled() {
        return config.getBoolean("chat-top-enabled", true);
    }

    public int getChatTopSize() {
        return Math.min(config.getInt("chat-top-size", 10), 100);
    }

    public String getChatTopFormat() {
        return config.getString("chat-top-format", "<gold>#%rank% <yellow>%player% <gray>- <white>%player_kills% killi");
    }

    public String getChatTopHeader() {
        return config.getString("chat-top-header", "");
    }

    public String getChatTopFooter() {
        return config.getString("chat-top-footer", "");
    }
}