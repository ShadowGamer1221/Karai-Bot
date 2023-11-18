import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import { config } from '../../config';
import { WarningsModel } from '../../database/models/warnings';
import { infoIconUrl, mainColor, redColor, xmarkIconUrl } from '../../handlers/locale';

class WarningsCommand extends Command {
    constructor() {
        super({
            trigger: 'warnings',
            description: 'View warnings of a member',
            type: 'ChatInput',
            module: 'moderation',
            args: [
                {
                    trigger: 'user',
                    description: 'User to view warnings for',
                    isLegacyFlag: false,
                    required: true,
                    type: 'DiscordUser',
                },
            ],
            permissions: [
                {
                    type: 'role',
                    ids: config.permissions.moderators,
                    value: true,
                }
            ]
        });
    }

    async run(ctx: CommandContext) {
        const user = ctx.args['user'];
        const member = ctx.guild.members.cache.get(user);

        // Find all documents for the specified user
        try {
            const userData = await WarningsModel.find({ Guild: ctx.guild.id, User: user }).exec();

            if (userData.length > 0) {
                const warnings = userData.flatMap((data) => data.Warnings);
                
                if (warnings.length > 0) {
                    const fields = warnings.map((warning: any) => ({
                        name: `**Warning ID:** **${warning.Case}**`,
                        value: `**Reason:** ${warning.Reason}\n**Moderator:** <@!${warning.Moderator}>`,
                        inline: true
                    }));

                    ctx.reply({
                        embeds: [new EmbedBuilder()
                            .setAuthor({ name: `Warnings for ${member.nickname}`, iconURL: infoIconUrl })
                            .addFields({ name: 'Total Warnings', value: `${warnings.length}` })
                            .addFields(...fields)
                            .setColor(mainColor)]
                    });
                } else {
                    ctx.reply({
                        embeds: [new EmbedBuilder()
                            .setAuthor({ name: `User has no warnings`, iconURL: xmarkIconUrl })
                            .setDescription(`User ${member.nickname} has no warnings!`)
                            .setColor(redColor)]
                    });
                }
            } else {
                ctx.reply({
                    embeds: [new EmbedBuilder()
                        .setAuthor({ name: `User has no warnings`, iconURL: xmarkIconUrl })
                        .setDescription(`User ${member.nickname} has no warnings!`)
                        .setColor(redColor)]
                });
            }
        } catch (err) {
            console.error(err);
            ctx.reply({
                embeds: [new EmbedBuilder()
                    .setAuthor({ name: `Error`, iconURL: xmarkIconUrl })
                    .setDescription('An error occurred while fetching warnings.')
                    .setColor(redColor)]
            });
        }
    }
}

export default WarningsCommand;