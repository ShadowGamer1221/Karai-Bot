import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import { GuildMember } from 'discord.js';
import { config } from '../../config';
import { addWarning } from '../../database/models/warnings';
import { checkIconUrl, greenColor, redColor } from '../../handlers/locale';

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
        },
      ],
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
    try {
        const latestCaseNumber = Math.floor(Math.random() * 9999) + 1;

      await addWarning(guild.id, member, ctx.user.id, reason, latestCaseNumber);


      const successEmbed = new EmbedBuilder()
        .setAuthor({ name: `Success!`, iconURL: checkIconUrl }) // Replace 'checkIconUrl' with your actual value
        .setColor(greenColor)
        .setDescription(`Successfully warned <@${member}>!`)
        .setFooter({ text: `Case ID: ${latestCaseNumber}` })
        .setTimestamp();

      ctx.reply({ embeds: [successEmbed] });

      const warnEmbed = new EmbedBuilder()
        .setDescription(`**Server:** ${ctx.guild.name}\n**Actioned by:** <@${ctx.user.id}>\n**Action:** Warn\n**Reason:** ${reason}`)
        .setColor(redColor)
        .setFooter({ text: `Case ID: ${latestCaseNumber}` })
        .setTimestamp();

      try { await realMember.send({ embeds: [warnEmbed] }); } catch (error) { console.error(error); }
    } catch (error) {
      console.error('Error in warn command:', error);
      ctx.reply({
        embeds: [new EmbedBuilder()
          .setDescription('An error occurred while processing the warning.')
          .setColor(redColor)],
      });
    }
  }
}

export default WarnCommand;