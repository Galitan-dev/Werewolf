import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageActionRow, MessageButton } from "discord.js";
import { Bot } from "../../discord/bot";
import { WerewolfCommand } from "../../discord/command";

export default class GameStopCommand extends WerewolfCommand {

    public definition = new SlashCommandSubcommandBuilder()
        .setName("stop")
        .setDescription("Mettre fin à une partie");

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

        await interaction.reply({
            content: "Êtes vous sûr de vouloir arrêter la partie ?\n" +
                "Il ne sera pas possible de la relancer.",
            components: [
                new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId('yes')
                        .setLabel('Arrêter la partie')
                        .setStyle('DANGER')
                )
            ],
        });

        let answered = false;
        interaction.channel?.createMessageComponentCollector({
            filter(i) {
                return i.customId === 'yes' && i.user.id === interaction.user.id
            },
            max: 1,
            time: 15000,
        }).on('collect', async (i) => {
            answered = true;
            this.master.games.delete(owner.game.id);
            await i.reply({
                content: "La partie a pris fin !",
                components: [
                    new MessageActionRow().addComponents(
                        new MessageButton()
                            .setCustomId('delete')
                            .setLabel('Supprimer les salons')
                            .setStyle('PRIMARY')
                    )
                ],
            });
        }).on('end', async () => {
            if (answered) return;
            await interaction.editReply({
                content: "Êtes vous sûr de vouloir arrêter la partie ?\n" +
                    "Il ne sera pas possible de la relancer.\n" +
                    "*Vous avez mis trop de temps à répondre.*",
                components: [
                    new MessageActionRow().addComponents(
                        new MessageButton()
                            .setCustomId('yes')
                            .setLabel('Arrêter la partie')
                            .setStyle('DANGER')
                            .setDisabled(true)
                    )
                ],
            })
        });

        interaction.channel?.createMessageComponentCollector({
            filter(i) {
                return (i.customId === 'delete' && (
                    i.user.id === interaction.user.id ||
                    i.guild.members.resolve(i.user)
                        ?.permissions.has("MANAGE_CHANNELS")
                )) ?? false
            },
            max: 1,
        }).on('collect', async (i) => {
            await i.reply({
                content: "Je supprime les salons...",
            });
            for (const channel of Object.values(owner.game.channels)) {
                if (channel.deletable) channel.delete();
            }
        });
    }
}