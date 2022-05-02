import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Bot } from "../../discord/bot";
import { WerewolfCommand } from "../../discord/command";

export default class GameCreateCommand extends WerewolfCommand {

    public definition = new SlashCommandSubcommandBuilder()
        .setName("create")
        .setDescription("Créer une nouvelle partie de Loup-Garou");

    public async run(_: Bot, interaction: CommandInteraction) {
        const member = interaction.guild?.members?.resolve(interaction.user);
        if (!member) return interaction.reply({
            ephemeral: true,
            content: "Cette commande nécessite un serveur."
        });

        if (this.master.resolvePlayer(member))
            return await interaction.reply({
                content: "Vous êtes déjà dans une partie!",
                ephemeral: true,
            })

        await interaction.reply("Création de la partie...");

        const game = this.master.newGame(member);
        await game.init();

        interaction.editReply(
            "La partie a bien été créée,"
            + `\nvous pouvez attendre dans le <#${game.channels.lobby.id}>`
        );
    }

}