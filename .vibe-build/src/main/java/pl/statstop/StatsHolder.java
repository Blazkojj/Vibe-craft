package pl.statstop;

public class StatsHolder {

    private int playerKills;
    private int mobKills;
    private int deaths;
    private String lastName;
    private boolean dirty;

    public StatsHolder(int playerKills, int mobKills, int deaths, String lastName) {
        this.playerKills = playerKills;
        this.mobKills = mobKills;
        this.deaths = deaths;
        this.lastName = lastName;
        this.dirty = false;
    }

    public int getPlayerKills() { return playerKills; }
    public int getMobKills() { return mobKills; }
    public int getDeaths() { return deaths; }
    public String getLastName() { return lastName; }
    public boolean isDirty() { return dirty; }

    public void setDirty(boolean dirty) { this.dirty = dirty; }

    public void addPlayerKill() {
        this.playerKills++;
        this.dirty = true;
    }

    public void addMobKill() {
        this.mobKills++;
        this.dirty = true;
    }

    public void addDeath() {
        this.deaths++;
        this.dirty = true;
    }

    public void setPlayerKills(int v) { this.playerKills = v; this.dirty = true; }
    public void setMobKills(int v) { this.mobKills = v; this.dirty = true; }
    public void setDeaths(int v) { this.deaths = v; this.dirty = true; }
    public void setLastName(String name) {
        if (name != null && !name.equals(this.lastName)) {
            this.lastName = name;
            this.dirty = true;
        }
    }

    public double getKDR() {
        if (deaths == 0) return playerKills;
        return (double) playerKills / deaths;
    }

    public void reset() {
        this.playerKills = 0;
        this.mobKills = 0;
        this.deaths = 0;
        this.dirty = true;
    }
}