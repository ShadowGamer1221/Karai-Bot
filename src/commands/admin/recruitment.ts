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

class RecruitementCommand extends Command {
    constructor() {
        super({
            trigger: 'recruitment',
            description: 'Sends the recruitment information embed into #recruitment',
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
        channelSend = await discordClient.channels.fetch('1168846006264270858') as TextChannel;
        console.log(channelSend)

        let channelSend2: TextChannel;
        channelSend = await discordClient.channels.fetch('1168846006264270858') as TextChannel;
        console.log(channelSend)

        const clanEmbed = new EmbedBuilder()
        .setAuthor({ name: `Karai Crew`, iconURL: infoIconUrl })
        .setColor(mainColor)
        .setDescription(`To become a member of the Karai Crew, please initiate the process by using </apply:1175029776088584212> in <#1168844980962480140>. You will be required to answer a set of questions within the application system. A recruiter will be with you shortly to assist you further. Rest assured, we will process your request as quickly as possible. ❤️`);

        const requirementsEmbed = new EmbedBuilder()
        .setAuthor({ name:`Requirements`, iconURL: infoIconUrl })
        .setColor(mainColor)
        .setDescription(`- **💰 Minimum Bounty:** Your character should have a minimum of 500,000 Bounty, proving your commitment and resourcefulness in the game.\n\n- **📈 Max Level (3150):** We require all members to have reached the impressive level of 3150, demonstrating their in-game expertise.\n\n- **💪 Active Participation:** We thrive on active engagement, so stay involved, share your experiences, and enjoy the camaraderie with fellow members.`)
        .setFooter({ text: `Join us and be a part of this exciting journey! 🎮🕐💬` })
        .setTimestamp();

        const ClanTag = await channelSend.send({ embeds: [clanEmbed, requirementsEmbed] })

  const successEmbed = new EmbedBuilder()

.setAuthor({ name: `Success!`, iconURL: checkIconUrl })
.setColor(greenColor)
.setDescription(`Successfully sent the crew recruitment info into ${channelSend}!`)
.setTimestamp();

ctx.reply({ embeds: [successEmbed] });
    }
}

export default RecruitementCommand;