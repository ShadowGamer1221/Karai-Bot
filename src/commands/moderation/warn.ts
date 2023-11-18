import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import { GuildMember } from 'discord.js';
import { config } from '../../config';
import WarnCaseModel from '../../database/models/warnCase';
import { WarningsModel } from '../../database/models/warnings';
import { checkIconUrl, redColor } from '../../handlers/locale';

class WarnCommand extends Command {
    constructor() {
        super({
            trigger: 'warn',
            description: 'Warns a member',
            type: 'ChatInput',
            module: 'moderation',
            args: [
              {
                    trigger: 'member',
                    description: 'Who do you want to warn?',
                    isLegacyFlag: false,
                    required: true,
                    type: 'DiscordUser',
                },
                {
                    trigger: 'reason',
                    description: 'Reason for warning this member.',
                    isLegacyFlag: false,
                    required: true,
                    type: 'String',
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
        const nothingEmbed = new EmbedBuilder()
            .setDescription('You did not provide anyone to warn!')
            .setColor(redColor);

        const embed = new EmbedBuilder()
            .setDescription('You cannot warn this person as they are not in the server!')
            .setColor(redColor);

        let member = ctx.args['member'];
        member = member.replace("<", "");
        member = member.replace("@", "");
        member = member.replace("!", "");
        member = member.replace(">", "");

        if (!member) return ctx.reply({ embeds: [nothingEmbed] });

        const guild = ctx.guild;

        const realMember = await guild.members.fetch(member);

        const errorEmbed = new EmbedBuilder()
            .setDescription('Please enter a reason!')
            .setColor(redColor);

        let reason = ctx.args['reason'];

        if (!reason) return ctx.reply({ embeds: [errorEmbed] });

        // Update database with warning
        const caseNumber = await this.updateCaseNumber(ctx.guild.id);
        await this.updateWarnings(ctx.guild.id, member, {
            Moderator: ctx.user.id,
            Reason: reason,
            Date: Date.now(),
            Case: caseNumber,
        });

        
        const successEmbed = new EmbedBuilder()
            .setAuthor({ name: `Success!`, iconURL: checkIconUrl }) // Replace 'checkIconUrl' with your actual value
            .setColor(redColor)
            .setDescription(`Successfully warned <@${member}>!`)
            .setFooter({ text: `Case ID: ${caseNumber}` })
            .setTimestamp();

        ctx.reply({ embeds: [successEmbed] });

        const warnEmbed = new EmbedBuilder()
            .setDescription(`**Server:** ${ctx.guild.name}\n**Actioned by:** <@${ctx.user.id}>\n**Action:** Warn\n**Reason:** ${reason}`)
            .setColor(redColor)
            .setFooter({ text: `Case ID: ${caseNumber}` })
            .setTimestamp();

        try {
            await realMember.send({ embeds: [warnEmbed] });
    } catch (err) {
        console.log(err);
    }
    }

    

    private async updateCaseNumber(guildId: string): Promise<number> {
        let caseNumber: number;
        const caseData = await WarnCaseModel.findOne({ Guild: guildId });

        if (!caseData) {
            const newCaseData = new WarnCaseModel({ Guild: guildId, Case: 1 });
            await newCaseData.save();
            caseNumber = 1;
        } else {
            caseData.Case += 1;
            await caseData.save();
            caseNumber = caseData.Case;
        }

        return caseNumber;
    }

    private async updateWarnings(guildId: string, userId: string, warning: any): Promise<void> {
        const existingData = await WarningsModel.findOne({ Guild: guildId, User: userId });

        if (existingData) {
            existingData.Warnings.push(warning);
            await existingData.save();
        } else {
            const newData = new WarningsModel({ Guild: guildId, User: userId, Warnings: [warning] });
            await newData.save();
        }
    }
    
}

export default WarnCommand;