import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { ButtonInteraction, CommandInteraction, MessageActionRow, MessageButton } from "discord.js";
import { Bot } from "../../discord/bot";
import { WerewolfCommand } from "../../discord/command";
import Game from "../../werewolf/game";

export default class GameStartCommand extends WerewolfCommand {

    public definition = new SlashCommandSubcommandBuilder()
        .setName("start")
        .setDescription("Démarrer une partie");

    public async run(_: Bot, interaction: CommandInteraction) {
        const member = interaction.guild?.members?.resolve(interaction.user);
        if (!member) return interaction.reply({
            ephemeral: true,
            content: "Cette commande nécessite un serveur."
        });

        const owner = await this.master.resolvePlayer(member);

        if (!owner?.isOwner)
            return await interaction.reply({
                content: "Vous n'êtes le gérant d'aucune partie.",
                ephemeral: true,
            })

        function confirmed(interaction: CommandInteraction | ButtonInteraction) {
            interaction.reply({
                content: "Never gonna give you up,\n"
                    + "Never gonna let you down...\n"
                    + "https://tenor.com/view/rickroll-roll-rick-never-gonna-give-you-up-never-gonna-gif-22954713",
                tts: true,
            })
        }

        let warning: string;
        if (owner.game.players.size < Game.recomandations.minPlayers) {
            warning = "Vous êtes en dessous du nombre minimum de joueurs (" +
                + Game.recomandations.minPlayers +
                ").\nVoulez-vous vraiment démarrer la partie ?";
            await interaction.reply({
                content: warning,
                components: [
                    new MessageActionRow().addComponents(
                        new MessageButton()
                            .setCustomId('yes')
                            .setLabel('Démarrer la partie')
                            .setStyle('PRIMARY')
                    )
                ],
            });
        } else if (owner.game.players.size > Game.recomandations.maxPlayers) {
            warning = "Vous êtes au dessus du nombre maximum de joueurs (" +
                + Game.recomandations.maxPlayers +
                ").\nVoulez-vous vraiment démarrer la partie ?";
            await interaction.reply({
                content: warning,
                components: [
                    new MessageActionRow().addComponents(
                        new MessageButton()
                            .setCustomId('yes')
                            .setLabel('Démarrer la partie')
                            .setStyle('PRIMARY')
                    )
                ],
            });
        } else confirmed(interaction);

        let answered = false;
        interaction.channel?.createMessageComponentCollector({
            filter(i) {
                return i.customId === 'yes' && i.user.id === interaction.user.id
            },
            max: 1,
            time: 15000,
        }).on('collect', async (i) => {
            answered = true;
            confirmed(<ButtonInteraction>i)
        }).on('end', async () => {
            if (answered) return;
            await interaction.editReply({
                content: warning,
                components: [
                    new MessageActionRow().addComponents(
                        new MessageButton()
                            .setCustomId('yes')
                            .setLabel('Démarrer la partie')
                            .setStyle('PRIMARY')
                            .setDisabled(true)
                    )
                ],
            })
        });
    }
}