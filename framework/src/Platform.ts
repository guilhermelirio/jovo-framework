import { JovoResponse, OutputTemplateConverterStrategy } from '@jovotech/output';
import _merge from 'lodash.merge';
import {
  AnyObject,
  App,
  APP_MIDDLEWARES,
  AppMiddlewares,
  Constructor,
  HandleRequest,
  InvalidParentError,
  Jovo,
  JovoConstructor,
  JovoUser,
} from '.';
import { Extensible, ExtensibleConfig } from './Extensible';
import { JovoDevice, JovoDeviceConstructor } from './JovoDevice';
import { JovoRequest } from './JovoRequest';
import { JovoUserConstructor } from './JovoUser';
import { MiddlewareCollection } from './MiddlewareCollection';

export type PlatformMiddlewares = AppMiddlewares;

export abstract class Platform<
  REQUEST extends JovoRequest = JovoRequest,
  RESPONSE extends JovoResponse = JovoResponse,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  JOVO extends Jovo<REQUEST, RESPONSE, JOVO, USER, DEVICE, PLATFORM> = any,
  USER extends JovoUser<JOVO> = JovoUser<JOVO>,
  DEVICE extends JovoDevice<JOVO> = JovoDevice<JOVO>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PLATFORM extends Platform<REQUEST, RESPONSE, JOVO, USER, DEVICE, PLATFORM, CONFIG> = any,
  CONFIG extends ExtensibleConfig = ExtensibleConfig,
> extends Extensible<CONFIG, PlatformMiddlewares> {
  abstract readonly requestClass: Constructor<REQUEST>;
  abstract readonly jovoClass: JovoConstructor<REQUEST, RESPONSE, JOVO, USER, DEVICE, PLATFORM>;
  abstract readonly userClass: JovoUserConstructor<JOVO>;
  abstract readonly deviceClass: JovoDeviceConstructor<JOVO>;

  abstract outputTemplateConverterStrategy: OutputTemplateConverterStrategy<RESPONSE>;

  abstract isRequestRelated(request: REQUEST | AnyObject): boolean;

  abstract isResponseRelated(response: RESPONSE | AnyObject): boolean;
  abstract finalizeResponse(
    response: RESPONSE | RESPONSE[],
    jovo: JOVO,
  ): RESPONSE | RESPONSE[] | Promise<RESPONSE> | Promise<RESPONSE[]>;

  initializeMiddlewareCollection(): MiddlewareCollection<PlatformMiddlewares> {
    return new MiddlewareCollection<PlatformMiddlewares>(...APP_MIDDLEWARES);
  }

  install(parent: Extensible): void {
    if (!(parent instanceof App)) {
      throw new InvalidParentError(this.constructor.name, App);
    }

    // propagate runs of middlewares of parent to middlewares of this
    this.middlewareCollection.names.forEach((middlewareName) => {
      parent.middlewareCollection.use(middlewareName, async (jovo) => {
        if (jovo.$platform?.constructor?.name !== this.constructor.name) {
          return;
        }
        return this.middlewareCollection.run(middlewareName, jovo);
      });
    });
  }

  createJovoInstance<APP extends App>(app: APP, handleRequest: HandleRequest): JOVO {
    return new this.jovoClass(app, handleRequest, this as unknown as PLATFORM);
  }

  createRequestInstance(request: REQUEST | AnyObject): REQUEST {
    const instance = new this.requestClass();
    _merge(instance, request);
    return instance;
  }

  createUserInstance(jovo: JOVO): USER {
    return new this.userClass(jovo);
  }
  createDeviceInstance(jovo: JOVO): DEVICE {
    return new this.deviceClass(jovo);
  }
}
