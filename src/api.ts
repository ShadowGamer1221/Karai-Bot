import express from 'express';
import { config } from './config';
import { logAction } from './handlers/handleLogging';
import ms from 'ms';
import { findEligibleRole } from './handlers/handleXpRankup';
import { ButtonBuilder, EmbedBuilder, TextChannel, time, ButtonStyle, ChannelType, PermissionsBitField, ActivityType } from 'discord.js';
import { discordClient } from './main';
import { checkIconUrl, infoIconUrl, mainColor, greenColor, redColor } from './handlers/locale';
import promote from './commands/admin/promote';
import { WarningsModel } from './database/models/warnings';
import { groupBy } from 'lodash';
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
            'Soul': '<:kr_soul:1175303848877891685>',
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
            .setFooter({ text: `.gg/Yrh8EHp2Sq` })
            .setTimestamp();

        let channelSend: TextChannel;
        channelSend = await discordClient.channels.fetch('1171130227213222041') as TextChannel;
        channelSend.send({ embeds: [embed] });
        const message = channelSend.lastMessage;

        if (amount.includes('Legendary')) {
                let channelSend: TextChannel;
                channelSend = await discordClient.channels.fetch('1171130227213222041') as TextChannel;
                channelSend.send({ 
                    content: `<@1143229567625068696> <@721571070380867604> <@375856118536077314> <@&872580455348723722>`,
                    allowedMentions: { roles: ['872580455348723722'] }
            });
        }

        if (amount.includes('Mythic')) {
                let channelSend: TextChannel;
                channelSend = await discordClient.channels.fetch('1171130227213222041') as TextChannel;
                channelSend.send({ 
                    content: `<@1143229567625068696> <@721571070380867604> <@375856118536077314> <@&872580455348723722>`,
                    allowedMentions: { roles: ['872580455348723722'] }
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

app.get('/currentstatus', async (req, res) => {
    try {
        const status = discordClient.user.presence.status;
        res.send({ success: true, status });
    } catch (error) {
        console.error(error);
        res.send({ success: false, msg: 'Failed to get current status.' });
    }
});

app.get('/userwarnings', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.send({ success: false, msg: 'Missing parameters.' });
        }

        const guildId = '872395463368769576';

        const userData = await WarningsModel.find({ Guild: guildId, User: userId }).exec();

        if (userData.length > 0) {
            const warnings = userData.map((warning) => ({
                moderator: warning.User,
                warnId: warning.Case,
                reason: warning.Warnings[0].Reason // Assuming there is only one warning per document
            }));

            return res.send({ success: true, warnings });
        } else {
            return res.send({ success: false, msg: 'No warnings found.' });
        }
    } catch (error) {
        console.error(error);
        return res.send({ success: false, msg: 'Failed to get user warnings.' });
    }
});

app.post('/warn', async (req, res) => {
    try {
        const { userId, reason } = req.body;

        if (!userId || !reason) {
            return res.send({ success: false, msg: 'Missing parameters.' });
        }

        const guildId = '872395463368769576';

        const member = await discordClient.guilds.cache.get(guildId).members.fetch(userId);

        if (!member) {
            return res.send({ success: false, msg: 'The mentioned user is not in this server.' });
        }

        const roles = member.roles.cache;

        const staffRole = member.guild.roles.cache.find((r) => r.id === config.permissions.moderators[0]);

        if (!staffRole) {
            return res.send({ success: false, msg: 'The staff role was not found.' });
        }

        if (!roles.has(staffRole.id)) {
            return res.send({ success: false, msg: 'The mentioned user is not a staff member.' });
        }

        const currentWarnings = await WarningsModel.find({ Guild: guildId, User: userId }).exec();

        const warningCount = currentWarnings.length;

        const newWarning = {
            Case: warningCount + 1,
            Moderator: userId,
            Reason: reason,
        };

        const warningData = {
            Guild: guildId,
            User: userId,
            Warnings: [newWarning],
        };

        const newWarningModel = new WarningsModel(warningData);

        await newWarningModel.save();

        const dmEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Warning', iconURL: infoIconUrl })
            .setDescription(`**Server:** Karai Pirates\n**Action:** Warn\n**Reason:** ${reason}`)
            .setColor(mainColor)
            .setFooter({ text: `Case ID: ${warningCount + 1}`})
        member.send({ embeds: [dmEmbed] });

        const successEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Success!', iconURL: checkIconUrl })
            .setColor(greenColor)
            .setDescription(`Successfully warned <@${userId}> for the following reason:\n\n**${reason}**`);
        res.send({ success: true, msg: successEmbed.toJSON() });

        const channelSend: TextChannel = await discordClient.channels.fetch('1168628274759471155') as TextChannel;
        const reasonEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Karai Logs', iconURL: infoIconUrl })
            .setColor(mainColor)
            .setDescription(`**Staff Member:** API Action\n**Action:** Warn\n**Target:** ${member}\n**Reason:** ${reason}`)
            .setTimestamp();
        channelSend.send({ embeds: [reasonEmbed] });
    } catch (error) {
        console.error(error);
        res.send({ success: false, msg: 'Failed to warn user.' });
    }
});

