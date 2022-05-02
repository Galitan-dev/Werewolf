import { ButtonInteraction, CategoryChannel, Collection, CommandInteraction, EmbedAuthorData, GuildMember, InteractionCollector, Message, MessageActionRow, MessageButton, MessageEmbed, MessageOptions, Snowflake, TextChannel } from "discord.js";
import WerewolfMaster from ".";
import Player, { PlayerResolvable } from "./player";

export default class Game {

    public static recomandations = {
        minPlayers: 8,
        maxPlayers: 18,
    };

    public master: WerewolfMaster
    public channels: {
        lobby: TextChannel,
        village: TextChannel,
        night: TextChannel,
        werewolfPlace: TextChannel,
        category: CategoryChannel,
    } = <any>{};
    public messages: {
        instructions: Message,
    } = <any>{};
    public collectors: {
        joinLeave: InteractionCollector<ButtonInteraction>,
    } = <any>{};
    public owner: Player;
    public state: GameState;
    public players = new Collection<Snowflake, Player>();
    public readonly id: number;

    public constructor(master: WerewolfMaster, owner: GuildMember, id: number) {
        this.owner = this.addPlayer(owner);
        this.owner.isOwner = true;
        this.master = master;
        this.state = GameState.Lobby;
        this.id = id;
    }

    public addPlayer(member: GuildMember): Player {
        const player = new Player(this, member)
        this.players.set(player.id, player);
        this.channels.lobby?.permissionOverwrites?.create?.(
            member,
            {
                SEND_MESSAGES: true,
            }
        );
        this.messages.instructions?.edit?.(this.instructionMessage);
        return player;
    }

    public removePlayer(resolvable: PlayerResolvable) {
        const player = this.resolvePlayer(resolvable);
        if (!player) return;
        this.players.delete(player.id);
        this.channels.lobby.permissionOverwrites.delete(player.id);
        this.messages.instructions.edit(this.instructionMessage);
    }

    public resolvePlayer(resolvable: PlayerResolvable): Player | undefined {
        for (const player of this.players.values())
            if (player.isEqualTo(resolvable)) return player;
    }

    public async init() {
        await this.owner.member.guild.roles.fetch();
        const everyone = this.owner.member.guild.roles.everyone;

        const category: CategoryChannel = await this.owner.member.guild.channels.create(
            "Loup-Garou - " + this.owner.member.displayName,
            {
                type: 'GUILD_CATEGORY',
                permissionOverwrites: [
                    {
                        deny: "VIEW_CHANNEL",
                        type: "role",
                        id: everyone.id,
                    }
                ]
            },
        );

        this.channels = {
            category,
            lobby: await category.createChannel("lobby", {
                topic: ":warning: **Veuillez lire le message épinglé** :warning:",
                permissionOverwrites: [
                    {
                        allow: "VIEW_CHANNEL",
                        type: "role",
                        id: everyone.id,
                    },
                    {
                        deny: "SEND_MESSAGES",
                        type: "role",
                        id: everyone.id,
                    },
                    {
                        allow: "SEND_MESSAGES",
                        type: "member",
                        id: this.owner.id,
                    }
                ]
            }),
            village: await category.createChannel("village"),
            night: await category.createChannel("nuît"),
            werewolfPlace: await category.createChannel("antre-des-loups-garous"),
        }

        this.messages.instructions = await this.channels.lobby.send(this.instructionMessage);

        this.collectors.joinLeave = this.messages.instructions
            .createMessageComponentCollector({ componentType: "BUTTON" })
            .on("collect", async (interaction) => {
                const member = <GuildMember>interaction.member;
                if (interaction.customId == "join") {
                    if (!await this.tryJoin(member, interaction)) return;
                    await interaction.reply(`:inbox_tray: <@!${member.id}> a rejoint la partie !`);
                } else if (interaction.customId == "leave") {
                    if (!await this.tryLeave(member, interaction)) return;
                    await interaction.reply(`:outbox_tray: <@!${member.id}> a quitté la partie !`);
                }
            });

        this.channels.lobby.createMessageCollector(
            {
                filter(message) {
                    return message.type === "CHANNEL_PINNED_MESSAGE"
                },
                max: 1
            }
        ).on('collect', (message) => {
            message.delete();
        })

        await this.messages.instructions.pin();
    }

