
require('dotenv').config();

const { Client } = require('discord.js-selfbot-v13');
const client = new Client({ checkUpdate: false });
const guildIds = process.env.GUILD_IDs;
const prefix = process.env.prefix
const funcs = require('./src/funcs');
client.once('ready', () => console.log(`${client.user.displayName} is ${prefix}`));
let Timeout = parseInt(process.env.Timeout);
let SSRFlag = false, atkFlag = "::atk"
let adminId = new Set(process.env.ADMIN_LIST.split(','));
let time, targetChannelID;
let atkmsg = "::atk"

client.on("messageCreate", async (message) => {
    if (!adminId.has(message.author.id) && message.guild.id.includes(guildIds)) return;
    if (message.content.startsWith(prefix)) {
        atkmsg, targetChannelID = await funcs.moderate(client, message, prefix, atkmsg, targetChannelID)
    }
    if (!targetChannelID || targetChannelID !== message.channel.id) return;
    clearTimeout(time);
    if (message.embeds.length > 0 && message.embeds[0].title) {
        const embedTitle = message.embeds[0].title;
        if (embedTitle.includes("が待ち構えている")) {
            if (funcs.checkSSRRank(message.embeds[0].author.name)) {
                SSRFlag, Timeout = funcs.spawnSuperRareProcess(message, SSRFlag, roleID, Timeout)
            }
            if (SSRFlag) {
                atkFlag = atkmsg
                atkmsg = "::i f"
            }
            await funcs.sendMessage(message, atkmsg)
        } else if (embedTitle.includes("戦闘結果")) {
            SSRFlag = false
            atkmsg = atkFlag

        }
    } else if (funcs.isKeepFighting(client, message)) {
        await funcs.UsedElixir(client, message, atkmsg)
    }
    time = setTimeout(() => message.channel?.send("::atk to"), Timeout)
});

client.login(process.env.TOKEN);