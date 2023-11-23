import { config } from '../../config';
import { checkIconUrl, greenColor, infoIconUrl, mainColor, redColor, xmarkIconUrl } from '../../handlers/locale';
import { discordClient } from '../../main';
import { Command } from '../../structures/Command';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { EmbedBuilder, TextChannel } from 'discord.js';

class SearchCommand extends Command {
    constructor() {
        super({
            trigger: 'search',
            description: 'Search something on google.',
            type: 'ChatInput',
            module: 'search',
            args: [
                {
                    trigger: 'search',
                    description: 'What do you want to search on google?',
                    type: 'String',
                    required: true,
                },
            ],
            permissions: [
                {
                    type: 'role',
                    ids: config.permissions.verified,
                    value: true,
                },
            ],
        });
    }

    async run(ctx: CommandContext) {

        const name = encodeURIComponent(ctx.args['search']);
        const link = `https://www.google.com/search?q=${name}`;

        const embed = new EmbedBuilder()
        .setAuthor({ name: `Google Search`, iconURL: infoIconUrl })
        .setColor(mainColor)
        .setDescription(`[Click here to see the link](${link})`)
        
        ctx.reply({ embeds: [embed], ephemeral: true });
    }
}

export default SearchCommand;