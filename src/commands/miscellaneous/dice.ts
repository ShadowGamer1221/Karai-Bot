import { discordClient } from '../../main';
import { EmbedBuilder, TextChannel } from 'discord.js';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { config } from '../../config';
import { infoIconUrl, mainColor } from '../../handlers/locale';

class DiceRollCommand extends Command {
    constructor() {
        super({
            trigger: 'roll',
            description: 'Roll a dice with a specified number of sides and get a random number.',
            type: 'ChatInput',
            module: 'miscellaneous',
            args: [
                {
                    trigger: 'sides',
                    description: 'The number of sides on the dice (e.g., 6 for a standard six-sided die).',
                    type: 'Number',
                    required: true, // Optional argument
                },
            ],
            permissions: [
                {
                    type: 'role',
                    ids: config.permissions.verified,
                    value: true,
                }
            ]
        });
    }

    async run(ctx: CommandContext) {
        const sides = ctx.args['sides'];

        if (sides < 2) {
            ctx.reply({ content: 'The number of sides on a die should be at least 2.' });
            return;
        }

        // Generate a random number between 1 and the specified number of sides
        const randomResult = Math.floor(Math.random() * sides) + 1;

        // Create an embed to display the result
        const rollEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Dice Roll Result', iconURL: infoIconUrl })
            .setColor(mainColor)
            .setDescription(`You rolled a ${randomResult} on a ${sides}-sided die! 🎲`)
            .setTimestamp();

        // Send the embed with the dice roll result
        ctx.reply({ embeds: [rollEmbed] });
    }
}

export default DiceRollCommand;