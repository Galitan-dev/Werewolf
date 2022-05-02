import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Bot } from "../../discord/bot";
import { WerewolfCommand } from "../../discord/command";

export default class GameListCommand extends WerewolfCommand {

    public definition = new SlashCommandSubcommandBuilder()
        .setName("list")
        .setDescription("Liste les parties du serveur");

    public async run(_: Bot, interaction: CommandInteraction) {
        const member = interaction.guild?.members?.resolve(interaction.user);
        if (!member) return interaction.reply({
            ephemeral: true,
            content: "Cette commande nécessite un serveur."
        });

        const games = this.master.games.filter((game) =>
            game.owner.member.guild.id === member.guild.id
        );

        if (games.size < 1)
            return interaction.reply("Il n'y a aucune partie sur ce serveur.");

        await interaction.reply({
            content: "Il y a " + games.size + " partie"
                + (games.size > 1 ? "s" : "")
                + " sur ce serveur:",
            embeds: games.map((game) => game.statusEmbed),
        });

    }

}