import { discordClient } from '../../main';
import { EmbedBuilder, TextChannel } from 'discord.js';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { config } from '../../config';
import { GuildMember, User } from 'discord.js';
import {
    checkIconUrl,
    getCommandInfoEmbed,
    getCommandListEmbed,
    getCommandNotFoundEmbed,
    mainColor,
    greenColor,
    redColor,
    infoIconUrl,
} from '../../handlers/locale';

class ClanAcceptCommand extends Command {
    constructor() {
        super({
            trigger: 'accept',
            description: 'Accept a user into the clan',
            type: 'ChatInput',
            module: 'application',
            args: [
                {
                    trigger: 'member',
                    description: 'The member that you want to send a DM.',
                    isLegacyFlag: false,
                    required: true,
                    type: 'DiscordUser',
              },
              {
                trigger: 'application-channel',
                description: 'The application channel where it needs to be sended in.',
                isLegacyFlag: false,
                required: true,
                type: 'DiscordChannel',
              }
            ],
            permissions: [
                {
                    type: 'role',
                    ids: config.permissions.recruiter,
                    value: true,
                },
            ],
        });
    }

    async run(ctx: CommandContext) {
        
        let mention = ctx.args['member'];
        mention = mention.replace("<","");
        mention = mention.replace("!","");
        mention = mention.replace("@","");
        mention = mention.replace(">","");
        console.log(mention)
        const userId = mention; // Replace with the actual user's ID
        const userToAccept = await discordClient.users.fetch(userId); 

        let channelSend: TextChannel;
        channelSend = await discordClient.channels.fetch('1168628274759471155') as TextChannel;
        console.log(channelSend)

        const logEmbed = new EmbedBuilder()
        .setAuthor({ name: 'Karai Logs', iconURL: infoIconUrl })
        .setDescription(`**Recruiter:** ${ctx.user}\n**Action:** Accept\n**Accepted Crew Member:** ${userToAccept}`)
        .setColor(mainColor)
        .setFooter({ text: `User ID: ${ctx.user.id}` })
        .setTimestamp();

        const logs = await channelSend.send({ embeds: [logEmbed] });


        // Send a DM to the user
        const sendDM = new EmbedBuilder()
        .setAuthor({ name: 'Karai Information', iconURL: infoIconUrl })
        .setColor(mainColor)
        .setDescription(`Hey, ${userToAccept},\n\nWe are pleased to inform you that you have been **accepted** into our Crew! Your decision to join us is greatly appreciated, and we want to express our sincere gratitude. Even if you're accepted, please continue your bounty hunting efforts and aim to reach the maximum bounty. This will help us climb the leaderboard and establish ourselves as one of the strongest crews.\n\nBest regards,\n**~ Karai Leadership**`)
        .setTimestamp();

        userToAccept.send({ embeds: [sendDM] });

        let channelToSend: TextChannel;
        channelToSend = await discordClient.channels.fetch(ctx.args['application-channel']) as TextChannel;
        console.log(channelToSend)

        // Construct the clan acceptance message embed
        const clanAcceptEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Karai Information', iconURL: infoIconUrl })
            .setColor(mainColor)
            .setDescription(`Hey, ${userToAccept},\n\nWe are pleased to inform you that you have been **accepted** into our Crew! Your decision to join us is greatly appreciated, and we want to express our sincere gratitude. Even if you're accepted, please continue your bounty hunting efforts and aim to reach the maximum bounty. This will help us climb the leaderboard and establish ourselves as one of the strongest crews.\n\nBest regards,\n**~ Karai Leadership**`)
            .setTimestamp();

        // Send the embed in the specified channel and tag the user
        const sentMessage = await channelToSend.send({
            content: `${userToAccept}`,
            embeds: [clanAcceptEmbed],
        });

        // Send a success message in the current channel
        const successEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Success!', iconURL: checkIconUrl })
            .setColor(greenColor)
            .setDescription(`Crew acceptance message sent in ${channelToSend}!`)
            .setTimestamp();

       ctx.reply({
        embeds: [successEmbed]
       });
    }
}

export default ClanAcceptCommand;
