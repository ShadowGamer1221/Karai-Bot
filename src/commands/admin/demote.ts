import { config } from '../../config';
import { checkIconUrl, greenColor, infoIconUrl, mainColor, redColor, xmarkIconUrl } from '../../handlers/locale';
import { discordClient } from '../../main';
import { Command } from '../../structures/Command';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, TextChannel } from 'discord.js';

class DemoteCommand extends Command {
    constructor() {
        super({
            trigger: 'demote',
            description: 'Demotes a user by removing all roles above a specified role while keeping the selected role.',
            type: 'ChatInput',
            module: 'admin',
            args: [
                {
                    trigger: 'user',
                    description: 'The user to demote.',
                    type: 'DiscordUser',
                    required: true,
                },
                {
                    trigger: 'role',
                    description: 'Select the role for demotion.',
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
                    description: 'Select a reason for the demote.',
                    type: 'String',
                    required: true,
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
        const userToDemote = ctx.args['user'];
        const selectedRole = ctx.args['role'];
        const reason = ctx.args['reason'];

        let channelSend: TextChannel;
        channelSend = await discordClient.channels.fetch('1168628274759471155') as TextChannel;

        if (!userToDemote) {
            return ctx.reply({ content: 'Please mention a valid user to demote.' });
        }

        if (!selectedRole) {
            return ctx.reply({ content: 'Please select a role for demotion.' });
        }

        const guild = ctx.guild;
        const member = guild.members.cache.get(userToDemote);

        if (!member) {
            const notInServerEmbed = new EmbedBuilder()
            .setAuthor({ name: `Error!`, iconURL: xmarkIconUrl })
            .setColor(redColor)
            .setDescription(`The mentioned user is not in this server.`)
            return ctx.reply({ embeds: [notInServerEmbed] });
        }

        const roleMapping = {
            'Ingame Member': '1057796072531042374',
            'Warlord': '872619302308679721',
            'Bounty Hunter': '872440600031551488',
            'Emperor': '872619335582105681',
        };

        const roleToDemote = roleMapping[selectedRole];

        if (!roleToDemote) {
            return ctx.reply({ content: 'Invalid role selected for demotion.' });
        }

        if (member.roles.cache.has(roleToDemote)) {
            const rolesToKeep = [roleToDemote];
            const rolesToRemove = member.roles.cache.filter((role) =>
                role.position > guild.roles.cache.get(roleToDemote).position
            );

            try {
                await member.roles.remove(rolesToRemove);

                const successEmbed = new EmbedBuilder()
                    .setAuthor({ name: `Success!`, iconURL: checkIconUrl })
                    .setColor(greenColor)
                    .setDescription(`Successfully demoted <@${userToDemote}> to <@&${roleToDemote}>.`)
                ctx.reply({ embeds: [successEmbed] });

                const logEmbed = new EmbedBuilder()
                .setAuthor({ name: `Karai Logs`, iconURL: infoIconUrl })
                .setColor(mainColor)
                .setDescription(`**Staff Member:** <@${ctx.user.id}>\n**Action:** Demote\n**Target:** <@${userToDemote}>\n**Reason:** ${reason}`)

                channelSend.send({ embeds: [logEmbed] });

                const dmEmbed = new EmbedBuilder()
                .setAuthor({ name: `Karai Crew`, iconURL: infoIconUrl })
                .setColor(mainColor)
                .setDescription(`You have been demoted to the **${selectedRole}** role for the reason: ${reason}`)
                member.send({ embeds: [dmEmbed]  });  
            } catch (error) {
                console.error(error);
                const errorEmbed = new EmbedBuilder()
                    .setAuthor({ name: `Error!`, iconURL: xmarkIconUrl })
                    .setColor(redColor)
                    .setDescription(`Failed to demote <@${member}> by removing roles above <@&${roleToDemote}>.`)
                ctx.reply({ embeds: [errorEmbed] });
            }
        } else {
            const alreadyEmbed = new EmbedBuilder()
                .setAuthor({ name: `Error!`, iconURL: xmarkIconUrl })
                .setColor(redColor)
                .setDescription(`<@${member}> does not have the selected role to be demoted from.`)
            ctx.reply({ embeds: [alreadyEmbed] });
        }


    }
}

export default DemoteCommand;