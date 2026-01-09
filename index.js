import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

client.once('ready', () => {
  console.log(`✅ Бот запущений як ${client.user.tag}`);
});

if (!process.env.DISCORD_TOKEN) {
  console.error('❌ DISCORD_TOKEN не заданий!');
  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);