app.get('/case', async (req, res) => {
    try {
        const { caseId } = req.query;

        if (!caseId) {
            return res.send({ success: false, msg: 'Missing parameters.' });
        }

        const guildId = '872395463368769576';
        const data = await WarningsModel.findOne({ Guild: guildId, 'Warnings.Case': caseId }).exec();
        const fields = data.Warnings.map((warning: any) => ({
            case: warning.Case,
            reason: warning.Reason,
            moderator: warning.Moderator,
            date: warning.Date}));
        res.send({ success: true, fields });
    } catch (error) {
        console.error(error);
        res.send({ success: false, msg: 'Failed to get case.' });
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

        // Find the previous role below the current one
        const prevRole = member.guild.roles.cache.find((r) => r.position === currentRolePosition - 1);

        if (!prevRole) {
            return res.send({ success: false, msg: 'No role found below the current one.' });
        }

        if (!roles.has(prevRole.id)) {
            if (prevRole.position >= currentRolePosition) {
                return res.send({ success: false, msg: 'The specified role must be lower in position than the user\'s current role.' });
            }

            try {
                // Remove the user's highest role
                const highestRole = member.roles.highest;
                await member.roles.remove(highestRole);

                // Add the demoted role
                await member.roles.add(prevRole);

                const dmEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Karai Crew', iconURL: infoIconUrl })
                    .setDescription(`You have been demoted to the **${prevRole.name}** role.`);
                member.send({ embeds: [dmEmbed] });

                const successEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Success!', iconURL: checkIconUrl })
                    .setColor(greenColor)
                    .setDescription(`Successfully demoted <@${userId}> to the <@&${prevRole.id}> role and removed the highest role.`);
                res.send({ success: true, msg: successEmbed.toJSON() });

                const channelSend: TextChannel = await discordClient.channels.fetch('1168628274759471155') as TextChannel;
                const reasonEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Karai Logs', iconURL: infoIconUrl })
                    .setColor(mainColor)
                    .setDescription(`**Staff Member:** API Action\n**Action:** Demote\n**Target:** ${member}\n**Reason:** Demotion from \`${highestRole.name}\` to \`${prevRole.name}\``)
                    .setTimestamp();
                channelSend.send({ embeds: [reasonEmbed] });
            } catch (error) {
                console.error(error);
                res.send({ success: false, msg: `Failed to demote ${member} to the <@&${prevRole.id}> role and remove the highest role.` });
            }
        } else {
            res.send({ success: false, msg: `${member} already has the selected role.` });
        }
    } catch (error) {
        console.error(error);
        res.send({ success: false, msg: 'Failed to demote user.' });
    }
});

