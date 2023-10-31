import { discordClient } from '../../main';
import weather from 'weather-js';
import { EmbedBuilder } from 'discord.js';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { groupBy } from 'lodash';
import {
    getCommandInfoEmbed,
    getCommandListEmbed,
    getCommandNotFoundEmbed,
    mainColor,
} from '../../handlers/locale';
import { xmarkIconUrl } from '../../handlers/locale';
import { greenColor } from '../../handlers/locale';
import { redColor } from '../../handlers/locale';
import { infoIconUrl } from '../../handlers/locale';
import { config } from '../../config';

class WeatherCommand extends Command {
    constructor() {
        super({
            trigger: 'weather',
            description: 'Gets the current weather from the state.',
            type: 'ChatInput',
            module: 'miscellaneous',
            args: [
              {
                    trigger: 'state',
                    description: 'The state that you want to get the current weather from.',
                    isLegacyFlag: false,
                    required: true,
                    type: 'String',
              }
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
        
        weather.find({ search: ctx.args['state'], degreeType: 'C'}, function(err, result, lenght) {
          
        if(result.length === 0){
            let noresultsEmbed = new EmbedBuilder()
            .setAuthor({ name: `Invalid State`, iconURL: xmarkIconUrl })
            .setDescription(`Please enter a vaild location!`)
            .setColor(redColor)
            .setTimestamp();
                return ctx.reply({ embeds: [noresultsEmbed] });
        }
        
          var current = result[0].current;
          var location = result[0].location;
            if (err) {
            let errorembed = new EmbedBuilder()
            .setAuthor({ name: `Error`, iconURL: xmarkIconUrl })
            .setDescription(`An error has occurred!`)
            .setColor(redColor)
            .setTimestamp();
                return ctx.reply({ embeds: [errorembed] });
            }
        
            
            let embed = new EmbedBuilder()
            .setDescription(`**${current.skytext}**`)
            .setAuthor({ name: `Weather for ${current.observationpoint}`, iconURL: infoIconUrl })
            .setThumbnail(current.imageUrl)
            .setColor(mainColor)
            .addFields(
                { name: 'Timezone', value: `UTC${location.timezone}`, inline: true },
                { name: 'Degree Type', value: location.degreetype, inline: true },
                { name: 'Temperature', value: `${current.temperature} Degrees`, inline: true },
                { name: 'Feels Like', value: `${current.feelslike} Degrees`, inline: true },
                { name: 'Winds', value: current.winddisplay, inline: true },
                { name: 'Humidity', value: `${current.humidity}%`, inline: true },
            )
            .setFooter({ text: `Requested by ${ctx.user.username}`, iconURL: ctx.user.avatarURL() })
            .setTimestamp();
                ctx.reply({ embeds: [embed] });
        });
    }
}

export default WeatherCommand;