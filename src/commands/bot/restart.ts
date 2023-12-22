import { discordClient } from '../../main';
import { EmbedBuilder } from 'discord.js';
import { TextChannel } from 'discord.js';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { config } from '../../config';
import { GuildMember } from 'discord.js';
import { groupBy } from 'lodash';
import {
    getCommandInfoEmbed,
    getCommandListEmbed,
    getCommandNotFoundEmbed,
    greenColor,
} from '../../handlers/locale';

class RestartCommand extends Command {
    constructor() {
        super({
            trigger: 'restart',
            description: 'Restarts the bot server.',
            type: 'ChatInput',
            module: 'bot',
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

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Restarting...`, iconURL: discordClient.user?.avatarURL() })
            .setColor(greenColor)
            .setTimestamp();

        await ctx.reply({ embeds: [embed] });

        if (!ctx.replied) {
            await ctx.reply({ embeds: [embed] });
            console.log('Restarting bot...');
        }
        process.exit();
    }
}

export default RestartCommand;