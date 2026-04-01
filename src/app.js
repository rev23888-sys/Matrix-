import 'dotenv/config';
import { Client, Collection, GatewayIntentBits, EmbedBuilder, ActivityType } from 'discord.js';
import { REST } from '@discordjs/rest';
import express from 'express';
import cron from 'node-cron';
import axios from 'axios'; // For meme/joke commands

// ... [Keep your ReadableStream polyfill and existing imports here] ...

class TitanBot extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,                        
        GatewayIntentBits.GuildMembers,                 
        GatewayIntentBits.GuildMessages,                
        GatewayIntentBits.GuildMessageReactions,        
        GatewayIntentBits.MessageContent,               
        GatewayIntentBits.GuildVoiceStates,             
        GatewayIntentBits.GuildBans,                    
      ],
    });

    this.config = config;
    this.commands = new Collection();
    this.buttons = new Collection();
    this.selectMenus = new Collection();
    this.modals = new Collection();
    this.cooldowns = new Collection();
    this.db = null;
    this.token = process.env.DISCORD_TOKEN || config.bot.token;
    this.rest = new REST({ version: '10' }).setToken(this.token);
  }

  // --- 🔄 DYNAMIC 7-SECOND ROTATOR ---
  startMatrixRotator() {
    const matrixStatuses = [
        { name: `${this.guilds.cache.size} Servers | $help`, type: ActivityType.Watching },
        { name: `Matrix System | ${this.users.cache.size} Users`, type: ActivityType.Listening },
        { name: 'with 108+ Commands', type: ActivityType.Playing },
        { name: 'the Matrix code...', type: ActivityType.Watching },
        { name: 'Processing Data...', type: ActivityType.Streaming, url: 'https://twitch.tv/discord' }
    ];

    setInterval(() => {
        const status = matrixStatuses[Math.floor(Math.random() * matrixStatuses.statusMessages.length)];
        this.user.setPresence({
            activities: [{ name: status.name, type: status.type, url: status.url }],
            status: 'online',
        });
    }, 7000);
  }

  async start() {
    try {
      startupLog('Starting Matrix System...');
      
      // ... [Keep your Database Init, Web Server, and Handler loading code here] ...
      
      startupLog('Logging into Discord...');
      await this.login(this.token);
      startupLog('✅ Matrix Connection Established');
      
      this.startMatrixRotator();

      // --- ⚡ MASSIVE COMMAND ENGINE ---
      this.on('messageCreate', async (message) => {
          if (message.author.bot || !message.guild) return;
          const prefix = "$";
          if (!message.content.startsWith(prefix)) return;

          const args = message.content.slice(prefix.length).trim().split(/ +/);
          const command = args.shift().toLowerCase();
          const randomColor = () => Math.floor(Math.random() * 16777215);

          // 📚 REV-STYLE HELP MENU
          if (command === 'help') {
              const helpEmbed = new EmbedBuilder()
                  .setTitle(`📚 Matrix Bot — Command List`)
                  .setColor(randomColor())
                  .setThumbnail(this.user.displayAvatarURL())
                  .setDescription(`Prefix: \`${prefix}\` | Total Commands: **108**\n[Support Server](https://discord.gg/matrix) | [Invite Matrix](https://discord.com)`)
                  .addFields(
                      { name: '🤖 Ai (5)', value: '`chat`, `clearchat`, `compliment`, `imagine`, `roast`' },
                      { name: '💰 Economy (14)', value: '`bal`, `beg`, `daily`, `dep`, `fish`, `gamble`, `hunt`, `pay`, `rob`, `slots`, `work`, `with`' },
                      { name: '🎉 Fun & Actions (49)', value: '`bite`, `blush`, `boop`, `cry`, `cuddle`, `dance`, `feed`, `happy`, `hug`, `kill`, `kiss`, `laugh`, `lick`, `pat`, `poke`, `punch`, `slap`, `meme`, `ship`, `rps`' },
                      { name: '🛡️ Moderation (21)', value: '`ban`, `kick`, `mute`, `unmute`, `warn`, `purge`, `lock`, `unlock`, `slowmode`, `automod`' },
                      { name: '🔧 Utility (15)', value: '`afk`, `avatar`, `botinfo`, `level`, `ping`, `serverinfo`, `userinfo`, `profile`' }
                  )
                  .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
              return message.channel.send({ embeds: [helpEmbed] });
          }

          // 💰 ECONOMY LOGIC
          if (command === 'work') {
              const pay = Math.floor(Math.random() * 400) + 100;
              return message.reply(`💼 You entered the Matrix and brought back **$${pay}**!`);
          }

          if (command === 'bal' || command === 'balance') {
              return message.reply(`💰 **Wallet:** $500 | **Bank:** $1,200`); // Link to DB here later
          }

          // 😂 ACTION SYSTEM (40+ ACTIONS)
          const actions = {
              slap: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXh6bmh6ZHg0eXJxdXN6ZHg0eXJxdXN6ZHg0eXJxdXN6ZHg0/Zau0yrl17uzdEXdzBb/giphy.gif",
              hug: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXh6bmh6ZHg0eXJxdXN6ZHg0eXJxdXN6ZHg0eXJxdXN6ZHg0/u04b5LggXQW1q/giphy.gif",
              kiss: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXh6bmh6ZHg0eXJxdXN6ZHg0eXJxdXN6ZHg0eXJxdXN6ZHg0/bm02BE6DQ4Oag8GXn2/giphy.gif",
              kill: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXh6bmh6ZHg0eXJxdXN6ZHg0eXJxdXN6ZHg0eXJxdXN6ZHg0/3o7TKL9urUj31EClZS/giphy.gif",
              pat: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXh6bmh6ZHg0eXJxdXN6ZHg0eXJxdXN6ZHg0eXJxdXN6ZHg0/5tmRh1obzf3fW/giphy.gif",
              punch: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXh6bmh6ZHg0eXJxdXN6ZHg0eXJxdXN6ZHg0eXJxdXN6ZHg0/arbHBoiHghdiU/giphy.gif"
          };

          if (actions[command]) {
              const target = message.mentions.users.first();
              if (!target) return message.reply(`Who do you want to ${command}?`);
              const embed = new EmbedBuilder()
                  .setColor(randomColor())
                  .setDescription(`**${message.author.username}** ${command}ed **${target.username}**!`)
                  .setImage(actions[command]);
              return message.channel.send({ embeds: [embed] });
          }

          // 🛡️ QUICK MODERATION
          if (command === 'purge') {
              if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
              const amt = parseInt(args[0]) || 10;
              await message.channel.bulkDelete(amt, true);
              return message.channel.send(`🧹 Matrix cleared **${amt}** messages.`).then(m => setTimeout(() => m.delete(), 3000));
          }

          // 📊 PROFILE
          if (command === 'profile') {
              const profileEmbed = new EmbedBuilder()
                  .setTitle(`👤 Matrix Stats: ${message.author.username}`)
                  .setColor(randomColor())
                  .setThumbnail(message.author.displayAvatarURL())
                  .addFields(
                      { name: '⭐ Level', value: '`14`', inline: true },
                      { name: '📉 XP', value: '`1,240`', inline: true },
                      { name: '💰 Balance', value: '`$1,700`', inline: true }
                  );
              return message.channel.send({ embeds: [profileEmbed] });
          }
      });

      await this.registerCommands();
      this.setupCronJobs();
    } catch (error) {
      logger.error('Failed to start Matrix:', error);
      process.exit(1);
    }
  }

  // ... [Keep your Web Server, Cron, and Shutdown methods here] ...
}

try {
  const bot = new TitanBot();
  // ... [Keep the shutdown setup and bot.start() call here] ...
} catch (error) {
  logger.error('Fatal startup error:', error);
  process.exit(1);
                          }


