import { EmbedBuilder } from 'discord.js';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { config } from '../../config';
import translate from 'google-translate-api';
import { infoIconUrl, mainColor, redColor, xmarkIconUrl } from '../../handlers/locale';

class TranslateCommand extends Command {
    constructor() {
        super({
            trigger: 'translate',
            description: 'Translate text from one language to another.',
            type: 'ChatInput',
            module: 'utility',
            args: [
                {
                    trigger: 'source-language',
                    description: 'The source language code (e.g., en for English)',
                    isLegacyFlag: false,
                    required: true,
                    type: 'String',
                },
                {
                    trigger: 'target-language',
                    description: 'The target language code (e.g., fr for French)',
                    isLegacyFlag: false,
                    required: true,
                    type: 'String',
                },
                {
                    trigger: 'text',
                    description: 'The text to translate',
                    isLegacyFlag: false,
                    required: true,
                    type: 'String',
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
        const sourceLanguage = ctx.args['source-language'];
        const targetLanguage = ctx.args['target-language'];
        const text = ctx.args['text'];

        try {
            const result = await translate(text, { from: sourceLanguage, to: targetLanguage });

            const embed = new EmbedBuilder()
                .setAuthor({ name: 'Translation', iconURL: infoIconUrl })
                .setColor(mainColor)
                .setDescription(`**Source Language:** ${result.from.language.iso}\n\n${result.text}`)
                .setTimestamp();

            ctx.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error(error);

            const errorEmbed = new EmbedBuilder()
                .setAuthor({ name: 'Translation Error', iconURL: xmarkIconUrl })
                .setColor(redColor)
                .setDescription('An error occurred while translating the text. Make sure to use the right format. E.g. /translate en fr Hello!')
                .setTimestamp();

            ctx.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
}

export default TranslateCommand;