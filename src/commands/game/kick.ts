import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Bot } from "../../discord/bot";
import { WerewolfCommand } from "../../discord/command";

export default class GameKickCommand extends WerewolfCommand {

    public definition = new SlashCommandSubcommandBuilder()
        .setName("kick")
        .setDescription("Expulser un joueur de la partie")
        .addUserOption(option => option
            .setName("player")
            .setDescription("Le joueu à expulser de la partie")
            .setRequired(true)
        );

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

        const player = this.master.resolvePlayer(
            interaction.guild!.members.resolve(
                interaction.options.getUser("player")!
            )!
        );

        if (player?.isEqualTo?.(owner))
            return await interaction.reply({
                content: "Vous n'êtes pas très fute-fute vous.",
                ephemeral: true,
            })

        if (!player?.game?.isEqualTo(owner.game))
            return await interaction.reply({
                content: "Ce joueur n'est pas dans votre partie.",
                ephemeral: true,
            })

        player.game.removePlayer(player);
        await player.game.channels.lobby.send(
            `:outbox_tray: <@!${member.id}> a été expulsé de la partie !`);
        await interaction.reply("Le joueur a bien été expulsé de la partie !");
    }

}