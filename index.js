require('dotenv').config();

const { Client } = require('discord.js-selfbot-v13');
const client = new Client({ checkUpdate: false });
const prefix = process.env.prefix
const roleID = process.env.ROLE_ID
const funcs = require('./src/funcs');
client.once('ready', () => console.log(`${client.user.displayName} is ${prefix}`));
let Timeout = parseInt(process.env.Timeout)
let SSRFlag = false, atkFlag = "::atk", ResetSSRFlag = true
let adminId = new Set(process.env.ADMIN_LIST.split(','));
let guildIds = new Set(process.env.GUILD_IDS.split(','));
let time, targetChannelID
let atkmsg = "::atk", atkcounter = 0;

client.on("messageCreate", async (message) => {
    if (!adminId.has(message.author.id) || !guildIds.has(message.guild.id)) return;
    [targetChannelID, ResetSSRFlag] = await funcs.setChannel(prefix, message, targetChannelID, ResetSSRFlag, atkmsg)
    if (message.content.startsWith(prefix)) {
        atkmsg = await funcs.moderate(client, message, prefix, atkmsg, targetChannelID, ResetSSRFlag);

    }
    if (!targetChannelID || targetChannelID !== message.channel.id) return;
    clearTimeout(time);
    if (message.embeds.length > 0 && message.embeds[0].title) {
        const embedTitle = message.embeds[0].title
        if (embedTitle.includes("が待ち構えている")) {
            atkmsg = atkFlag
            atkcounter = 0;
            SSRFlag = false
            Timeout = parseInt(process.env.Timeout)
            if (funcs.checkSSRRank(message.embeds[0].author.name) &&
                ResetSSRFlag) {
                atkFlag = atkmsg
                atkmsg = "::i f"
                message.channel.send(`<@&${roleID}>`)
                SSRFlag = true
                Timeout = 60000 * 5
            }

            if (message.embeds[0].author.name.includes("超強敵")) {
                atkFlag = atkmsg
                atkmsg = "::i f"
            }
            await funcs.sendMessage(message, atkmsg)
            atkcounter++;
        }
    }
    if (message?.content.includes("倒すなら拳で語り合ってください。") ||
        message?.content.includes("倒したいなら魔法で..........")) {
        await funcs.sendMessage(message, "::re")
    } else if (atkmsg === "::atk") {
        if (funcs.isKeepFighting(client, message) && ResetSSRFlag && !SSRFlag) {
            await funcs.UsedElixir(client, message, atkmsg, atkcounter)
        } else if (funcs.isKeepFighting(client, message) && ResetSSRFlag && SSRFlag) {
            message.channel?.send("::re")
        }
    } else if (atkmsg === "::i f") {
        if (funcs.isFightFb(client, message)) {
            await funcs.sendMessage(message, atkmsg)
            atkcounter++;
        }
    }
    time = setTimeout(() => message.channel?.send(`${atkmsg} to`), Timeout)
});

client.login(process.env.TOKEN);