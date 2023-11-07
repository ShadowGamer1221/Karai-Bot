import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { PermissionResolvable, ChannelType, TextChannel } from 'discord.js';
import { EmbedBuilder, ButtonStyle, ButtonBuilder, ActionRowBuilder } from 'discord.js';
import { redColor, mainColor, infoIconUrl, xmarkIconUrl } from '../../handlers/locale';
import { config } from '../../config';

class EscalateCommand extends Command {
    constructor() {
        super({
            trigger: 'escalate',
            description: 'Escalate the ticket to a higher role.',
            type: 'ChatInput',
            module: 'support',
            args: [
                {
                    trigger: 'role',
                    description: 'The role to escalate the ticket to.',
                    required: true,
                    type: 'String',
                    choices: [
                        {
                            name: 'Head Moderator',
                            value: '872620422552748123',
                        },
                        {
                            name: 'Administrator',
                            value: '872620489334456350',
                        },
                        {
                            name: 'Bot Developer',
                            value: '1168632726052679690',
                        },
                    ]
                },
            ],
            permissions: [
                {
                    type: 'role',
                    ids: config.permissions.ticketsupport,
                    value: true,
                },
            ],
        });
    }

    async run(ctx: CommandContext) {
        const { guild, user } = ctx;
        const supportChannelIdentifier = ctx.channel.id;

        let channelSend: TextChannel;
        channelSend = await guild.channels.fetch(supportChannelIdentifier) as TextChannel;

        const supportChannel = guild.channels.cache.find((channel) => {
            return (
                channel.type === ChannelType.GuildText &&
                (channel.name === supportChannelIdentifier || channel.id === supportChannelIdentifier)
            );
        });

        if (supportChannel) {
            if (supportChannel.name.startsWith('support-')) {
                const closeEmbed = new EmbedBuilder()
                .setAuthor({ name: 'Ticket Escalated', iconURL: infoIconUrl })
                .setDescription(`Successfully escalated the ticket ${supportChannel} to <@&${ctx.args['role']}>`)
                .setColor(mainColor);

            ctx.reply({ embeds: [closeEmbed] });
            channelSend.send({ 
                content: `<@&${ctx.args['role']}>`,
                allowedMentions: {
                    roles: [ctx.args['role']], // Change to an array of strings
                },
            });
            } else {
                const notSupportTicketEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Not a Support Ticket', iconURL: xmarkIconUrl })
                    .setDescription(`The channel with the name "<#${supportChannelIdentifier}>" is not a support ticket channel.`)
                    .setColor(redColor);

                ctx.reply({ embeds: [notSupportTicketEmbed] });
            }
        } else {
            const notFoundEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Support Channel Not Found', iconURL: xmarkIconUrl })
                .setDescription(`The support channel with the name or ID "${supportChannelIdentifier}" was not found.`)
                .setColor(redColor);

            ctx.reply({ embeds: [notFoundEmbed] });
        }
    }

}

export default EscalateCommand;