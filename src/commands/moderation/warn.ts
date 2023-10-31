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


const nothing = ctx.member as GuildMember

const nothingEmbed = new EmbedBuilder()

.setDescription('You did not provide anyone to warn!')
.setColor(redColor);

const embed = new EmbedBuilder()

.setDescription('You cannot warn this person as they are not in the server!')
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

.setAuthor({ name: `Success!`, iconURL: checkIconUrl})
.setColor(greenColor)
.setDescription(`Successfully warned <@${member}>!`)
.setTimestamp();

ctx.reply({ embeds: [successEmbed] });
  
  let warnembed = new EmbedBuilder()
  .setDescription(`**Server:** ${ctx.guild.name}\n**Actioned by:** <@${ctx.user.id}>\n**Action:** Warn\n**Reason:** ${reason}`)
  .setColor(redColor)
  .setTimestamp();
  
 await realMember.send({ embeds: [warnembed] });
    }
}

export default WarnCommand;