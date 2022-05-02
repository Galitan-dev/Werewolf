import { Collection, GuildMember } from "discord.js";
import Game from "./game";
import Player, { PlayerResolvable } from "./player";

export default class WerewolfMaster {

    public games = new Collection<number, Game>();

    public newGame(owner: GuildMember) {
        let id: number;
        do id = Math.floor(Math.random() * 1000);
        while (this.games.some((game) => game.id === id));

        const game = new Game(this, owner, id);
        this.games.set(id, game);
        return game;
    }

    public cleanup() {
        for (const game of this.games.values()) {
            game.cleanup();
        }
    }

    public resolvePlayer(resolvable: PlayerResolvable): Player | undefined {
        for (const game of this.games.values()) for (const player of game.players.values())
            if (player.isEqualTo(resolvable)) return player;
    }

}

