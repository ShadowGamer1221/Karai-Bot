import { QbotClient } from './structures/QbotClient';
import { handleInteraction } from './handlers/handleInteraction';
import { handleLegacyCommand } from './handlers/handleLegacyCommand';
import { config } from './config'; 
import { Group } from 'bloxy/dist/structures';
import { EmbedBuilder, TextChannel, VoiceChannel, AuditLogEvent } from 'discord.js';
import connect from './database/connect';
import { infoIconUrl, mainColor } from './handlers/locale';
require('dotenv').config();

// [Ensure Setup]
if(!process.env.ROBLOX_COOKIE) {
    console.error('ROBLOX_COOKIE is not set in the .env file.');
}

// [API]
require('./api');

// [Database]
connect();

// [Clients]
const discordClient = new QbotClient();
discordClient.login(process.env.DISCORD_TOKEN);

// [Handlers]
discordClient.on('interactionCreate', handleInteraction as any);
discordClient.on('messageCreate', handleLegacyCommand);

// [Crosspost]
discordClient.on('ready', () => {
    // Initial execution
    checkAndCrosspost();

    // Schedule repeated execution every 5 seconds
    setInterval(() => {
        checkAndCrosspost();
    }, 5000);
});

async function checkAndCrosspost() {
    try {
        const channel = await discordClient.channels.fetch('1171130227213222041') as TextChannel;
        const message = await channel.lastMessage;

        if (message) {
            await message.crosspost();
        } else {
            console.log('No messages found in the specified channel.');
        }
    } catch (err) {
        console.error(err);
    }
}

// [Server Stats]
discordClient.on('ready', () => {
    const botChannelId = '1137703394048491520';
    const memberChannelId = '1137703386179969066';
    const normalMemberChannelId = '1137703389980000296';

    async function updateChannelName(channel: VoiceChannel, text: string) {
        await channel.setName(text);
    }

    const botChannel = discordClient.channels.cache.get(botChannelId);
    const memberChannel = discordClient.channels.cache.get(memberChannelId);
    const normalMemberChannel = discordClient.channels.cache.get(normalMemberChannelId);

    if (botChannel && botChannel instanceof VoiceChannel && memberChannel && memberChannel instanceof VoiceChannel && normalMemberChannel && normalMemberChannel instanceof VoiceChannel) {
        setInterval(async () => {
            const guild = discordClient.guilds.cache.get('900771217345216532');

            if (guild) {
                await guild.members.fetch();

                const memberCount = guild.memberCount;
                const botCount = guild.members.cache.filter(member => member.user.bot).size;
                const normalMemberCount = memberCount - botCount;

                updateChannelName(botChannel, `Bots: ${botCount}`);
                updateChannelName(memberChannel, `Total Members: ${memberCount}`);
                updateChannelName(normalMemberChannel, `Members: ${normalMemberCount}`);
            } else {
                console.error('Server not found.');
            }
        }, 5000); // Update every 5 seconds (5,000 milliseconds)
    } else {
        console.error('Voice channels not found.');
    }
});

// [Welcome New Members]
discordClient.on('guildMemberAdd', (member) => {
    const generalChannel = member.guild.channels.cache.get('1187825749319762061') as TextChannel; // Change to your #general channel ID
    const recruitmentChannel = member.guild.channels.cache.get('1168846006264270858') as TextChannel; // Change to your #recruitment channel ID

    if (generalChannel) {
        const welcomeEmbed = {
            author: ({ name: 'Member Join', iconURL: infoIconUrl }),
            color: 0x906FED,
            title: `Welcome to the server, ${member.user.username}!`,
            description: 'We are glad to have you here. If you would like to become a part of the Karai Crew, please consider applying in the <#1168846006264270858> channel!',
            fields: [
                {
                    name: 'How to Apply',
                    value: `Head over to ${recruitmentChannel} and follow the application process.`,
                },
            ],
            thumbnail: {
                url: member.user.displayAvatarURL(),
            },
        };

        generalChannel.send({ embeds: [welcomeEmbed] });
        generalChannel.send({ 
            allowedMentions: { parse: ['users'] },
            content: `<@${member.user.id}>`,
         });
    }
});

// [Leave Members]
discordClient.on('guildMemberRemove', (member) => {
    const generalChannel = member.guild.channels.cache.get('1187826049787105280') as TextChannel; // Change to your #general channel ID

    if (generalChannel) {
        const welcomeEmbed = {
            color: 0xFA5757,
            title: `😢 Goodbye, ${member.user.username}!`,
            description: `**See you next time buddy! 😢**`,
            thumbnail: {
                url: member.user.displayAvatarURL(),
            },
        };

        generalChannel.send({ embeds: [welcomeEmbed] });
    }
});

// [Module]
export { discordClient };