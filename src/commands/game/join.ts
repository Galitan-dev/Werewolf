import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Bot } from "../../discord/bot";
import { WerewolfCommand } from "../../discord/command";

export default class GameJoinCommand extends WerewolfCommand {

    public definition = new SlashCommandSubcommandBuilder()
        .setName("join")
        .setDescription("Rejoindre la partie d'un joeur")
        .addUserOption(option => option
            .setName("player")
            .setDescription("Le joueur de la partie à rejoindre")
            .setRequired(true)
        );

    public async run(_: Bot, interaction: CommandInteraction) {
        const member = interaction.guild?.members?.resolve(interaction.user);
        if (!member) return interaction.reply({
            ephemeral: true,
            content: "Cette commande nécessite un serveur."
        });

        const player = this.master.resolvePlayer(
            interaction.guild!.members.resolve(
                interaction.options.getUser("player")!
            )!
        );

        if (!player) return interaction.reply({
            content: "Ce membre n'est dans aucune partie !",
            ephemeral: true
        });

        if (!await player.game.tryJoin(member, interaction)) return;
        await player.game.channels.lobby.send(`:inbox_tray: <@!${member.id}> a rejoint la partie !`);
        await interaction.reply("Vous avez bien rejoint la partie !\n" +
            "Vous pouvez patienter dans le <#" + player.game.channels.lobby.id + ">",
        );
    }

}