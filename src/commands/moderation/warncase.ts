import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import { config } from '../../config';
import WarnCaseModel from '../../database/models/warnCase';
import { WarningsModel } from '../../database/models/warnings';
import { infoIconUrl, mainColor, redColor, xmarkIconUrl } from '../../handlers/locale';

class WarnCaseCommand extends Command {
    constructor() {
        super({
            trigger: 'warncase',
            description: 'View information about a specific warning case',
            type: 'ChatInput',
            module: 'moderation',
            args: [
                {
                    trigger: 'case',
                    description: 'The case number to view',
                    isLegacyFlag: false,
                    required: true,
                    type: 'Number',
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
        let caseNumber = ctx.args['case'];

        // Find the specified warning case
        try {
            const data = await WarningsModel.findOne({ Guild: ctx.guild.id, 'Warnings.Case': caseNumber }).exec();

            if (data) {
                const fields = data.Warnings.map((warning: any) => (`**Case ID:** **${warning.Case}**\n**Reason:** ${warning.Reason}\n**Moderator:** <@!${warning.Moderator}>\n**Warned User:** <@${data.User}>\n**Warn Date:** ${warning.Date}`));

                ctx.reply({
                    embeds: [new EmbedBuilder()
                        .setAuthor({ name: `Case Info ${caseNumber}`, iconURL: infoIconUrl })
                        .setDescription(fields[0])
                        .setColor(mainColor)]
                });
            } else {
                ctx.reply({
                    embeds: [new EmbedBuilder()
                        .setAuthor({ name: `Warnings for `, iconURL: infoIconUrl })
                        .setDescription(`User has no warnings!`)]
                });
            }
        } catch (err) {
            console.error(err);
            ctx.reply({
                embeds: [new EmbedBuilder()
                    .setAuthor({ name: `Warnings for `, iconURL: infoIconUrl })
                    .setDescription('An error occurred while fetching warnings.')
                    .setColor(redColor)]
            });
        }
    }
}

export default WarnCaseCommand;