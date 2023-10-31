import { discordClient } from '../../main';
import { EmbedBuilder, TextChannel } from 'discord.js';
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
    mainColor,
    greenColor,
    redColor,
    infoIconUrl,
} from '../../handlers/locale';

class SupportInfoCommand extends Command {
    constructor() {
        super({
            trigger: 'supportinfo',
            description: 'Sends the support information embed into #support-info',
            type: 'ChatInput',
            module: 'admin',
            args: [],
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


        const guild = ctx.guild
        let channelSend: TextChannel;
        channelSend = await discordClient.channels.fetch('1168847436278673479') as TextChannel;
        console.log(channelSend)

        let channelSend2: TextChannel;
        channelSend = await discordClient.channels.fetch('1168847436278673479') as TextChannel;
        console.log(channelSend)

        const requirementsEmbed = new EmbedBuilder()
        .setAuthor({ name:`Support Information`, iconURL: infoIconUrl })
        .setColor(mainColor)
        .setDescription(`🌟 **Need Assistance? We've Got You Covered!**\n\nIf you have questions, need help, or just want to chat, our support team is here to assist you every step of the way. Reach out to us using the \`/support\` command, and we'll respond promptly to ensure your experience is seamless and enjoyable.\n\n📌 **How to Use </support:1168608807363022897>:**\n\n- Simply type </support:1168608807363022897> followed by your question or issue in <#1168847322407501826>\n- Our dedicated support team is available 24/7 to provide you with the best assistance.`)
        .setFooter({ text: `✨ Your satisfaction is our top priority, and we're committed to delivering top-notch support and service.` })
        .setTimestamp();

        const ClanTag = await channelSend.send({ embeds: [requirementsEmbed] })

  const successEmbed = new EmbedBuilder()

.setAuthor({ name: `Success!`, iconURL: checkIconUrl })
.setColor(greenColor)
.setDescription(`Successfully sent the support info into ${channelSend}!`)
.setTimestamp();

ctx.reply({ embeds: [successEmbed] });
    }
}

export default SupportInfoCommand;