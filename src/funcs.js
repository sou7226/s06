const isKeepFighting = (client, message) => (
    (message.content.includes(`${client.user.displayName}のHP:`) ||
        message.content.includes(`<@${client.user.id}>はもうやられている`)) &&
    !message.content.includes('を倒した！')
);
const sendMessage = async (message, content, ct = coolTime) => {
    await timeout(ct);
    message.channel?.send(content);
};
const isFightFb = (client, message) => (
    !message?.content.includes('を倒した！') &&
    message?.content.includes(`${client.user.displayName}の攻撃！`)
);
const coolTime = parseInt(process.env.coolTime)
const timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const SSRRanks = ["超激レア", "最強", "龍帝", "原初", "天使", "大地の覇者", "虚無", "ありがとう！", "闇の支配者"]
function checkSSRRank(text) {
    for (let i = 0; i < SSRRanks.length; i++) {
        if (text.includes(SSRRanks[i])) {
            return true;
        }
    }
    return false;
}
async function UsedElixir(client, message, atkmsg) {
    if (
        message.content.includes(`${client.user.displayName}のHP:`) &&
        !message.content.includes(`${client.user.displayName}はやられてしまった。。。`) &&
        !message.content.includes('を倒した！')
    ) {
        await sendMessage(message, atkmsg)
    } else if (
        message.content.includes(`${client.user.displayName}のHP:`) &&
        message.content.includes(`${client.user.displayName}はやられてしまった。。。`) &&
        !message.content.includes('を倒した！') ||
        message.content.includes(`${client.user.displayName}のHP:`) &&
        message.content.includes(`${client.user.displayName}は自滅してしまった。。。`) &&
        !message.content.includes('を倒した！') ||
        message.content.includes(`<@${client.user.id}>はもうやられている！`)
    ) {
        await sendMessage(message, "::i e")
    }
}
async function moderate(message, prefix, atkmsg) {
    if (message.content.includes(`${prefix}say`)) {
        message.channel.send(message.content.slice(prefix.length + 3));
    };
    if (message.content.includes(`${prefix}change`)) {
        atkmsg = atkmsg === "::atk" ? '::i f' : '::atk'
        message.channel.send(`change ${atkmsg}`)
    };
    if (message.content.includes(`${prefix}atk`)) {
        message.channel.send('::atk')
    };
    if (message.content.includes(`${prefix}fb`)) {
        message.channel.send('::i f')
    };
    if (message.content.includes(`${prefix}rmap`)) {
        message.channel.send('::rmap')
    };
    if (message.content.includes(`${prefix}i`)) {
        message.channel.send('::i')
    };
    if (message.content.includes(`${prefix}click`)) {
        const args = message.content.slice(prefix.length).trim().split(" ").slice(1);
        const msg = await message.channel.messages.fetch(args[0])
        await clickButton(msg, parseInt(args[1]), parseInt(args[2]))
    };
    return atkmsg
}
function setChannel(prefix, message, targetChannelID, ResetSSRFlag, atkmsg) {
    if (message.content === `${prefix}run`) {
        targetChannelID = message.channel.id;
        if (targetChannelID !== null) {
            message.channel.send(`${atkmsg}`)
        }
    }
    if (message.content === `${prefix}end`) {
        targetChannelID = null;
        if (targetChannelID === null) {
            message.channel.send("```py\nend\n```")
        }
    }
    if (message.content.includes(`${prefix}reset`)) {
        ResetSSRFlag = ResetSSRFlag ? false : true
        message.channel.send(`超激レアリセットモード ${ResetSSRFlag}`)
    };
    return [targetChannelID, ResetSSRFlag]
}
const spawnSuperRareProcess = (message, SSRFlag, roleID, Timeout) => {
    message.channel.send(`<@&${roleID}>`)
    SSRFlag = true
    Timeout = 60000 * 5
    return [SSRFlag, Timeout]
}
module.exports = {
    coolTime: coolTime,
    SSRRanks: SSRRanks,
    timeout: timeout,
    isKeepFighting: isKeepFighting,
    checkSSRRank: checkSSRRank,
    moderate: moderate,
    sendMessage: sendMessage,
    setChannel: setChannel,
    spawnSuperRareProcess: spawnSuperRareProcess,
    UsedElixir: UsedElixir,
    isFightFb: isFightFb
};
