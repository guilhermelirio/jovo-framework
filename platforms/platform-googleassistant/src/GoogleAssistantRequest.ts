import { EntityMap, JovoRequest, JovoRequestType, JovoSession } from '@jovotech/framework';
import type { Device, Home, Scene, Session, User } from '@jovotech/output-googleassistant';
import { Context, Handler, Intent } from './interfaces';

export class GoogleAssistantRequest extends JovoRequest {
  handler?: Handler;
  intent?: Intent;
  scene?: Scene;
  session?: Session;
  user?: User;
  home?: Home;
  device?: Device;
  context?: Context;

  getEntities(): EntityMap | undefined {
    // TODO: implement
    return undefined;
  }

  getIntentName(): string | undefined {
    return this.intent?.name;
  }

  getLocale(): string | undefined {
    return this.user?.locale;
  }

  getRawText(): string | undefined {
    return this.intent?.query;
  }

  getRequestType(): JovoRequestType | undefined {
    // TODO: implement
    return undefined;
  }

  getSession(): JovoSession | undefined {
    return (this.session as { params?: JovoSession | undefined } | undefined)?.params;
  }
}