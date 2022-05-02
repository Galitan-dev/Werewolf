import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Bot } from "../discord/bot";
import Command from "../discord/command";

export default class PingCommand extends Command {

    public definition = new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Répond par `pong` !");

    public async run(_: Bot, interaction: CommandInteraction) {
        await interaction.reply('pong !');
    }

}