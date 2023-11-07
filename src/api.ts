import express from 'express';
import { config } from './config';
import { provider } from './database';
import { logAction } from './handlers/handleLogging';
import ms from 'ms';
import { findEligibleRole } from './handlers/handleXpRankup';
import { EmbedBuilder, TextChannel } from 'discord.js';
import { discordClient } from './main';
import { infoIconUrl, mainColor } from './handlers/locale';
const app = express();
require('dotenv').config();

let isCooldownActive = false;

let signals = [];
app.use(express.json());

app.get('/', (req, res) => {
    res.sendStatus(200);
});

const generateSignalId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for(let i = 0; i < 7; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    if(signals.find((signal) => signal.id === result)) return generateSignalId();
    return result;
}

const addSignal = (signal) => {
    signals.push({
        id: generateSignalId(),
        signal,
    });
}

app.post('/stock', async (req, res) => {
    if (isCooldownActive) {
        return res.status(429).send({ success: false, msg: 'Request cooldown in effect' });
    }

    const { amount } = req.body;
    if(!amount) return res.send({ success: false, msg: 'Missing parameters.' });

    if (amount.includes('legendary')) {
        // If the content contains "Legendary," ping the role with the specified ID
        try {
            const roleToPingId = '852584030401462292';
            const roleToPing = await discordClient.guilds.cache.get('872395463368769576')?.roles.fetch(roleToPingId);
            if (roleToPing) {
                const channelSend = await discordClient.channels.fetch('1171130227213222041') as TextChannel;

                // Send a message to ping the role
                await channelSend.send(`<@&${roleToPing.id}>`);
            }
        } catch (err) {
            console.error('Error pinging the role:', err);
        }
    }

    isCooldownActive = true;

    setTimeout(() => {
        isCooldownActive = false;
    }, 5 * 60 * 1000); // Set the cooldown to 5 minutes (5 * 60 * 1000 milliseconds)

    try {
        const receivedMessage = amount;

        const emojiMap = {
            'Current Stock:': ' ',
            'Spike': '<:kr_Spike:1171135471284408420>',
            'Spin':  '<:kr_spin:1171141225257123971>',
            'Clear': '<:kr_Clear:1056146153432944691>',
            'Chop':  '<:kr_Chop:1171135528943484999>',
            'Bomb': '<:kr_Bomb:1171135637903126620> ',
            'Barrier': '<:Barrier:1056145863145177098>',
            'String': '<:kr_String:1056146220856397874>',
            'Paw': '<:kr_Paw:1171135565945655377>',
            'Sand': '<:kr_Sand:1056146192603553832>',
            'Smoke': '<:kr_smoke:1171135549269098570>',
            'Buddha': '<:kr_Buddha:1171135448672907296>',
            'Mammoth': '<:kr_Mammoth:1171135612900880447>',
            'Snow': '<:kr_Snow:1171135582458617956>',
            'Electricity': '<:kr_Electricity:1056146319401549904>',
            'Gas': '<:kr_Gas:1171137646903435364>',
            'Magnet': '<:kr_magnet:1171137673721819146>',
            'venom': '<:venom:1071257298015629382>',
            'Gum': '<:kr_Gum:1171136697728241755>',
            'Phoenix': '<:kr_Phoenix:1171138936664498196>',
            'Dough': '<:kr_Dough:1056146125985435698>',
            'Flame': '<:kr_Flame:1056146107631153172>',
            'Gravity': '<:kr_Gravity:1056145836658147388>',
            'Ice': '<:kr_Ice:1056145990970769438>',
            'Magma': '<:kr_Magma:1056148368507797554>',
            'Light': '<:kr_Light:1056146172839997450>',
            'Operation': '<:kr_Operation:1056146276984553482>',
            'Tremor': '<:kr_Tremor:1056145903372730388>',
            'Darkness': '<:kr_Darkness:1056145805209247814>',
            'Shadow': '<:kr_shadow:1171135428326342729>',
            'Dragon': '<:kr_dragon:1171136763427831918>',
            'Venom': '<:kr_venom:1171137731125059596>',
        };

        const replaceMessage = receivedMessage.replace(/\[([^\]]+)]/g, (match, name) => {
            const emoji = emojiMap[name];
            return emoji ? emoji : match;
        });

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'Current Stock', iconURL: infoIconUrl })
            .setColor(mainColor)
            .setDescription(`${replaceMessage}`)
            .setTimestamp();

        let channelSend: TextChannel;
        channelSend = await discordClient.channels.fetch('1171130227213222041') as TextChannel;
        channelSend.send({ embeds: [embed] });
        const message = channelSend.lastMessage;

        try {
            await message.crosspost();
        } catch (err) {
            console.log(err);
        }

        return res.send({ success: true });
    } catch (err) {
        return res.send({ success: false, msg: 'Failed to add stock.' });
    }
});


if(config.api) {
    app.use((req, res, next) => {
        if(!req.headers.authorization || req.headers.authorization !== process.env.API_KEY) return res.send({ success: false, msg: 'Unauthorized' });
        next();
    });
}

app.listen(process.env.PORT || 3001);
export { addSignal };
