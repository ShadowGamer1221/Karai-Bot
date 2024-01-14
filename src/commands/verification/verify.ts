import {
    discordClient,
    robloxClient,
    robloxGroup
  } from '../../main';
  import { CommandContext } from '../../structures/addons/CommandAddons';
  import { Command } from '../../structures/Command';
  import { config } from '../../config';
  import { getLinkedRobloxUser } from '../../handlers/accountLinks';
  import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    Interaction,
    ModalActionRowComponentBuilder,
    ChatInputCommandInteraction,
    TextChannel,
    CommandInteraction
  } from 'discord.js';
  import { greenColor, infoIconUrl, mainColor, redColor, xmarkIconUrl } from '../../handlers/locale';
  import noblox from 'noblox.js';
  
  class VerifyCommand extends Command {
      constructor() {
          super({
              trigger: 'verify',
              description: 'Verify your Roblox account by adding specific emojis to your Roblox description.',
              type: 'ChatInput',
              module: 'verification',
              args: [],
          });
      }
  
      async run(ctx: CommandContext) {
          noblox.setCookie(process.env.ROBLOX_COOKIE);
  
          const doneButton = new ButtonBuilder()
              .setCustomId('done')
              .setLabel('Done')
              .setStyle(ButtonStyle.Success);
  
          const cancelButton = new ButtonBuilder()
              .setCustomId('cancel')
              .setLabel('Cancel')
              .setStyle(ButtonStyle.Danger);
  
          const textInput = new TextInputBuilder()
              .setCustomId('robloxusername')
              .setLabel('What is your Roblox Username?')
              .setPlaceholder('E.g. Akai')
              .setRequired(true)
              .setMinLength(1)
              .setStyle(TextInputStyle.Short);
  
          const modal = new ModalBuilder()
              .setCustomId('robloxUsernameModal')
              .setTitle('Karai Verification');
  
          const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);
          modal.addComponents(actionRow);
  
          const interaction = ctx.subject as CommandInteraction;
          await interaction.showModal(modal);
  
          interaction.awaitModalSubmit({ time: 60000, filter: i => i.customId === 'robloxUsernameModal' })
              .then(async (modalInteraction) => {
                  const usernameRoblox = modalInteraction.fields.getTextInputValue('robloxusername');
                  await modalInteraction.deferReply();
  
                  function SendVerificationMessage(Title: string, Description: string, Color: string, Components: any, Components2?: any) {
                      const Embed = new EmbedBuilder()
                          .setAuthor({name: 'Karai Verification', iconURL: ctx.user.displayAvatarURL()})
                          .setTitle(Title)
                          .setDescription(Description)
                          .setColor(mainColor)
                          .setFooter({ text: 'This prompt will cancel in 2 minutes.' })
                          .setTimestamp();
                      modalInteraction.editReply({ embeds: [Embed], components: [{ type: 1, components: [Components, Components2] }]});
                  }
  
                  function Generate() {
                      let text = '';
                      let randomstuff = ['art and sleep or add split or use', 'hand and plant or math and color', 'refuse to read or is full and fresh'];
                      text += randomstuff[Math.floor(Math.random() * randomstuff.length)];
                      return text;
                  }
  
                  const filter = (m) => m.member.id === ctx.user.id;
  
                  // Start of verification process
                  const UserId = await noblox.getIdFromUsername(usernameRoblox);
                  if (!UserId) {
                      // User not found handling
                      const userNotFoundEmbed = new EmbedBuilder()
                          .setAuthor({ name: 'Karai Verification', iconURL: xmarkIconUrl })
                          .setColor(redColor)
                          .setDescription(`User \`${usernameRoblox}\` not found. Please check the username and try again.`);
                      await modalInteraction.editReply({ embeds: [userNotFoundEmbed], components: [] });
                      return;
              }
  
              const string = Generate();
              const verifyEmbed = new EmbedBuilder()
                  .setAuthor({ name: 'Karai Verification', iconURL: infoIconUrl })
                  .setColor(mainColor)
                  .setTitle(`Hello, ${usernameRoblox}!`)
                  .setDescription('To verify that you own this account, please put this in your ROBLOX blurb or status:\n\n`' + string + '`\n\nWhen you have completed this, press `done`.\nIf you wish to cancel the verification process, press `cancel`.')
              await modalInteraction.editReply({ embeds: [verifyEmbed], components: [{ type: 1, components: [doneButton, cancelButton] }] });
  
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
                          .setDescription(`Searching for \`${string}\` on \`${usernameRoblox}\`...`)
                      await modalInteraction.editReply({ embeds: [searchEmbed] });
  
                      setTimeout(async function () {
                          const blurb = await noblox.getBlurb(UserId);
                          if (blurb.includes(string)) {
                              let verifiedRole = await ctx.guild.roles.cache.find((role) => role.id === '872405718936993852');
                              ctx.member.roles.add(verifiedRole);
  
                              const updatedRoles = new EmbedBuilder()
                                  .setAuthor({ name: `Updated Roles for ${ctx.member.nickname}`, iconURL: ctx.user.displayAvatarURL() })
                                  .setColor(greenColor)
                                  .setDescription(`Your are now verified as \`${usernameRoblox}\`!\n\nAdded roles:\n<@&872405718936993852>`);
                              await modalInteraction.editReply({ embeds: [updatedRoles] });
                          } else {
                              const notVerifiedEmbed = new EmbedBuilder()
                                  .setAuthor({ name: `Error`, iconURL: xmarkIconUrl })
                                  .setColor(redColor)
                                  .setDescription(`I couldn't find the text in your status or blurb. Please try again.`);
                              await modalInteraction.editReply({ embeds: [notVerifiedEmbed], components: [] });
                          }
                      }, 5000);
                  } else if (interaction.customId === 'cancel' && interaction.user.id === ctx.user.id) {
                      SendVerificationMessage('Prompt', 'Cancelled the verification prompt.', 'RED', cancelButton);
                  }
              });
          })
          .catch(console.error); // Handle errors
  }
  
  }
  
  export default VerifyCommand;