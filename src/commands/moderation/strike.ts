import { discordClient } from '../../main';
import { EmbedBuilder } from 'discord.js';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { config } from '../../config';
import { GuildMember } from 'discord.js';
import { groupBy } from 'lodash';
import {
    checkIconUrl,
    getCommandInfoEmbed,
    getCommandListEmbed,
    getCommandNotFoundEmbed,
    greenColor,
    redColor,
} from '../../handlers/locale';

class StrikeCommand extends Command {
    constructor() {
        super({
            trigger: 'strike',
            description: 'Strikes a member',
            type: 'ChatInput',
            module: 'moderation',
            args: [
              {
                    trigger: 'member',
                    description: 'Who do you want to strike?',
                    isLegacyFlag: false,
                    required: true,
                    type: 'DiscordUser',
                },
                {
                    trigger: 'reason',
                    description: 'Reason for striking this member.',
                    isLegacyFlag: false,
                    required: true,
                    type: 'String',
                },
            ],
            permissions: [
                {
                    type: 'role',
                    ids: config.permissions.admin,
                    value: true,
                }
            ]
        });
    }

    async run(ctx: CommandContext) {



const nothingEmbed = new EmbedBuilder()

.setDescription('You did not provide anyone to strike!')
.setColor(redColor);

const embed = new EmbedBuilder()

.setDescription('You cannot strike this person as they are not in the server!')
.setColor(redColor);

  let member = ctx.args['member']
      member = member.replace("<","");
      member = member.replace("@","");
      member = member.replace("!","");
      member = member.replace(">","");
  console.log(member)
        if(!member) return ctx.reply({ embeds: [nothingEmbed] })
        if(!member) return ctx.reply({ embeds: [embed] })

        const guild = ctx.guild

        const realMember = await guild.members.fetch(member)

const errorEmbed = new EmbedBuilder()

.setDescription('Please enter a reason!')
.setColor(redColor);

  let reason = ctx.args['reason']
  console.log(reason)
  if(!reason) return ctx.reply({ embeds: [errorEmbed] })

  const successEmbed = new EmbedBuilder()

.setAuthor({ name: `Success!`, iconURL: checkIconUrl })
.setColor(greenColor)
.setDescription(`Successfully striked <@${member}>!`)
.setTimestamp();

ctx.reply({ embeds: [successEmbed] });
  
  let warnembed = new EmbedBuilder()
  .setDescription(`**Server:** ${ctx.guild.name}\n**Actioned by:** <@${ctx.user.id}>\n**Action:** Strike\n**Additional Information:** Hello <@${member}>, I'm here to inform you that you just got a strike from our Staffing Team. If you think this is a misstake please contact the support team. Remind: After 3 strikes you can get muted for 4 hours.\n**Reason:** ${reason}`)
  .setColor(redColor)
  .setTimestamp();
  
 await realMember.send({ embeds: [warnembed] });
    }
}

export default StrikeCommand;