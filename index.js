import 'dotenv/config';
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder
} from 'discord.js';
import cron from 'node-cron';
import mysql from 'mysql2/promise';

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ==================== Discord команди ====================
const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Перевірка, чи живий бот')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('⏳ Реєстрація команд...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Команди зареєстровані');
  } catch (err) {
    console.error('❌ Помилка реєстрації команд:', err);
  }
})();

client.once('ready', () => {
  console.log(`🐺 Fenrir прокинувся: ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('🏓 Pong! Fenrir на звʼязку.');
  }
});

// ==================== Підключення до MySQL ====================
const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// ==================== Cron: День народження ====================
cron.schedule('0 10 * * *', async () => {
  try {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;

    // Беремо користувачів з ДН
    const [users] = await db.execute(
      `SELECT name, surname FROM family_members WHERE birth_day = ? AND birth_month = ?`,
      [day, month]
    );

    if (!users.length) return; // Якщо немає ДН, нічого не робимо

    // Беремо канал і роль з БД
    const [settings] = await db.execute(
      `SELECT channel_id, role_id FROM discord_settings ORDER BY id DESC LIMIT 1`
    );

    if (!settings.length) return;

    const { channel_id, role_id } = settings[0];
    const channel = await client.channels.fetch(channel_id);

    for (const user of users) {
      await channel.send(
        `🎉 Дорога сімʼя <@&${role_id}>,\n` +
        `сьогодні день народження у **${user.name} ${user.surname}**! 🎂🔥`
      );
    }

    console.log('✅ Привітання з ДН надіслано');

  } catch (err) {
    console.error('❌ Помилка при перевірці ДН:', err);
  }
}, {
  timezone: 'Europe/Kyiv'
});

// ==================== Логін бота ====================
client.login(process.env.DISCORD_TOKEN);
