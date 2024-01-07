import { Client as RobloxClient } from 'bloxy';
import { EmbedBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { config } from '../../config';

class VerifyCommand extends Command {
    constructor() {
        super({
            trigger: 'verify',
            description: 'Verify your Roblox account.',
            type: 'ChatInput',
            module: 'bot',
            args: [
                {
                    trigger: 'robloxUsername',
                    description: 'Your Roblox username.',
                    type: 'String',
                    required: true,
                },
            ],
            permissions: [
                {
                    type: 'role',
                    ids: config.permissions.verified,
                    value: true,
                },
            ],
        });
    }

    run(ctx: CommandContext) {
        const robloxClient = new RobloxClient({ credentials: { cookie: process.env.ROBLOX_COOKIE } });
        const userId = ctx.member.id;
        const guildId = ctx.guild.id;
        const emojis = ['👍', '😂', '❤️', '🔥', '😊', '👏', '🎉', '🤔', '😎', '🚀', '💡', '🌟', '😄', '👌', '🙌'];
        const selectedEmojis = this.getRandomEmojis(5, emojis);

        // Get the user's Roblox description
        const robloxUsername = ctx.args.getString('robloxUsername');
        robloxClient.apis.usersAPI.getUsersByUsernames(robloxUsername)
            .then((users) => {
                const user = users[0];
                if (user && user.id) {
                    return robloxClient.apis.usersAPI.getUserStatus({ userId: user.id })
                        .then((userProfile) => {
                            const description = userProfile.status || '';
                            return { userId: user.id, description: description };
                        });
                } else {
                    throw new Error(`User with username ${robloxUsername} not found on Roblox.`);
                }
            })
            .then(({ userId, description }) => {
                // Send the verification message
                const embed = new EmbedBuilder()
                    .setTitle('Verify Your Roblox Account')
                    .setDescription(`To complete the verification, add the following emojis to your Roblox description:\n\n${selectedEmojis.join(' ')}`)
                    .setColor('#3498db'); // You can change the color as needed

                const row = new ButtonBuilder()
                    .setCustomId('verify_done')
                    .setLabel('Done')
                    .setStyle(ButtonStyle.Primary);

                ctx.reply({ embeds: [embed], components: [
                    {
                        type: 1,
                        components: [
                            row,
                        ],
                    },
                ], });

                // Collect the interaction
                const filter = (i) => i.customId === 'verify_done' && i.user.id === userId;
                const collector = ctx.channel.createMessageComponentCollector({ filter, time: 120000 }); // 120 seconds

                collector.on('collect', (i) => {
                    // Check if the emojis are in the user's Roblox description
                    if (this.checkEmojisInDescription(description, selectedEmojis)) {
                        // Add the verified role
                        const verifiedRole = ctx.guild.roles.cache.get(config.permissions.verified[0]);
                        if (verifiedRole) {
                            ctx.member.roles.add(verifiedRole);
                        }

                        // Send success message
                        const successEmbed = new EmbedBuilder()
                            .setTitle('Verification Successful')
                            .setDescription('You have successfully verified your Roblox account!')
                            .setColor('#2ecc71'); // You can change the color as needed

                        i.reply({ embeds: [successEmbed], ephemeral: true });
                    } else {
                        // Send failure message
                        const failureEmbed = new EmbedBuilder()
                            .setTitle('Verification Failed')
                            .setDescription('Failed to verify your Roblox account. Make sure to add the emojis to your Roblox description before clicking "Done".')
                            .setColor('#e74c3c'); // You can change the color as needed

                        i.reply({ embeds: [failureEmbed], ephemeral: true });
                    }

                    collector.stop();
                });

                collector.on('end', (collected, reason) => {
                    if (reason === 'time') {
                        // Handle timeout
                        ctx.reply('Verification timed out. Please run the command again.');
                    }
                });
            })
            .catch((error) => {
                console.error(error);
                ctx.reply('Failed to verify your Roblox account.');
            });
    }

    getRandomEmojis(count: number, emojis: string[]): string[] {
        const selectedEmojis = [];

        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * emojis.length);
            selectedEmojis.push(emojis[randomIndex]);
        }

        return selectedEmojis;
    }

    checkEmojisInDescription(description: string, emojis: string[]): boolean {
        return emojis.every((emoji) => description.includes(emoji));
    }
}

export default VerifyCommand;