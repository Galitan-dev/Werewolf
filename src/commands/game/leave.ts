import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Bot } from "../../discord/bot";
import { WerewolfCommand } from "../../discord/command";

export default class GameLeaveCommand extends WerewolfCommand {

    public definition = new SlashCommandSubcommandBuilder()
        .setName("leave")
        .setDescription("Quitter la partie")

    public async run(_: Bot, interaction: CommandInteraction) {
        const member = interaction.guild?.members?.resolve(interaction.user);
        if (!member) return interaction.reply({
            ephemeral: true,
            content: "Cette commande nécessite un serveur."
        });

        const player = await this.master.resolvePlayer(member);

        if (!player)
            return await interaction.reply({
                content: "Vous n'êtes dans aucune partie.",
                ephemeral: true,
            })

        if (!await player.game.tryLeave(member, interaction)) return;
        await player.game.channels.lobby.send(
            `:outbox_tray: <@!${member.id}> a quitté la partie !`);
        await interaction.reply("Vous avez bien quitté la partie !");
    }

}