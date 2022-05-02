import { REST } from '@discordjs/rest';
import { log } from 'console';
import { Routes } from 'discord-api-types/v9';
import { Client, IntentsString } from 'discord.js';
import EventEmitter from 'events';
import Command from './command';

export default class BotBuilder {

    private token?: string;
    private applicationId?: string;
    private commands: Command[] = [];
    private intents: IntentsString[] = ['GUILD_MEMBERS'];

    public config(config: Config): this {
        this.token = config.token;
        this.applicationId = config.applicationId;
        return this;
    }

    public addCommand(command: Command): this {
        this.commands.push(command);
        return this;
    }

    public addIntent(intent: IntentsString): this {
        this.intents.push(intent);
        return this;
    }

    public build(): Bot {
        const rest = new REST({ version: '9' }).setToken(this.token!),
            client = new Client({ intents: this.intents }),
            bot = new Bot(
                this.commands,
                rest,
                client
            );

        rest.put(Routes.applicationCommands(
            this.applicationId!
        ), {
            body: this.commands.map(c => c.definition.toJSON())
        })
            .then(() => log('Successfully registered application commands.'))
            .catch(console.error);

        client.login(this.token);
        bot.listen();

        return bot;
    }

}

export class Bot extends EventEmitter {

    private rest: REST;
    private commands: Command[];

    public client: Client;

    constructor(commands: Command[], rest: REST, client: Client) {
        super()
        this.commands = commands;
        this.rest = rest
        this.client = client;
    }

    public listen(): void {
        this.client.on('ready', () => log("The bot is ready !"));

        this.client.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return;
            const command = this.commands.find(c => c.name === interaction.commandName);

            if (!command) interaction.reply("This command is obsolete");
            else command.run(this, interaction);
        });
    }
}

declare interface Config {
    token: string;
    applicationId: string;
}
