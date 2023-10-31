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

class RulesCommand extends Command {
    constructor() {
        super({
            trigger: 'rules',
            description: 'sends the rules info',
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

        let channelSend: TextChannel;
        channelSend = await discordClient.channels.fetch('872399539229823007') as TextChannel;
        console.log(channelSend)

        let channelSend2: TextChannel;
        channelSend = await discordClient.channels.fetch('872399539229823007') as TextChannel;
        console.log(channelSend)

        const clanEmbed = new EmbedBuilder()
        .setAuthor({ name: `Basic Rules`, iconURL: infoIconUrl })
        .setColor(mainColor)
        .setDescription(`1. If you are under 13 and found out you will be banned, don't joke about your age.\n\n2. NSFW, pornography, gore, and explicit content is prohibited on this server this also applies to DMS.\n\n3. Do not be toxic, if you're mad about something take it to DMS. Nobody wants to hear your sob story.\n\n4. Do not spam, line or raid the server. Anyone who does so will be muted or banned. More than 6 lines of repeated text = spam
        \n\n5. Be respectful to staff. Their decision is final, but if there is anyone you believe to be abusing perms DM an Admin.\n\n6. Do not leak private info without permission. This include; Face, IP addresses, forms of social media.\n
        7. Any suspicious files or links are not allowed this includes DM's. Sending these types of things can possibly result in a ban\n\n8. No self-advertising, this includes DM's. Self advertises = ban.\n\n9. Slurs of any kind are prohibited. This also applies to the n-word even if you are black.\n
        10. Don't ping the owner, staff without a valid reason doing so may result in a mute and possibly a ban\n\n11. Telling someone to kill themselves is very naughty! It will result in a long mute.\n\n12. Use the channels for their designed purpose.\n
        13. Use your common sense, not all the rules are 100% listed here.\n\n14. Follow basic Discord TOS\n# Voice Chat Rules\n\n\n1. No earrape of any kind is allowed\n\n2. Don't moan or be annoying your not funny.\n\n3. Don't stream NSFW things. If you are doing a Movie Night put a disclaimer e.g. Watching Superman in Movie Night Rated: M.\n
        4. Use the VC's for the right purpose e.g. music VC with the music bot.\n# Strike System\n\n\n1 warn = Verbal warn\n2 warns = 2 hour mute\n3 warns = 4 hour mute\n4 warns = 7 hour mute\n5 warns = 12 hour mute\n6 warns = 24 hour mute\n7 warns = Kick + 7 day mute\n
        8 warns = Ban\n\nWe will look over your warns before any action is taken`)
        .setFooter({ text: `Note: Warns are reset every 3 months. This means if you had 5 warns from 3 months ago and got warned again you would only get a verbal warn.` })
        .setImage('https://i.imgur.com/5sIrKQL.png')
        .setTimestamp();

        const ClanTag = await channelSend.send({ embeds: [clanEmbed] })

  const successEmbed = new EmbedBuilder()

.setAuthor({ name: `Success!`, iconURL: checkIconUrl })
.setColor(greenColor)
.setDescription(`Successfully sent the rules info into ${channelSend}!`)
.setTimestamp();

ctx.reply({ embeds: [successEmbed] });

    }
}

export default RulesCommand;