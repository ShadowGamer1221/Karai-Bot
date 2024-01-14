import { discordClient, robloxClient, robloxGroup } from '../../main';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { config } from '../../config';
import { getLinkedRobloxUser } from '../../handlers/accountLinks';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, Interaction, ModalActionRowComponentBuilder, ChatInputCommandInteraction, TextChannel, CommandInteraction } from 'discord.js';
import { greenColor, infoIconUrl, mainColor, redColor, xmarkIconUrl } from '../../handlers/locale';
import noblox from 'noblox.js';

class NewVerifyCommand extends Command {
    constructor() {
        super({
            trigger: 'test',
            description: 'Verify your Roblox account by adding specific emojis to your Roblox description.',
            type: 'ChatInput',
            module: 'verification',
            args: [],
        });
    }

    async run(ctx: CommandContext) {

        const textInput = new TextInputBuilder()
        .setCustomId('test')
        .setLabel('Your Label Here')
        .setStyle(TextInputStyle.Short);

    const modal = new ModalBuilder()
        .setCustomId('test2')
        .setTitle('My Modal Title');

    const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);
    modal.addComponents(actionRow);

    const interaction = ctx.subject as CommandInteraction;
    interaction.showModal(modal);

    }
}
export default NewVerifyCommand;