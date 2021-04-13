import { Plugin, HandleRequest, JovoError, ErrorCode, EnumRequestType } from 'jovo-core';
import { Lex } from '../Lex';
import { LexBot } from '../core/LexBot';
import { LexRequest } from '../core/LexRequest';
import { LexResponse } from '../core/LexResponse';
import { LexUser } from '../core/LexUser';
import { LexSpeechBuilder } from '../core/LexSpeechBuilder';
import _set = require('lodash.set');

export class LexCore implements Plugin {
  install(lex: Lex) {
    lex.middleware('$init')!.use(this.init.bind(this));
    lex.middleware('$request')!.use(this.request.bind(this));
    lex.middleware('$type')!.use(this.type.bind(this));
    lex.middleware('$session')!.use(this.session.bind(this));
    lex.middleware('$output')!.use(this.output.bind(this));
  }

  uninstall(lex: Lex) {}

  async init(handleRequest: HandleRequest) {
    const requestObject = handleRequest.host.getRequestObject();
    if (
      requestObject.userId &&
      requestObject.sessionAttributes &&
      requestObject.bot &&
      requestObject.currentIntent
    ) {
      handleRequest.jovo = new LexBot(handleRequest.app, handleRequest.host, handleRequest);
    }
  }

  async request(lex: LexBot) {
    if (!lex.$host) {
      throw new JovoError(
        "Couldn't access $host object",
        ErrorCode.ERR_PLUGIN,
        'jovo-platform-lex',
        'The $host object is necessary to initialize both $request and $user',
      );
    }

    lex.$request = LexRequest.fromJSON(lex.$host.getRequestObject()) as LexRequest;
    lex.$user = new LexUser(lex);
  }

  async type(lex: LexBot) {
    const lexRequest = lex.$request as LexRequest;

    if (lexRequest.getIntentName() === 'greeting') {
      // intent by default in every project that has "hello" etc. as utterance
      lex.$type = {
        type: EnumRequestType.LAUNCH,
      };
    } else if (lexRequest.getIntentName() === 'goodbye') {
      lex.$type = {
        type: EnumRequestType.END,
      };
    } else {
      lex.$type = {
        type: EnumRequestType.INTENT,
      };
    }
  }

  async session(lex: LexBot) {
    const lexRequest = lex.$request as LexRequest;
    lex.$requestSessionAttributes = lexRequest.getSessionData();
    if (!lex.$session) {
      lex.$session = { $data: {} };
    }
    lex.$session.$data = lexRequest.getSessionData();
  }

  async output(lex: LexBot) {
    const output = lex.$output;
    const response = lex.$response as LexResponse;
    if (Object.keys(output).length === 0) {
      return;
    }
    const tell = output.tell;
    if (tell) {
      _set(response, 'dialogAction', {
        type: 'Close',
        fulfillmentState: 'PlainText',
        message: {
          contentType: 'SSML',
          content: tell.speech,
        },
      });
    }
    const ask = output.ask;
    if (ask) {
      _set(response, 'dialogAction', {
        type: 'ElicitIntent',
        message: {
          contentType: 'PlainText',
          content: ask.speech,
        },
      });
      _set(response, 'sessionAttributes', lex.$session.$data);
    }
  }
}
