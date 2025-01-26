export default class Cooldown {
    private cooldowns: Map<string, number>;
    private defaultCooldown: number;

    constructor(defaultCooldown: number = 5) {
        this.cooldowns = new Map();
        this.defaultCooldown = defaultCooldown;
    }

    setCooldown(userId: string, cooldownTime: number = this.defaultCooldown) {
        const now = Date.now();
        this.cooldowns.set(userId, now + cooldownTime);
    }

    isOnCooldown(userId: string) {
        const cooldownEnd = this.cooldowns.get(userId);
        if (!cooldownEnd) return false;

        const now = Date.now();
        return now < cooldownEnd;
    }

    getRemainingCooldown(userId: string) {
        const cooldownEnd = this.cooldowns.get(userId);
        if (!cooldownEnd) return null;

        const now = Date.now();
        return Math.max(0, cooldownEnd - now);
    }

    clearCooldown(userId: string): void {
        this.cooldowns.delete(userId);
    }
}