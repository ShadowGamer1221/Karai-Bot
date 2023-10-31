import axios from 'axios';
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
    xmarkIconUrl,
} from '../../handlers/locale';
import child from 'child_process';

class ClearCacheCommand extends Command {
    constructor() {
        super({
            trigger: 'clearcache',
            description: 'Deletes the cached slash commands for the current guild.',
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
        const clientId = "1163527688770834453";
        const guildId = "900771217345216532";

        const command = "npm run resetSlashCmds"

        child.exec(command, (err, res) => {
            if (err) {
                const errerEmbed = new EmbedBuilder()
                .setAuthor({ name: `Slash commands`, iconURL: xmarkIconUrl })
                .setColor(redColor)
                .setDescription(`Slash commands have not been cleared.`)

                ctx.reply({ embeds: [errerEmbed] });
                return
            };

            const embed = new EmbedBuilder()
            .setAuthor({ name: `Slash commands`, iconURL: checkIconUrl })
            .setColor(greenColor)
            .setDescription(`Slash commands have been cleared.`)
            .setFooter({ text: `Slash commands cleared` });
        
            ctx.reply({ embeds: [embed] });
        });
    }
}

export default ClearCacheCommand;