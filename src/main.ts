import { QbotClient } from './structures/QbotClient';
import { handleInteraction } from './handlers/handleInteraction';
import { handleLegacyCommand } from './handlers/handleLegacyCommand';
import { config } from './config'; 
import { Group } from 'bloxy/dist/structures';
import { VoiceChannel } from 'discord.js';
require('dotenv').config();

// [Ensure Setup]
if(!process.env.ROBLOX_COOKIE) {
    console.error('ROBLOX_COOKIE is not set in the .env file.');
    process.exit(1);
}

require('./api');

// [Clients]
const discordClient = new QbotClient();
discordClient.login(process.env.DISCORD_TOKEN);

// [Handlers]
discordClient.on('interactionCreate', handleInteraction as any);
discordClient.on('messageCreate', handleLegacyCommand);

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

    discordClient.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;
    
        if (interaction.customId === 'accept_trade') {
            // Handle the "Accept Trade" button click
            const userWhoClicked = interaction.user;
            const tradeRequestUser = interaction.message.embeds[0].fields[0].value;
    
            // Send a direct message to the user who used the /trade command
            userWhoClicked.send(`User ${tradeRequestUser} wants to accept your trade offer.`);
        }
    });

// [Module]
export { discordClient };
