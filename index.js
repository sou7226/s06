require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const client = new Client({ checkUpdate: false });
const prefix = process.env.prefix
const funcs = require('./src/funcs');

let ResetSSRFlag = true;
let SSRFlag = false;
let atkFlag = "::atk";
let adminId = new Set(process.env.ADMIN_LIST.split(','));
let guildIds = new Set(process.env.GUILD_IDS.split(','));
let Timeout = parseInt(process.env.Timeout);
let time;
let targetChannelID;
let attackMessage = "::atk";
let attackCounter = 0;

client.once('ready', async () => {
    console.log(`${client.user.displayName} is ${prefix}`)
    targetChannelID = await funcs.loadVariablesFromFile(client);
});

client.on("messageCreate", async (message) => {
    if (!adminId.has(message.author.id) || !guildIds.has(message.guild.id)) return;
    [targetChannelID, ResetSSRFlag] = funcs.setChannel(prefix, message, targetChannelID, ResetSSRFlag, attackMessage)

    if (message.content.startsWith(prefix)) {
        attackMessage = await funcs.moderate(message, prefix, attackMessage, targetChannelID, ResetSSRFlag);
    }

    if (targetChannelID !== message.channel.id) return;
    clearTimeout(time);

    if (message.embeds.length > 0 && message.embeds[0].title) {
        const embedTitle = message.embeds[0].title
        if (embedTitle.includes("が待ち構えている")) {
            attackCounter = 0;
            if (SSRFlag) {
                await funcs.sendMessage(message, "::luna")
                SSRFlag = false
            }
            attackMessage = atkFlag
            Timeout = parseInt(process.env.Timeout)
            if (message.embeds[0].author.name.includes("超強敵")) {
                atkFlag = attackMessage
                attackMessage = "::i f"
            }
            if (funcs.checkSSRRank(message.embeds[0].author.name) && ResetSSRFlag) {
                atkFlag = attackMessage
                attackMessage = "::i f"
                SSRFlag = true
                Timeout = embedTitle.includes("狂気ネコしろまる") ? parseInt(process.env.Timeout) : 60000 * 5;
            } else {
                await funcs.sendMessage(message, attackMessage)
                attackCounter++;
            }
        }
    } else if (message?.content.includes("倒すなら拳で語り合ってください。") ||
        message?.content.includes("倒したいなら魔法で..........") ||
        message?.content.includes("この敵には攻撃は不可能のようだ")) {
        await funcs.sendMessage(message, "::re")
    } else if (attackMessage === "::atk" && funcs.isKeepFighting(client, message) && ResetSSRFlag && !SSRFlag) {
        await funcs.UsedElixir(client, message, attackMessage, attackCounter)
    } else if (attackMessage === "::atk" && funcs.isKeepFighting(client, message) && ResetSSRFlag && SSRFlag) {
        message.channel?.send("::re")
    } else if (attackMessage === "::i f" && funcs.isFightFb(client, message)) {
        await funcs.sendMessage(message, attackMessage)
        attackCounter++;
    } else if (message.content.includes(`<@${client.user.id}>はもうやられている`)) {
        await funcs.sendMessage(message, "::i e")
    }
    time = setTimeout(() => message.channel?.send(`${attackMessage} to`), Timeout)

});
client.login(process.env.TOKEN);

process.on('uncaughtException', error => {
    console.error('エラー発生、プロセスを終了:', error);
    process.exit(1);
});
