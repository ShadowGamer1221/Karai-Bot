import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import { config } from '../../config';
import WarnCaseModel from '../../database/models/warnCase';
import { WarningsModel } from '../../database/models/warnings';
import { infoIconUrl, mainColor, redColor } from '../../handlers/locale';

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
        const caseNumber = ctx.args['case'];

        // Find the specified warning case
        try {
            const caseData = await WarnCaseModel.findOne({ Guild: ctx.guild.id, Case: caseNumber }).exec();

            if (caseData) {
                // Find associated warnings
                const warnings = await WarningsModel.find({ Guild: ctx.guild.id, 'Warnings.Case': caseNumber }).exec();

                const fields = warnings.map((warning: any) => ({
                    name: `Warning **${warning.Warnings.find((w: any) => w.Case === caseNumber).Case}**`,
                    value: `User: <@!${warning.User}>\nReason: ${warning.Warnings.find((w: any) => w.Case === caseNumber).Reason}\nModerator: <@!${warning.Warnings.find((w: any) => w.Case === caseNumber).Moderator}>`,
                    inline: false
                }));

                ctx.reply({
                    embeds: [new EmbedBuilder()
                        .setAuthor({ name: `Warn Case ${caseNumber}`, iconURL: infoIconUrl })
                        .setDescription(`Information about warning case ${caseNumber}`)
                        .addFields(...fields)
                        .setColor(mainColor)]
                });
            } else {
                ctx.reply({
                    embeds: [new EmbedBuilder()
                        .setAuthor({ name: `Warn Case ${caseNumber}`, iconURL: infoIconUrl })
                        .setDescription(`No information found for warning case ${caseNumber}`)
                        .setColor(redColor)]
                });
            }
        } catch (err) {
            console.error(err);
            ctx.reply({
                embeds: [new EmbedBuilder()
                    .setAuthor({ name: `Warn Case ${caseNumber}`, iconURL: infoIconUrl })
                    .setDescription('An error occurred while fetching information for warning case.')
                    .setColor(redColor)]
            });
        }
    }
}

export default WarnCaseCommand;