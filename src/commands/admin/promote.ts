import { config } from '../../config';
import { checkIconUrl, greenColor, infoIconUrl, mainColor, redColor, xmarkIconUrl } from '../../handlers/locale';
import { discordClient } from '../../main';
import { Command } from '../../structures/Command';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, TextChannel } from 'discord.js';

class PromoteCommand extends Command {
    constructor() {
        super({
            trigger: 'promote',
            description: 'Promotes a user to a specified role.',
            type: 'ChatInput',
            module: 'admin',
            args: [
                {
                    trigger: 'user',
                    description: 'The user to promote.',
                    type: 'DiscordUser',
                    required: true,
                },
                {
                    trigger: 'role',
                    description: 'Select the role for promotion.',
                    type: 'String',
                    required: true,
                    choices: [
                        {
                            name: 'Ingame Member',
                            value: 'Ingame Member',
                        },
                        {
                            name: 'Warlord',
                            value: 'Warlord',
                        },
                        {
                            name: 'Bounty Hunter',
                            value: 'Bounty Hunter',
                        },
                        {
                            name: 'Emperor',
                            value: 'Emperor',
                        },
                    ],
                },
                {
                    trigger: 'reason',
                    description: 'Select a reason for promotion.',
                    type: 'String',
                    required: true,
                    choices: [
                        {
                            name: 'Reached 750k bounty',
                            value: 'Reached 750k bounty',
                        },
                        {
                            name: 'Reached 1,5m bounty',
                            value: 'Reached 1,5m bounty',
                        },
                        {
                            name: 'Reached 2m bounty',
                            value: 'Reached 2m bounty',
                        },
                    ],
                },
            ],
            permissions: [
                {
                    type: 'role',
                    ids: config.permissions.ranking,
                    value: true,
                }
            ]
        });
    }

    async run(ctx: CommandContext) {
        const userToPromote = ctx.args['user'];
        const selectedRole = ctx.args['role'];
        const reason = ctx.args['reason'];

        let channelSend: TextChannel;
        channelSend = await discordClient.channels.fetch('1168628274759471155') as TextChannel;

        const guild = ctx.guild;
        const member = guild.members.cache.get(userToPromote);

        if (!member) {
            return ctx.reply({ content: 'The mentioned user is not in this server.' });
        }

        const roleMapping = {
            'Ingame Member': '1057796072531042374',
            'Warlord': '872619302308679721',
            'Bounty Hunter': '872440600031551488',
            'Emperor': '872619335582105681',
        };

        const roleToPromote = roleMapping[selectedRole];

        if (!roleToPromote) {
            return ctx.reply({ content: 'Invalid role selected for promotion.' });
        }

        if (!member.roles.cache.has(roleToPromote)) {
            const nextRole = guild.roles.cache.get(roleToPromote);

            if (!nextRole) {
                return ctx.reply({ content: `The role with ID ${roleToPromote} was not found in the server.` });
            }

            if (nextRole.position <= member.roles.highest.position) {
                return ctx.reply({ content: 'The specified role must be higher in position than the user\'s current role.' });
            }

            try {
                await member.roles.add(nextRole);

                const dmEmbed = new EmbedBuilder()
                .setAuthor({ name: `Karai Crew`, iconURL: infoIconUrl })
                .setColor(mainColor)
                .setDescription(`Congratulations! You have been promoted to the **${selectedRole}** role for the reason: ${reason}`)
                member.send({ embeds: [dmEmbed]  });          
                
                const successEmbed = new EmbedBuilder()
                .setAuthor({ name: `Success!`, iconURL: checkIconUrl })
                .setColor(greenColor)
                .setDescription(`Successfully promoted <@${userToPromote}> to the <@&${roleToPromote}> role`)
                ctx.reply({ embeds: [successEmbed] });

                
        const reasonEmbed = new EmbedBuilder()
        .setAuthor({ name: `Karai Logs`, iconURL: infoIconUrl })
        .setColor(mainColor)
        .setDescription(`**Staff Member:** <@${ctx.user.id}>\n**Action:** Promote\n**Target:** ${member}\n**Reason:** ${reason}`)
        .setTimestamp();
        channelSend.send({ embeds: [reasonEmbed] });
            } catch (error) {
                console.error(error);
                const erroeEmbed = new EmbedBuilder()
                .setAuthor({ name: `Error!`, iconURL: xmarkIconUrl })
                .setColor(greenColor)
                .setDescription(`Failed to promote ${member} to the <@&${roleToPromote}> role`)
                ctx.reply({ embeds: [erroeEmbed] });
            }
        } else {
            const alreadyEmbed = new EmbedBuilder()
            .setAuthor({ name: `Error!`, iconURL: xmarkIconUrl })
            .setColor(redColor)
            .setDescription(`${member} already has the selected role.`)
            ctx.reply({ embeds: [alreadyEmbed] });
        }
    }
}

export default PromoteCommand;