import { discordClient, robloxClient, robloxGroup } from '../../main';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { config } from '../../config';
import { getLinkedRobloxUser } from '../../handlers/accountLinks';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, Interaction, ModalActionRowComponentBuilder, ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { greenColor, infoIconUrl, mainColor, redColor, xmarkIconUrl } from '../../handlers/locale';
import { Modal } from 'discord-modals';
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
        .setCustomId('textInputCustomId')
        .setLabel('Your Label Here')
        .setStyle(TextInputStyle.Short);  // Or TextInputStyle.Paragraph

    // Create a modal
    const modal = new ModalBuilder()
        .setCustomId('myModalCustomId')
        .setTitle('My Modal Title');

    // Add the text input to the modal inside an ActionRow
    const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);
    modal.addComponents(actionRow);

    // Show the modal using the context
    await ctx.showModal(modal);

    }
}
export default NewVerifyCommand;