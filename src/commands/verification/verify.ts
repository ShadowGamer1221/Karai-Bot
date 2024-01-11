import { discordClient, robloxClient, robloxGroup } from '../../main';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { config } from '../../config';
import { getLinkedRobloxUser } from '../../handlers/accountLinks';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, Interaction, ModalActionRowComponentBuilder, ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { greenColor, infoIconUrl, mainColor, redColor, xmarkIconUrl } from '../../handlers/locale';
import { Modal } from 'discord-modals';
import noblox from 'noblox.js';

class VerifyCommand extends Command {
    constructor() {
        super({
            trigger: 'new',
            description: 'Verify your Roblox account by adding specific emojis to your Roblox description.',
            type: 'ChatInput',
            module: 'verification',
            args: [],
        });
    }

    async run(ctx: CommandContext) {

        noblox.setCookie(process.env.ROBLOX_COOKIE)

        const doneButton = new ButtonBuilder()
        .setCustomId('done')
        .setLabel('Done')
        .setStyle(ButtonStyle.Success);

        const cancelButton = new ButtonBuilder()
        .setCustomId('cancel')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Danger);

        let channelSend: TextChannel;
        channelSend = await discordClient.channels.fetch('1168601617524854824') as TextChannel;
        console.log(channelSend)

        function SendVerificationMessage(Title: string, Description: string, Color: string, Components: any, Components2?: any) {
            const Embed = new EmbedBuilder()
                .setAuthor({name: 'Karai Verification', iconURL: ctx.user.displayAvatarURL()})
                .setTitle(Title)
                .setDescription(Description)
                .setColor(mainColor)
                .setFooter({ text: 'This prompt will cancel in 2 minutes.' })
                .setTimestamp();
            ctx.reply({ embeds: [Embed], components: [{ type: 1, components: [Components, Components2] }]})
        }


            function Generate() {
                let text = '';
                let randomstuff = ['art and sleep or add split or use', 'hand and plant or math and color', 'refuse to read or is full and fresh'];
                text += randomstuff[Math.floor(Math.random() * randomstuff.length)];
                return text;
            }

            const filter = (m) => m.member.id === ctx.user.id;
            const collector = ctx.channel.createMessageCollector({
                filter,
                max: 1,
                time: 120000,
            });

            const embed = new EmbedBuilder()
                .setAuthor({ name: 'Karai Verification', iconURL: infoIconUrl })
                .setDescription('What is your ROBLOX username?')
                .setColor(mainColor)
                .setFooter({ text: 'This prompt will cancel in 2 minutes.' })
                .setTimestamp();

            ctx.editReply({ embeds: [embed] });

            collector.on('collect', (m) => {
                if (m.content.toLowerCase() === 'cancel') {
                    SendVerificationMessage('Prompt', 'Cancelled the verification prompt.', 'RED', cancelButton);
                    return;
                }
                
                noblox.getIdFromUsername(m.content).then(async (foundUser) => {

                    if (!foundUser) {
                        // Handle the case where the user is not found
                        const userNotFoundEmbed = new EmbedBuilder()
                            .setAuthor({ name: 'Karai Verification', iconURL: xmarkIconUrl })
                            .setColor(redColor)
                            .setDescription(`User \`${m.content}\` not found. Please check the username and try again.`);
                        ctx.editReply({ embeds: [userNotFoundEmbed], components: [] });
                        return;
                    }

                    const UserId = foundUser;
                    const string = Generate();
                    const verifyEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Karai Verification', iconURL: infoIconUrl })
                    .setColor(mainColor)
                    .setTitle(`Hello, ${m.content}!`)
                    .setDescription('To verify that you own this account, please put this in your ROBLOX blurb or status:\n\n`' + string + '`\n\nWhen you have completed this, say `done`.\nIf you wish to cancel the verification process, say `cancel`.')
                    ctx.editReply({ embeds: [verifyEmbed], components: [{ type: 1, components: [doneButton, cancelButton] }] })

                    const collector2 = ctx.channel.createMessageComponentCollector({
                        filter,
                        max: 1,
                        time: 120000,
                    });

                    collector2.on('collect', async (interaction) => {
                        if (interaction.customId === 'done' && interaction.user.id === ctx.user.id) {
                            const searchEmbed = new EmbedBuilder()
                            .setAuthor({ name: 'Karai Verification', iconURL: infoIconUrl })
                            .setColor(mainColor)
                            .setDescription(`Searching for \`${string}\` on \`${m.content}\`...`)
                            ctx.reply({ embeds: [searchEmbed] }).then(async (message1) => {
                                setTimeout(async function () {
                                    noblox.getBlurb(UserId).then(async (blurb) => {
                                        if (blurb.includes(string)) {

                                                let verifiedRole = await ctx.guild.roles.cache.find((role) => role.id === '872405718936993852');
                                                ctx.member.roles.add(verifiedRole);

                                                const updatedRoles = new EmbedBuilder()
                                                    .setAuthor({ name: `Updated Roles for ${ctx.member.nickname}`, iconURL: ctx.user.displayAvatarURL() })
                                                    .setColor(greenColor)
                                                    .setDescription(`Your are now verified as \`${m.content}\`!\n\nAdded roles:\n<@&872405718936993852>`);

                                                ctx.editReply({ embeds: [updatedRoles] });
                                            } else {
                                                const notVerifiedEmbed = new EmbedBuilder()
                                                .setAuthor({ name: `Error`, iconURL: xmarkIconUrl })
                                                .setColor(redColor)
                                                .setDescription(`I couldn't find the text in your status or blurb. Please try again.`);
                                                ctx.editReply({ embeds: [notVerifiedEmbed], components: [] });
                                            }
                                        });
                                }, 5000);
                            });
                        } else if (interaction.customId === 'cancel' && interaction.user.id === ctx.user.id) {
                            SendVerificationMessage('Prompt', 'Cancelled the verification prompt.', 'RED', cancelButton);
                        }
                    });
                });
            });
    }
}

export default VerifyCommand;