    async tryJoin(member: GuildMember, interaction: ButtonInteraction | CommandInteraction)
        : Promise<boolean> {
        const player = this.master.resolvePlayer(member);

        if (player) {
            await interaction.reply({
                content: "Vous êtes déjà dans une partie.",
                ephemeral: true,
            });
            return false;
        }

        this.addPlayer(member);
        return true;
    }

    async tryLeave(member: GuildMember, interaction: ButtonInteraction | CommandInteraction)
        : Promise<boolean> {
        const player = this.master.resolvePlayer(member);

        if (!player?.game.isEqualTo(player.game)) {
            await interaction.reply({
                content: "Vous n'êtes pas dans la partie.",
                ephemeral: true,
            })
            return false;
        }

        if (player?.isOwner) {
            await interaction.reply({
                content: "Vous ne pouvez pas quitter la partie en tant que gérant !\n" +
                    "Veuillez soit l'arrêter: `/game stop`, soit la transférer: `/game transfer player`",
                ephemeral: true,
            })
            return false;
        }

        this.removePlayer(member);
        return true;
    }

    cleanup() {
        for (const channel of Object.values(this.channels)) {
            channel.delete();
        }
    }

    isEqualTo(other: Game | number) {
        return this.id === (typeof other === "number" ? other : other.id);
    }

    public get instructionMessage(): MessageOptions {
        return {
            embeds: [
                new MessageEmbed()
                    .setAuthor(<EmbedAuthorData>{
                        name: "Développé par <Galitan#8839",
                        iconURL: "https://avatars.githubusercontent.com/u/62174230?v=4",
                        url: "https://github.com/galitan-dev",
                    })
                    .setTitle("Les Loups-garous de Thiercelieux")
                    .setColor("DARK_RED")
                    .setDescription("Dans “l’Est sauvage”, le petit hameau de Thiercelieux est depuis peu devenu la proie des Loups-Garous. Des meurtres sont commis chaque nuit par certains habitants du village, devenus Lycanthropes à cause d’un phénomène mystérieux (peut-être l’effet de serre ?)… Les Villageois doivent se ressaisir pour éradiquer ce nouveau fléau venu du fond des âges, avant que le hameau ne perde ses derniers habitants.")
                    .setThumbnail("https://www.regledujeu.fr/wp-content/uploads/loup-garou-1.png"),
                new MessageEmbed()
                    .setTitle("Comment jouer ?")
                    .setColor("DARK_RED")
                    .setDescription("Pour l'instant, vous pouvez juste attendre des joueurs.\nQuand vous voudrez commencer, le gérant de la partie (<@!" + this.owner.id + ">) pourra executer la commande `/game start` et **tous les joueurs ayant rejoint la partie seront ajoutés à la partie** qui débutera.\nEnsuite il vous suffira de suivre les instructions du meneur (c'est moi ^^) qui gérera les cycles et les nuît tout seul.\n**Bon jeu !**"),
                this.statusEmbed
                    .setTitle("Statut de la partie")
                    .setAuthor({ name: "" })
                    .setFooter({
                        text: "Partie de " + this.owner.member.displayName,
                        iconURL: this.owner.member.displayAvatarURL(),
                    }),
            ],
            components: [
                new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId('join')
                        .setLabel('Rejoindre la partie')
                        .setStyle("PRIMARY"),
                    new MessageButton()
                        .setCustomId('leave')
                        .setLabel('Quitter la partie')
                        .setStyle("DANGER"),
                )
            ]
        };
    }

    public get statusEmbed(): MessageEmbed {
        return new MessageEmbed()
            .setAuthor({
                name: "Partie de " + this.owner.member.displayName,
                iconURL: this.owner.member.displayAvatarURL()
            })
            .setColor("DARK_RED")
            .addField(
                "État:",
                ["En attente", "Au village", "Au lit", "Finie"][this.state],
                true
            ).addField(
                "Joueurs [" + this.players.size + "]:",
                this.players
                    .map((p) => "<@!" + p.id + ">")
                    .join("\n"),
                true
            ).addField(
                "Lobby:",
                "<#" + this.channels.lobby + ">",
                true
            );
    }

}

export enum GameState {
    Lobby,
    Village,
    Night,
    Ended,
}