import { discordClient } from '../../main';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { groupBy } from 'lodash';
import { getCommandInfoEmbed, getCommandNotFoundEmbed, getCommandListEmbed, infoIconUrl, mainColor } from '../../handlers/locale';
import { EmbedBuilder, SelectMenuBuilder } from 'discord.js';

class HelpCommand extends Command {
    constructor() {
        super({
            trigger: 'help',
            description: 'Gets a list of commands to try.',
            type: 'ChatInput',
            module: 'information',
            args: [
                {
                    trigger: 'command-name',
                    description: 'What command would you like to learn more about, if any?',
                    required: false,
                    type: 'String',
                },
            ],
        });
    }

    async run(ctx: CommandContext) {
        const commands = discordClient.commands.map((cmd) => new (cmd)());

        if (ctx.args['command-name']) {
            const command = commands.find((cmd) => cmd.trigger.toLowerCase() === ctx.args['command-name'].toLowerCase() || cmd.aliases.map((alias) => alias.toLowerCase()).includes(ctx.args['command-name'].toLowerCase()));
            if (!command) return ctx.reply({ embeds: [getCommandNotFoundEmbed()] });
            return ctx.reply({ embeds: [getCommandInfoEmbed(command)] });
        } else {
            const categories = groupBy(commands, (cmd) => cmd.module);

            const selectMenu = new SelectMenuBuilder()
                .setCustomId('select')
                .setPlaceholder('Select a category')
                .addOptions(
                    Object.keys(categories).map((category) => ({
                        label: `${getEmojiForCategory(category)} ${category}`,
                        value: category,
                    }))
                );

            const selectMenuDisabled = new SelectMenuBuilder()
                .setCustomId('select')
                .setPlaceholder('Select a category')
                .addOptions(
                    Object.keys(categories).map((category) => ({
                        label: `${getEmojiForCategory(category)} ${category}`,
                        value: category,
                    }))
                )
                .setDisabled(true);

            const message = await ctx.reply({ embeds: [getCommandListEmbed()], components: [{ type: 1, components: [selectMenu] }] });

            const filter = (interaction) => interaction.customId === 'select' && interaction.isSelectMenu();
            const collector = message.createMessageComponentCollector({ filter, time: 60000 }); // 60 seconds timeout

            collector.on('collect', async (interaction) => {
                if (interaction.isSelectMenu()) {
                    const selectedCategory = interaction.values[0];
                    const selectedCommands = categories[selectedCategory];
                    const updatedEmbed = getCommandListEmbed({ [selectedCategory]: selectedCommands });

                    await interaction.update({ embeds: [updatedEmbed] });
                }
            });

            collector.on('end', async (collected, reason) => {
                if (reason === 'time') {
                    const timeoutEmbed = new EmbedBuilder()
                        .setAuthor({ name: 'Time is up!', iconURL: infoIconUrl })
                        .setColor(mainColor)
                        .setDescription('Your time is up! Please run the command again to continue.');
                    await message.edit({ embeds: [timeoutEmbed], components: [{ type: 1, components: [selectMenuDisabled] }] });
                }
            });
        }
    }
}

function getEmojiForCategory(category: string): string {
    const emojiMap = {
        information: '📘 | ',
        admin: '🗡️ | ',
        application: '📝 | ',
        bot: '🤖 | ',
        miscellaneous: '🔧 | ',
        moderation: '🛡️ | ',
        search: '🔍 | ',
        support: '📞 | ',
        trading: '💰 | ',
        music: '🎵 | ',
        verification: '🔒 | ',
        fun: '🎉 | ',

        // Add more categories and emojis as needed
    };

    return emojiMap[category] || '';
}

export default HelpCommand;