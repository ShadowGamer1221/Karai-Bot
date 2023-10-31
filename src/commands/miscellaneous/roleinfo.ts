import { discordClient } from '../../main';
import { TextChannel, Role } from 'discord.js'; // Added Role import
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import { getRoleNotFoundEmbed, mainColor, infoIconUrl } from '../../handlers/locale'; // Added imports

class RoleInfoCommand extends Command {
    constructor() {
        super({
            trigger: 'roleinfo',
            description: 'Get information about a specific role in the server.',
            type: 'ChatInput',
            module: 'miscellaneous', // Added module property
            args: [
                {
                    trigger: 'role',
                    description: 'The role you want to get information about.',
                    type: 'DiscordRole', // We specify that the argument should be a role
                    required: true,
                },
            ],
        });
    }

    async run(ctx: CommandContext) {
        const roleId = ctx.args['role']; // Retrieve the role ID from the provided argument

        if (!roleId) {
            // Role ID not provided
            return ctx.reply({ content: 'Please provide a valid role ID.' });
        }
    
        const role = ctx.guild.roles.cache.get(roleId);

        const membersWithRole = role.members;

        // Create an array of member usernames
        const memberUsernames = membersWithRole.map((member) => member.user.username);
    
        if (!role) {
            // Role not found
            return ctx.reply({ embeds: [getRoleNotFoundEmbed()] });
        }

        // Create an embed with role information
        const embed = new EmbedBuilder()
            .setColor(mainColor)
            .setAuthor({ name: `${role.name} Role Information`, iconURL: infoIconUrl })
            .addFields(
                { name: 'Name', value: role.name, inline: true },
                { name: 'ID', value: role.id, inline: true },
                { name: 'Color', value: role.hexColor, inline: true },
                { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
                { name: 'Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
                { name: 'Position', value: role.position.toString(), inline: true },
                { name: 'Members', value: role.members.size.toString(), inline: true },
                { name: 'Created At', value: role.createdAt.toString(), inline: true },
            )

        return ctx.reply({ embeds: [embed] });
    }
}

export default RoleInfoCommand;