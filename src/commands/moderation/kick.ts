import { config } from '../../config';
import { checkIconUrl, greenColor, infoIconUrl, mainColor, redColor, xmarkIconUrl } from '../../handlers/locale';
import { discordClient } from '../../main';
import { Command } from '../../structures/Command';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { EmbedBuilder, TextChannel } from 'discord.js';

class KickCommand extends Command {
    constructor() {
        super({
            trigger: 'kick',
            description: 'Kick a user from the server.',
            type: 'ChatInput',
            module: 'moderation',
            args: [
                {
                    trigger: 'user',
                    description: 'The user to kick.',
                    type: 'DiscordUser',
                    required: true,
                },
                {
                    trigger: 'reason',
                    description: 'The reason for the kick.',
                    type: 'String',
                    required: false,
                },
            ],
            permissions: [
                {
                    type: 'role',
                    ids: config.permissions.moderators,
                    value: true,
                },
            ],
        });
    }

    async run(ctx: CommandContext) {
        const userToKick = ctx.args['user'];
        const reason = ctx.args['reason'] || 'No reason provided.';

        const member = ctx.guild.members.cache.get(userToKick);

        let channelSend: TextChannel;
        channelSend = await discordClient.channels.fetch('1168628274759471155') as TextChannel;

        if (!member) {
            return ctx.reply({ content: 'The mentioned user is not in this server.' });
        }

        if (member.kickable) {
            try {
                let warnembed = new EmbedBuilder()
                .setDescription(`**Server:** ${ctx.guild.name}\n**Actioned by:** <@${ctx.user.id}>\n**Action:** Kick\n**Reason:** ${reason}`)
                .setColor(redColor)
                .setTimestamp();

                try {
                    await member.send({ embeds: [warnembed] });
                } catch (error) {
                    console.error(`Failed to send a message to ${userToKick}: ${error.message}`);
                }

                await member.kick(reason);
                
                const successEmbed = new EmbedBuilder()
                    .setAuthor({ name: `Success!`, iconURL: checkIconUrl })
                    .setDescription(`Successfully kicked <@${member.id}> from the server.`)
                    .setFields({ name: 'Reason', value: reason })
                    .setColor(greenColor);
                
                ctx.reply({ embeds: [successEmbed] });

                const logEmbed = new EmbedBuilder()
                .setAuthor({ name: `Karai Logs`, iconURL: infoIconUrl })
                .setColor(mainColor)
                .setDescription(`**Staff Member:** ${ctx.user}\n**Action:** Kick\n**Kicked User:** ${member.user}\n**Reason:** ${reason}`)
                
                channelSend.send({ embeds: [logEmbed] });
            } catch (error) {
                console.error(error);
                const errorEmbed = new EmbedBuilder()
                .setAuthor({ name: `Error!`, iconURL: xmarkIconUrl })
                .setColor(redColor)
                .setDescription(`An error occurred while trying to kick the user. Please try again later.`)
                ctx.reply({ embeds: [errorEmbed] });
            }
        } else {
            const noPermsEmbed = new EmbedBuilder()
            .setAuthor({ name: `Error!`, iconURL: xmarkIconUrl })
            .setColor(redColor)
            .setDescription(`I do not have the necessary permissions to kick this user.`)     
            ctx.reply({ embeds: [noPermsEmbed] });
        }
    }
}

export default KickCommand;