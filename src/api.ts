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
            'Spike': '<:Spike:1155449245244084275>',
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
