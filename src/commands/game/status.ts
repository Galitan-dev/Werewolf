import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Bot } from "../../discord/bot";
import { WerewolfCommand } from "../../discord/command";

export default class GameStatusCommand extends WerewolfCommand {

    public definition = new SlashCommandSubcommandBuilder()
        .setName("status")
        .setDescription("Afficher le statut d'une partie")
        .addUserOption(option => option
            .setName("player")
            .setDescription("Un joeur de la partie en question")
            .setRequired(false)
        )

    public async run(_: Bot, interaction: CommandInteraction) {
        const member = interaction.guild?.members?.resolve(interaction.user);
        if (!member) return interaction.reply({
            ephemeral: true,
            content: "Cette commande nécessite un serveur."
        });

        const user = interaction.options.getUser("player");
        let player;

        if (user) {
            player = await this.master.resolvePlayer(user.id);

            if (!player)
                return await interaction.reply({
                    content: "Ce joueur n'est dans aucune partie.",
                    ephemeral: true,
                })
        } else {
            player = await this.master.resolvePlayer(member);

            if (!player)
                return await interaction.reply({
                    content: "Vous n'êtes dans aucune partie.",
                    ephemeral: true,
                })
        }

        await interaction.reply({
            embeds: [player.game.statusEmbed]
        })
    }

}