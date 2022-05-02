import CleanCommand from "./commands/clean";
import GameCreateCommand from "./commands/game/create";
import GameJoinCommand from "./commands/game/join";
import GameKickCommand from "./commands/game/kick";
import GameLeaveCommand from "./commands/game/leave";
import GameListCommand from "./commands/game/list";
import GameStartCommand from "./commands/game/start";
import GamePlayersCommand from "./commands/game/status";
import GameStopCommand from "./commands/game/stop";
import GameTransferCommand from "./commands/game/transfer";
import PingCommand from "./commands/ping";
import Bot from "./discord/bot";
import { GroupCommand } from "./discord/command";
import config from "./res/config.json";
import WerewolfMaster from "./werewolf";

process.stdin.resume();

const master = new WerewolfMaster();

new Bot()
    .config(config)
    .addCommand(new PingCommand())
    .addCommand(new CleanCommand())
    .addCommand(new GroupCommand("game", "Permet de gérer les parties", [
        new GameCreateCommand(master),
        new GameListCommand(master),
        new GameJoinCommand(master),
        new GameLeaveCommand(master),
        new GamePlayersCommand(master),
        new GameTransferCommand(master),
        new GameKickCommand(master),
        new GameStopCommand(master),
        new GameStartCommand(master)
    ]))
    .addIntent('GUILD_VOICE_STATES')
    .addIntent('GUILD_MESSAGES')
    .build();

