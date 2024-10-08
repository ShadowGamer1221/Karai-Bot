import { QbotClient } from './structures/QbotClient';
import { handleInteraction } from './handlers/handleInteraction';
import { handleLegacyCommand } from './handlers/handleLegacyCommand';
import { config } from './config'; 
import { Group } from 'bloxy/dist/structures';
import { EmbedBuilder, TextChannel, VoiceChannel, ChannelType, InteractionType } from 'discord.js';
import connect from './database/connect';
import { infoIconUrl, mainColor } from './handlers/locale';
import { Client as RobloxClient } from 'bloxy';
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
        }
    } catch (err) {
        console.error(err);
    }
}

// [Server Stats]
discordClient.on('ready', () => {
    const botChannelId = '1188115162817888346';
    const memberChannelId = '1188115370473701447';
    const normalMemberChannelId = '1188115438903758878';

    async function updateChannelName(channel: VoiceChannel, text: string) {
        await channel.setName(text);
    }

    const botChannel = discordClient.channels.cache.get(botChannelId);
    const memberChannel = discordClient.channels.cache.get(memberChannelId);
    const normalMemberChannel = discordClient.channels.cache.get(normalMemberChannelId);

    if (botChannel && botChannel instanceof VoiceChannel && memberChannel && memberChannel instanceof VoiceChannel && normalMemberChannel && normalMemberChannel instanceof VoiceChannel) {
        setInterval(async () => {
            const guild = discordClient.guilds.cache.get('872395463368769576');

            if (guild) {
                await guild.members.fetch();

                const memberCount = guild.memberCount;
                const fetchCrewmembers = await guild.roles.fetch('1057796072531042374').then(role => role.members.size);
                const botCount = guild.members.cache.filter(member => member.user.bot).size;
                const normalMemberCount = fetchCrewmembers as Number;

                updateChannelName(botChannel, `Bots: ${botCount}`);
                updateChannelName(memberChannel, `Total Members: ${memberCount}`);
                updateChannelName(normalMemberChannel, `Crew Members: ${normalMemberCount}`);
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

// [Roblox Login]
const robloxClient = new RobloxClient({ credentials: { cookie: process.env.ROBLOX_COOKIE } });
let robloxGroup: Group = null;
(async () => {
    await robloxClient.login().catch(console.error);
    robloxGroup = await robloxClient.getGroup(config.groupId);
})();

// [Slash Commands]
discordClient.on('interactionCreate', async interaction => {
    if (interaction.type === InteractionType.ModalSubmit) {
        if (interaction.customId === 'myModalCustomId') {
            const userInput = interaction.fields.getTextInputValue('textInputCustomId');
            // Process the input
            await interaction.reply(`You entered: ${userInput}`);
        }
    }
});


// [Module]
export { discordClient, robloxClient, robloxGroup };