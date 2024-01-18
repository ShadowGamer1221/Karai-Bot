import { EmbedBuilder } from 'discord.js';
import { Command } from '../../structures/Command';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { GuildMember, Role } from 'discord.js';
import { checkIconUrl, greenColor, redColor, xmarkIconUrl } from '../../handlers/locale';

class RoleAddCommand extends Command {
    constructor() {
        super({
            trigger: 'role',
            description: 'Adds a role to a user.',
            type: 'ChatInput', // Adjust as per your command handling system
            module: 'admin', // Change as needed
            args: [
                {
                    trigger: 'user',
                    description: 'The user to add the role to.',
                    type: 'DiscordUser',
                    required: true
                },
                {
                    trigger: 'role',
                    description: 'The partial or full name of the role, or the role ID.',
                    type: 'DiscordRole',
                    required: true
                }
            ],
            permissions: [] // Set appropriate permissions
        });
    }

    async run(ctx: CommandContext) {
        const guild = ctx.guild;
        let userId = ctx.args['user'];
        userId = userId.replace('>', '');
        userId = userId.replace('<', '');
        userId = userId.replace('@', '');
        console.log(userId);
        const roleIdentifier = ctx.args['role'].toLowerCase(); // Convert to lowercase for case-insensitive comparison

        if (!guild) {
            return ctx.reply('This command can only be used in a server.');
        }

        const member = await guild.members.fetch(userId).catch(() => null);
        console.log(member);
        let role = await guild.roles.fetch(roleIdentifier).catch(() => null);

        // If the role is not found by ID, try finding by partial name
        if (!role) {
            role = guild.roles.cache.find(r => r.name.toLowerCase().includes(roleIdentifier));
        }

        if (!member || !role) {
            const errorEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Error', iconURL: xmarkIconUrl })
            .setDescription('Unable to find the specified user or role.')
            .setColor(redColor);
            return ctx.reply({ embeds: [errorEmbed] });
        }

        try {
            await member.roles.add(role);
            const successEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Success', iconURL: checkIconUrl })
            .setColor(greenColor)
            .setDescription(`Role \`${role.name}\` has been added to <@${member.user.id}>.`);
            ctx.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Failed to add role:', error);
            const embed = new EmbedBuilder()
            .setAuthor({ name: 'Error', iconURL: xmarkIconUrl })
            .setColor(redColor)
            .setDescription(`Failed to add role \`${role.name}\` to <@${member.user.id}>. Make sure I have the right permissions.`);
            ctx.reply({ embeds: [embed] });
        }
    }
}

export default RoleAddCommand;