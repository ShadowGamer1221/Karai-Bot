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
    const { amount } = req.body;
    if(!amount) return res.send({ success: false, msg: 'Missing parameters.' });
    try {
        const receivedMessage = amount;

        const emojiMap = {
            'Spike': '<:kr_Spike:1171135471284408420>',
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
        channelSend = await discordClient.channels.fetch('1170647793141026836') as TextChannel;
        channelSend.send({ embeds: [embed] })

        return res.send({ success: true });
    } catch (err) {
        return res.send({ success: false, msg: 'Failed to add stock.' });
    }
});

app.post('/kick', async (req, res) => {
    const { userId } = req.body;
    if(!userId) return res.send({ success: false, msg: 'Missing parameters.' });
    try {

        const logEmbed = new EmbedBuilder()
        .setAuthor({ name: 'Karai API Action', iconURL: infoIconUrl })
        .setColor(mainColor)
        .setDescription(`**Action:** Kick\n**User:** <@${userId}>`)
        .setTimestamp();

        let channelSend: TextChannel;
        channelSend = await discordClient.channels.fetch('1170647793141026836') as TextChannel;
        channelSend.send({ embeds: [logEmbed] })

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
