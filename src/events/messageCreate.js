import { Events } from 'discord.js';
import { logger } from '../utils/logger.js';
import { getLevelingConfig, getUserLevelData } from '../services/leveling.js';
import { addXp } from '../services/xpSystem.js';
import { checkRateLimit } from '../utils/rateLimiter.js';

const MESSAGE_XP_RATE_LIMIT_ATTEMPTS = 12;
const MESSAGE_XP_RATE_LIMIT_WINDOW_MS = 10000;

export default {
  name: Events.MessageCreate,
  async execute(message, client) {
    try {
      if (message.author.bot || !message.guild) return;

      // 🔥 PREFIX SYSTEM
      const prefix = process.env.PREFIX || "&";

      if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const cmd = args.shift()?.toLowerCase();

        // ===== HELP =====
        if (cmd === "help") {
          return message.reply(`
📚 **Matrix Commands**

💰 Economy: &bal, &work  
😂 Fun: &meme, &joke  
🎮 Games: &dice, &rps  
⚙️ Utility: &ping  

Prefix = ${prefix}
          `);
        }

        // ===== PING =====
        if (cmd === "ping") {
          return message.reply(`🏓 ${client.ws.ping}ms`);
        }

        // ===== DICE =====
        if (cmd === "dice") {
          return message.reply(`🎲 ${Math.floor(Math.random() * 6) + 1}`);
        }

        // ===== RPS =====
        if (cmd === "rps") {
          const choices = ["rock", "paper", "scissors"];
          const bot = choices[Math.floor(Math.random() * 3)];
          const user = args[0];

          if (!choices.includes(user)) {
            return message.reply("Use: &rps rock/paper/scissors");
          }

          if (user === bot) return message.reply(`Tie! I chose ${bot}`);
          if (
            (user === "rock" && bot === "scissors") ||
            (user === "paper" && bot === "rock") ||
            (user === "scissors" && bot === "paper")
          ) return message.reply(`You win! I chose ${bot}`);

          return message.reply(`I win! I chose ${bot}`);
        }

        // ===== JOKE =====
        if (cmd === "joke") {
          return message.reply("😂 Dev life = bugs");
        }

        // ===== MEME =====
        if (cmd === "meme") {
          return message.reply("😂 Meme system coming soon");
        }
      }

      // ✅ KEEP YOUR LEVEL SYSTEM
      await handleLeveling(message, client);

    } catch (error) {
      logger.error('Error in messageCreate event:', error);
    }
  }
};

async function handleLeveling(message, client) {
  try {
    const rateLimitKey = `xp-event:${message.guild.id}:${message.author.id}`;
    const canProcess = await checkRateLimit(
      rateLimitKey,
      MESSAGE_XP_RATE_LIMIT_ATTEMPTS,
      MESSAGE_XP_RATE_LIMIT_WINDOW_MS
    );
    if (!canProcess) return;

    const levelingConfig = await getLevelingConfig(client, message.guild.id);
    if (!levelingConfig?.enabled) return;

    const userData = await getUserLevelData(client, message.guild.id, message.author.id);

    const cooldownTime = levelingConfig.xpCooldown || 60;
    const now = Date.now();

    if (now - (userData.lastMessage || 0) < cooldownTime * 1000) return;

    const xpToGive = Math.floor(Math.random() * 10) + 5;

    const result = await addXp(client, message.guild, message.member, xpToGive);

    if (result.success && result.leveledUp) {
      message.channel.send(`🎉 ${message.author} leveled up to ${result.level}!`);
    }

  } catch (error) {
    logger.error('Error handling leveling:', error);
  }
}


