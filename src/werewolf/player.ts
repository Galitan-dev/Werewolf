import { GuildMember, Snowflake } from "discord.js";
import Game from "./game";

export default class Player {

    public game: Game;
    public member: GuildMember;
    public isOwner = false;

    constructor(game: Game, member: GuildMember) {
        this.game = game;
        this.member = member;
    }

    get id(): Snowflake {
        return this.member.id;
    }

    isEqualTo(other: PlayerResolvable) {
        return this.id === (typeof other === "string" ? other : other.id)
    }

}

export type PlayerResolvable = Player | GuildMember | Snowflake;