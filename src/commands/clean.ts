import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Bot } from "../discord/bot";
import Command from "../discord/command";

export default class CleanCommand extends Command {

    public definition = new SlashCommandBuilder()
        .setName("clean")
        .setDescription("Nettoie les salons de loup-garous");

    public async run(_: Bot, interaction: CommandInteraction) {

        const guild = await interaction.guild?.fetch();

        if (!guild
            ?.members.resolve(interaction.user)
            ?.permissions.has("MANAGE_CHANNELS")
        ) {
            return await interaction.reply({
                content: "Vous n'avez pas la permission !",
                ephemeral: true,
            })
        }

        await interaction.reply("Nettoyage...");
        let count = 0;
        Promise.all((await guild?.channels?.fetch()).map(async (channel) => {
            if (
                !(
                    ["lobby", "village", "nuît", "antre-des-loups-garous"]
                        .includes(channel.name)
                    || channel.name.toLowerCase().startsWith("loup-garou - ")
                )
            ) return;
            await channel.delete();
        }))

        await interaction.editReply(`Le serveur a bien été nettoyé !`);
    }

}