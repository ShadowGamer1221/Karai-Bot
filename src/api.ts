import express from 'express';
import { config } from './config';
import { logAction } from './handlers/handleLogging';
import ms from 'ms';
import { findEligibleRole } from './handlers/handleXpRankup';
import { EmbedBuilder, TextChannel, time } from 'discord.js';
import { discordClient } from './main';
import { checkIconUrl, infoIconUrl, mainColor, greenColor } from './handlers/locale';
import promote from './commands/admin/promote';
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

        const nextStockDrop = new Date(Date.now() + ms('2h'));
        const timeString = time(nextStockDrop, 'R');

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'Stock Announcement', iconURL: infoIconUrl })
            .setColor(mainColor)
            .setDescription(`${replaceMessage}\n\nNext stock drop ${timeString}`)
            .setFooter({ text: `.gg/karai` })
            .setTimestamp();

        let channelSend: TextChannel;
        channelSend = await discordClient.channels.fetch('1171130227213222041') as TextChannel;
        channelSend.send({ embeds: [embed] });
        const message = channelSend.lastMessage;

        if (amount.includes('Legendary')) {
                let channelSend: TextChannel;
                channelSend = await discordClient.channels.fetch('1171130227213222041') as TextChannel;
                channelSend.send({ 
                    content: `<@1143229567625068696> <@721571070380867604> <@375856118536077314>`,
            });
        }

        if (amount.includes('Mythic')) {
                let channelSend: TextChannel;
                channelSend = await discordClient.channels.fetch('1171130227213222041') as TextChannel;
                channelSend.send({ 
                    content: `<@1143229567625068696> <@721571070380867604> <@375856118536077314>`,
            });
        }

        return res.send({ success: true });
    } catch (err) {
        return res.send({ success: false, msg: 'Failed to add stock.' });
    }
});

app.post('/announce', async (req, res) => {
    const { announce } = req.body;
    if(!announce) return res.send({ success: false, msg: 'Missing parameters.' });
    try {

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'Announcement', iconURL: infoIconUrl })
            .setColor(mainColor)
            .setDescription(`${announce}`)
            .setFooter({ text: `.gg/karai` })
            .setTimestamp();

        let channelSend: TextChannel;
        channelSend = await discordClient.channels.fetch('1171130227213222041') as TextChannel;
        channelSend.send({ embeds: [embed] });

        return res.send({ success: true });
    } catch (err) {
        return res.send({ success: false, msg: 'Missing announcement string.' });
    }
});

app.post('/promote', async (req, res) => {
    try {
        const { userId } = req.body;

        const member = await discordClient.guilds.cache.get('872395463368769576').members.fetch(userId);

        if (!member) {
            return res.send({ success: false, msg: 'The mentioned user is not in this server.' });
        }

        const roles = member.roles.cache;

        // Find the current role position
        const currentRolePosition = member.roles.highest.position;

        // Find the next role above the current one
        const nextRole = member.guild.roles.cache.find((r) => r.position === currentRolePosition + 1);

        if (!nextRole) {
            return res.send({ success: false, msg: 'No role found above the current one.' });
        }

        if (!roles.has(nextRole.id)) {
            if (nextRole.position <= currentRolePosition) {
                return res.send({ success: false, msg: 'The specified role must be higher in position than the user\'s current role.' });
            }

            try {
                await member.roles.add(nextRole);

                const dmEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Karai Crew', iconURL: infoIconUrl })
                    .setDescription(`Congratulations! You have been promoted to the **${nextRole.name}** role.`)
                    .setColor(greenColor);
                member.send({ embeds: [dmEmbed] });

                const successEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Success!', iconURL: checkIconUrl })
                    .setColor(greenColor)
                    .setDescription(`Successfully promoted <@${userId}> to the <@&${nextRole.id}> role`);
                res.send({ success: true, msg: successEmbed.toJSON() });

                const channelSend: TextChannel = await discordClient.channels.fetch('1168628274759471155') as TextChannel;
                const reasonEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Karai Logs', iconURL: infoIconUrl })
                    .setColor(mainColor)
                    .setDescription(`**Staff Member:** API Action\n**Action:** Promote\n**Target:** ${member}\n**Reason:** Promotion to \`${nextRole.name}\``)
                    .setTimestamp();
                channelSend.send({ embeds: [reasonEmbed] });
            } catch (error) {
                console.error(error);
                res.send({ success: false, msg: `Failed to promote ${member} to the <@&${nextRole.id}> role.` });
            }
        } else {
            res.send({ success: false, msg: `${member} already has the selected role.` });
        }
    } catch (error) {
        console.error(error);
        res.send({ success: false, msg: 'Failed to promote user.' });
    }
});

app.post('/botstatus', async (req, res) => {
    try {
        const { status } = req.body;

        if (status === 'online' || status === 'idle' || status === 'dnd' || status === 'invisible') {
            await discordClient.user.setStatus(status);
            res.send({ success: true });
        } else {
            res.send({ success: false, msg: 'Invalid status.' });
        }
    } catch (error) {
        console.error(error);
        res.send({ success: false, msg: 'Failed to set status.' });
    }
});

app.post('/demote', async (req, res) => {
    try {
        const { userId } = req.body;

        const member = await discordClient.guilds.cache.get('872395463368769576').members.fetch(userId);

        if (!member) {
            return res.send({ success: false, msg: 'The mentioned user is not in this server.' });
        }

        const roles = member.roles.cache;

        // Find the current role position
        const currentRolePosition = member.roles.highest.position;

        // Find the next role above the current one
        const nextRole = member.guild.roles.cache.find((r) => r.position === currentRolePosition - 1);

        if (!nextRole) {
            return res.send({ success: false, msg: 'No role found above the current one.' });
        }

        if (!roles.has(nextRole.id)) {
            if (nextRole.position <= currentRolePosition) {
                return res.send({ success: false, msg: 'The specified role must be higher in position than the user\'s current role.' });
            }

            try {
                await member.roles.add(nextRole);

                const dmEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Karai Crew', iconURL: infoIconUrl })
                    .setDescription(`You have been demoted to the **${nextRole.name}** role.`)
                    .setColor(greenColor);
                member.send({ embeds: [dmEmbed] });

                const successEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Success!', iconURL: checkIconUrl })
                    .setColor(greenColor)
                    .setDescription(`Successfully demoteted <@${userId}> to the <@&${nextRole.id}> role`);
                res.send({ success: true, msg: successEmbed.toJSON() });

                const channelSend: TextChannel = await discordClient.channels.fetch('1168628274759471155') as TextChannel;
                const reasonEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Karai Logs', iconURL: infoIconUrl })
                    .setColor(mainColor)
                    .setDescription(`**Staff Member:** API Action\n**Action:** Demote\n**Target:** ${member}\n**Reason:** Promotion to \`${nextRole.name}\``)
                    .setTimestamp();
                channelSend.send({ embeds: [reasonEmbed] });
            } catch (error) {
                console.error(error);
                res.send({ success: false, msg: `Failed to demote ${member} to the <@&${nextRole.id}> role.` });
            }
        } else {
            res.send({ success: false, msg: `${member} already has the selected role.` });
        }
    } catch (error) {
        console.error(error);
        res.send({ success: false, msg: 'Failed to demote user.' });
    }
});

app.get('/currentstock', async (req, res) => {
    try {
        const channelSend: TextChannel = await discordClient.channels.fetch('1171130227213222041') as TextChannel;
        const message = channelSend.lastMessage;
        res.send({ success: true, msg: message.content });
    } catch (error) {
        console.error(error);
        res.send({ success: false, msg: 'Failed to get current stock.' });
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
