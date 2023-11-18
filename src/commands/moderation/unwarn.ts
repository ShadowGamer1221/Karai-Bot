import { config } from '../../config';
import { checkIconUrl, greenColor, infoIconUrl, mainColor, redColor, xmarkIconUrl } from '../../handlers/locale';
import { discordClient } from '../../main';
import { Command } from '../../structures/Command';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { EmbedBuilder, TextChannel } from 'discord.js';
import { removeWarning } from '../../database/models/warnings'; // Add the corresponding function

class UnwarnCommand extends Command {
  constructor() {
    super({
      trigger: 'unwarn',
      description: 'Removes a warning from a member',
      type: 'ChatInput',
      module: 'moderation',
      args: [
        {
          trigger: 'case',
          description: 'The case number to remove',
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
        },
      ],
    });
  }

  async run(ctx: CommandContext) {
    const nothingEmbed = new EmbedBuilder()
      .setDescription('Please provide a case number to remove!')
      .setColor(redColor);

    let caseNumber = ctx.args['case'];

    if (!caseNumber || isNaN(caseNumber)) return ctx.reply({ embeds: [nothingEmbed] });

    const guild = ctx.guild;

    try {
      await removeWarning(guild.id, caseNumber);

      const successEmbed = new EmbedBuilder()
        .setAuthor({ name: `Success!`, iconURL: checkIconUrl }) // Replace 'checkIconUrl' with your actual value
        .setColor(greenColor)
        .setDescription(`Successfully removed warning with case ID ${caseNumber}!`)
        .setTimestamp();

      ctx.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error('Error in unwarn command:', error);
      ctx.reply({
        embeds: [new EmbedBuilder()
          .setDescription('An error occurred while processing the unwarning.')
          .setColor(redColor)],
      });
    }
  }
}

export default UnwarnCommand;