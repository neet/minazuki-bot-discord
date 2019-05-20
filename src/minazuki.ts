import * as Discord from 'discord.js';
import { config } from './config';
import { haiku, tanka } from './features/haiku';
import { controlVoiceConnections, voiceChat } from './features/voice-chat';
import { fuzzySearchWikipedia, searchWikipedia } from './features/wikipedia';
import { Wikipedia } from './libs/_wikipedia';
import { MiddlewareManager } from './libs/middleware-manager';
import { TravisCI } from './libs/travis-ci';
import { VoiceText } from './libs/voice-text';

export class Minazuki {
  private middlewares = new MiddlewareManager(this);

  public client = new Discord.Client();
  public travisCI = new TravisCI(this);
  public voiceText = new VoiceText(config.voiceTextToken);
  public wikipedia = new Wikipedia();

  /** Map of cannelId and voice conenction */
  public voiceConnections = new Map<string, Discord.VoiceConnection>();

  constructor() {
    this.client.login(config.discordToken);

    this.client.on('ready', this.onReady);
    this.client.on('message', this.onMessage);

    this.middlewares.use(searchWikipedia);
    this.middlewares.use(fuzzySearchWikipedia);
    this.middlewares.use(controlVoiceConnections);
    this.middlewares.use(voiceChat);
    this.middlewares.use(tanka);
    this.middlewares.use(haiku);
  }

  protected onReady = () => {
    if (this.client.user) {
      // tslint:disable-next-line no-console
      console.log(`Logged in as ${this.client.user.tag}!`);
    }

    this.travisCI.watchBuildStatus();
  };

  protected onMessage = (message: Discord.Message) => {
    this.middlewares.handle(message);
  };
}
