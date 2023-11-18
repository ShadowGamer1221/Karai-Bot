import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import { GuildMember } from 'discord.js';
import { config } from '../../config';
import WarnCaseModel from '../../database/models/warnCase';
import { WarningsModel } from '../../database/models/warnings';
import { checkIconUrl, infoIconUrl, mainColor, redColor } from '../../handlers/locale';

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

        // Find warnings for the specified user
        try {
            const data = await WarningsModel.findOne({ Guild: ctx.guild.id, User: user }).exec();

            if (data) {
                const fields = data.Warnings.map((warning: any) => ({
                    name: `Warning **${warning.Case}**`,
                    value: `Reason: ${warning.Reason}\nModerator <@!${warning.Moderator}>`,
                    inline: true
                }));

                ctx.reply({
                    embeds: [new EmbedBuilder()
                        .setAuthor({ name: `Warnings for ${user.tag}`, iconURL: infoIconUrl })
                        .setDescription(`The warnings of **${user.tag}**`)
                        .addFields({ name: 'Total', value: `${data.Warnings.length}` })
                        .addFields(...fields)
                        .setColor(mainColor)]
                });
            } else {
                ctx.reply({
                    embeds: [new EmbedBuilder()
                        .setAuthor({ name: `Warnings for ${user.tag}`, iconURL: infoIconUrl })
                        .setDescription(`User ${user.tag} has no warnings!`)]
                });
            }
        } catch (err) {
            console.error(err);
            ctx.reply({
                embeds: [new EmbedBuilder()
                    .setAuthor({ name: `Warnings for ${user.tag}`, iconURL: infoIconUrl })
                    .setDescription('An error occurred while fetching warnings.')
                    .setColor(redColor)]
            });
        }
    }
}

export default WarningsCommand;