app.post('/apply', async (req, res) => {
    try {
        const { userId } = req.body;

        const guild = discordClient.guilds.cache.get('872395463368769576');
        const memberfetch = await discordClient.guilds.cache.get('872395463368769576').members.fetch(userId);

        // Define a category for the clan application channels (you may need to create the category first).
        const categoryID = '1168840654672109629'; // Replace with the actual category ID.

        // Rest of your code goes here...
        const channelName = `application-${memberfetch.user.tag}`;

        // Get the staff role.
        const staffRole = guild.roles.cache.get(config.permissions.recruiter[0]);

        if (!staffRole) {
            // Handle the case where the staff role is not found.
            console.log('Staff role not found.');
            return res.send({ success: false, msg: 'Staff role not found.' });
        }

        // Create the application channel.
        const applicationChannel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText, // Specify the channel type as text.
            parent: categoryID, // Set the category for the channel.
            permissionOverwrites: [
                {
                    id: memberfetch.id,
                    allow: [PermissionsBitField.Flags.ViewChannel], // Allow the user to view the channel.
                },
                {
                    id: staffRole.id,
                    allow: [PermissionsBitField.Flags.ViewChannel], // Allow staff to view the channel.
                },
                {
                    id: guild.roles.everyone,
                    deny: [PermissionsBitField.Flags.ViewChannel], // Deny everyone else from viewing the channel.
                },
            ],
        });

        // Store the application channel ID for later use.
        const applicationChannelID = applicationChannel.id;

        // Send a welcome message in the channel.
        const welcomeEmbed = new EmbedBuilder()
            .setTitle('Crew Application')
            .setDescription('Welcome to the crew application process. A recruiter will be with you shortly. Please answer the following questions:\n\n**1.** What is your total bounty right now?\n\n**2.** What is your current level?\n\n**3.** How frequently do you plan to be active each day?\n\n**4.** Why are you interested in becoming a part of our crew?')
            .setColor(greenColor) // Green color
            .setAuthor({ name: memberfetch.user.tag, iconURL: memberfetch.displayAvatarURL() });

        await applicationChannel.send({ content: `<@&1109445519052390400>`, embeds: [welcomeEmbed], allowedMentions: { roles: ['1109445519052390400'] }});

        // Create a "Close" button.
        const closeButton = new ButtonBuilder()
            .setCustomId('close')
            .setLabel('Close')
            .setEmoji('🔒')
            .setStyle(ButtonStyle.Danger);

        // Send the action row with the "Close" button.
        await applicationChannel.send({
            components: [
                {
                    type: 1,
                    components: [
                        closeButton,
                    ],
                },
            ],
        });

        // Send a success message mentioning the created ticket channel.
        const successEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Success!', iconURL: checkIconUrl }) // Replace with the icon URL.
            .setColor(greenColor) // Green color
            .setDescription(`Successfully created your application ticket in ${applicationChannel}!`)
            .setTimestamp();

        res.send({ success: true, msg: successEmbed.toJSON() });

        // Handle button interactions using the "interactionCreate" event.
        discordClient.on('interactionCreate', async (interaction) => {
            if (!interaction.isButton()) return;

            if (interaction.customId === 'close' && interaction.channel?.id === applicationChannelID) {
                // Handle "Close" button press by deleting the specific application channel.
                applicationChannel.delete()
                    .then(() => {
                        // Send a DM to the user that their application has been closed.
                        const closeEmbed = new EmbedBuilder()
                            .setAuthor({ name: 'Closed', iconURL: infoIconUrl }) // Replace with the icon URL.
                            .setColor(mainColor) // Blue color
                            .setDescription('Your crew application has been closed. If you have been accepted, you should have received a DM from me about your status. If not, please open a new application to inquire about your application status.')
                            .setTimestamp();

                        interaction.user.send({ embeds: [closeEmbed] }).catch(console.error);
                    })
                    .catch(console.error);
            }
        });
    } catch (error) {
        console.error(error);
        res.send({ success: false, msg: 'Internal server error.' });
    }
});

app.post('/botplayingstatus', async (req, res) => {
    try {
        const { type, value } = req.body;

        if (type === 'Playing' || type === 'Listening' || type === 'Watching' || type === 'Competing') {
            await discordClient.user.setActivity(ActivityType[type], value );
            res.send({ success: true });
        } else {
            res.send({ success: false, msg: 'Invalid status type.' });
        }
    } catch (error) {
        console.error(error);
        res.send({ success: false, msg: 'Failed to set playing status.' });
    }
});

app.get('/status', async (req, res) => {
    
});

if(config.api) {
    app.use((req, res, next) => {
        if(!req.headers.authorization || req.headers.authorization !== process.env.API_KEY) return res.send({ success: false, msg: 'Unauthorized' });
        next();
    });
}

app.listen(process.env.PORT || 3001);
export { addSignal };
