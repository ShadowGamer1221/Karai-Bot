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

class ClanDenyCommand extends Command {
    constructor() {
        super({
            trigger: 'deny',
            description: 'Deny a user from joining the crew',
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
                    description: 'The application channel where it needs to be sent in.',
                    isLegacyFlag: false,
                    required: true,
                    type: 'DiscordChannel',
                },
                {
                    trigger: 'reason',
                    description: 'The reason for denying this member.',
                    isLegacyFlag: false,
                    required: true,
                    type: 'String',
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
        mention = mention.replace("<", "");
        mention = mention.replace("!", "");
        mention = mention.replace("@", "");
        mention = mention.replace(">", "");
        console.log(mention);
        const userId = mention; // Replace with the actual user's ID
        const userToDeny = await discordClient.users.fetch(userId);

        let channelSend: TextChannel;
        channelSend = await discordClient.channels.fetch('1168628274759471155') as TextChannel;
        console.log(channelSend)

        const logEmbed = new EmbedBuilder()
        .setAuthor({ name: 'Karai Logs', iconURL: infoIconUrl })
        .setDescription(`**Recruiter:** ${ctx.user}\n**Action:** Deny\n**Denied Member:** ${userToDeny}\n**Reason:** ${ctx.args['reason']}`)
        .setColor(mainColor)
        .setFooter({ text: `User ID: ${ctx.user.id}` })
        .setTimestamp();

        const logs = await channelSend.send({ embeds: [logEmbed] });

        // Send a DM to the user
        const sendDM = new EmbedBuilder()
            .setAuthor({ name: 'Karai Information', iconURL: infoIconUrl })
            .setColor(mainColor)
            .setDescription(`We regret to inform you that your application to join the crew has been **denied**. Thank you for your interest, and we appreciate your application. If you have any questions or would like feedback on your application, please feel free to reach out to us.\n\nBest regards,\n**~ Karai Leadership**`)
            .setTimestamp();

        userToDeny.send({ embeds: [sendDM] });

        let channelToSend: TextChannel;
        channelToSend = await discordClient.channels.fetch(ctx.args['application-channel']) as TextChannel;
        console.log(channelToSend);

        // Construct the clan denial message embed
        const clanDenyEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Karai Information', iconURL: infoIconUrl })
            .setColor(mainColor)
            .setDescription(`We regret to inform you that your application to join the crew has been **denied**. Thank you for your interest, and we appreciate your application. If you have any questions or would like feedback on your application, please feel free to reach out to us.\n\nBest regards,\n**~ Karai Leadership**`)
            .setTimestamp();

        // Send the embed in the specified channel and tag the user
        const sentMessage = await channelToSend.send({
            content: `${userToDeny}`,
            embeds: [clanDenyEmbed],
        });

        // Send a success message in the current channel
        const successEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Success!', iconURL: checkIconUrl })
            .setColor(greenColor)
            .setDescription(`Clan denial message sent in ${channelToSend}!`)
            .setTimestamp();

        ctx.reply({
            embeds: [successEmbed],
        });
    }
}

export default ClanDenyCommand;