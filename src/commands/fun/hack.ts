import { discordClient } from '../../main';
import { GuildMember, TextChannel } from 'discord.js';
import { GetGroupRoles } from 'bloxy/src/client/apis/GroupsAPI';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import {
    getInvalidRobloxUserEmbed,
    getRobloxUserIsNotMemberEmbed,
    getUnexpectedErrorEmbed,
    getNoRankAboveEmbed,
    getRoleNotFoundEmbed,
    getVerificationChecksFailedEmbed,
    getUserSuspendedEmbed,
    greenColor,
    mainColor,
} from '../../handlers/locale';
import { config } from '../../config';
import { User, PartialUser, GroupMember } from 'bloxy/dist/structures';
import Discord from 'discord.js';
import discord from 'discord.js';
import axios from 'axios';
import generator from 'generate-password';

class HackCommand extends Command {
    constructor() {
        super({
            trigger: 'testing',
            description: 'fake hacks a user.',
            type: 'ChatInput',
            module: 'fun', // Change to appropriate module
            args: [
                {
                    trigger: 'user',
                    description: 'The user to hack.',
                    isLegacyFlag: false,
                    required: true,
                    type: 'DiscordUser',
                }
            ],
            permissions: [
                // Add any necessary permissions here
            ]
        });
    }

    async run(ctx: CommandContext) {
        const password = generator.generate({
            length: 10,
            symbols: true,
            numbers: true
        });

        let user = ctx.args['user'];
        user = user.replace('>', '')
        user = user.replace('<', '')
        user = user.replace('@', '')
        user = user.replace('!', '')
        const member = ctx.guild.members.fetch(user);

        if (!user) {
            const embed = new EmbedBuilder().setDescription("Invalid usage!").setColor(mainColor);
            return ctx.reply({ embeds: [embed] });
        }

        function wait(ms) {
            let start = new Date().getTime();
            let end = start;
            while (end < start + ms) {
                end = new Date().getTime();
            }
        }

        const embed = new EmbedBuilder().setColor(mainColor).setDescription(`The hack on <@${user}> started...`);
        const msg = await ctx.reply({ embeds: [embed] });

        wait(1400);
        const embedSearchingInfo = new EmbedBuilder().setColor(mainColor).setDescription(`Searching for user information..`);
        const msgSearchingInfo = await ctx.editReply({ embeds: [embedSearchingInfo] });

        wait(1330);
        const embedSearchingIP = new EmbedBuilder().setColor(mainColor).setDescription(`Searching for IP address...`);
        const msgSearchingIP = await ctx.editReply({ embeds: [embedSearchingIP] });

        wait(1400);
        const embedIPFound = new EmbedBuilder().setColor(mainColor).setDescription(`The user's IP address was found!`).addFields(
            { name: '🔗┆IP Address', value: `\`\`\`127.0.0.1\`\`\``, inline: true }
        );
        const msgIPFound = await ctx.editReply({ embeds: [embedIPFound] });

        wait(6000);
        const embedSearchingLogin = new EmbedBuilder().setColor(mainColor).setDescription(`Searching for Discord login...`);
        const msgSearchingLogin = await ctx.editReply({ embeds: [embedSearchingLogin] });

        wait(6000);
        const embedLoginFound = new EmbedBuilder().setColor(mainColor).setDescription(`The user's Discord login was found!`).addFields(
            { name: '📨┆Email', value: `\`\`\`${(await member).nickname}onDiscord@gmail.com\`\`\`` },
            { name: '🔑┆Password', value: `\`\`\`${password}\`\`\`` }
        );
        const msgLoginFound = await ctx.editReply({ embeds: [embedLoginFound] });

        wait(2000);
        const embedSearchingToken = new EmbedBuilder().setColor(mainColor).setDescription(`Searching for Discord token...`);
        const msgSearchingToken = await ctx.editReply({ embeds: [embedSearchingToken] });

        wait(6000);
        try {
            const res = await axios.get(`https://some-random-api.com/bottoken?${user}`);
            const json = res.data;

            const embedTokenFound = new EmbedBuilder().setColor(mainColor).setDescription(`The user's Discord account token was found!`).addFields(
                { name: '🔧┆Token', value: `\`\`\`${json.token}\`\`\``, inline: true }
            );
            const msgTokenFound = await ctx.editReply({ embeds: [embedTokenFound] });
            
            wait(2000);
            const embedReporting = new EmbedBuilder().setColor(mainColor).setDescription(`Reporting account to Discord for breaking TOS...`);
            const msgReporting = await ctx.editReply({ embeds: [embedReporting] });

            wait(5000);
            const embedSuccess = new EmbedBuilder().setColor(greenColor).setDescription(`<@${user}> is successfully hacked. All the user's information was sent to your DM`);
            await ctx.editReply({ embeds: [embedSuccess] });

            const embedPranked = new EmbedBuilder().setTitle('😂・Pranked').setImage("https://media1.tenor.com/images/05006ed09075a0d6965383797c3cea00/tenor.gif?itemid=17987788");
            await ctx.reply({ embeds: [embedPranked] });

        } catch (error) {
            // Handle error if fetching token fails
            console.error(error);
        }
    }
}

export default HackCommand;