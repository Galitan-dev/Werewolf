import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import WerewolfMaster from '../werewolf';
import { Bot } from './bot';

export default abstract class Command {

    public abstract definition: SlashCommandBuilder
    public abstract run(bot: Bot, interaction: CommandInteraction): Promise<void> | void;

    public get name(): string {
        return this.definition.name;
    }

}

export abstract class SubCommand {
    public abstract definition: SlashCommandSubcommandBuilder;
    public abstract run(bot: Bot, interaction: CommandInteraction): Promise<void> | void;

    public get name(): string {
        return this.definition.name;
    }
}

export abstract class WerewolfCommand extends SubCommand {

    protected readonly master: WerewolfMaster;

    constructor(master: WerewolfMaster) {
        super();
        this.master = master;
    }

}

export class GroupCommand extends Command {

    public commands: SubCommand[];
    public definition = new SlashCommandBuilder();

    constructor(name: string, description: string, commands: SubCommand[]) {
        super();
        this.commands = commands;
        this.definition
            .setName(name)
            .setDescription(description);
        for (const command of this.commands) {
            this.definition.addSubcommand(command.definition)
        }
    }

    public run(bot: Bot, interaction: CommandInteraction) {
        for (const command of this.commands) {
            if (interaction.options.getSubcommand() !== command.name) continue;
            return command.run(bot, interaction);
        }
    }

}
