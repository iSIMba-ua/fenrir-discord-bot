import { Client, GatewayIntentBits } from "discord.js";
import cron from "node-cron";

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// Токен з Railway (Settings → Variables)
const TOKEN = process.env.TOKEN_DISCORD_BOT;

// Дані про сім’ю (пізніше можна підключити базу)
const family = [
    { name: "Іван Іванов", birth: "01-01", roleId: "ID_РОЛІ", serverId: "ID_СЕРВЕРА", channelId: "ID_КАНАЛУ" },
    { name: "Марія Петрова", birth: "09-01", roleId: "ID_РОЛІ", serverId: "ID_СЕРВЕРА", channelId: "ID_КАНАЛУ" }
];

// Перевірка кожного дня о 09:00
cron.schedule("0 9 * * *", () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const todayStr = `${dd}-${mm}`;

    family.forEach(member => {
        if (member.birth === todayStr) {
            const channel = client.channels.cache.get(member.channelId);
            if (channel) {
                channel.send(`Дорога сім'я <@&${member.roleId}>, сьогодні день народження у **${member.name}**! 🎉`);
            }
        }
    });
});

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.login(TOKEN);
