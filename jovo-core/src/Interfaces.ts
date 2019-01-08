import {
    SpeechBuilder,
    TestSuite, RequestBuilder, ResponseBuilder,
    ExtensibleConfig,
    Jovo,
} from './index';


import {BaseApp} from "./BaseApp";


export interface Data {
    [key: string]: any; // tslint:disable-line
}

export interface JovoData extends Data {}
export interface AppData extends Data {}
export interface SessionData extends Data {}


export interface Plugin {
    /**
     * Default name is plugin's class name
     */
    name?: string;

    /**
     * Config of plugin
     */
    config?: PluginConfig;


    /**
     * Is called after parent.use(new Plugin());
     * @param {object} parent
     */
    install(parent: object): void;

    /**
     * Is called when the parent object tries to uninstall the plugin
     * @param parent
     */
    uninstall(parent?: any): void; // tslint:disable-line
}

export interface PluginConfig {
    enabled?: boolean;
}


/**
 * Passed to all middleware functions
 */
export interface HandleRequest {

    /**
     * Current app instance
     */
    app: BaseApp;

    /**
     * Current host instance
     */
    host: Host;

    /**
     * Current jovo instance
     *
     * First initialization happens in 'platform.init' middleware
     */
    jovo?: Jovo;

    /**
     * Error
     */
    error?: Error;



    platformClazz?: any; // tslint:disable-line
}

// specialized plugins
export interface Db extends Plugin {
    needsWriteFileAccess: boolean;
    save(primaryKey: string, key: string, data: any): Promise<any>; // tslint:disable-line
    load(primaryKey: string): Promise<any>; // tslint:disable-line
    delete(primaryKey: string): Promise<any>; // tslint:disable-line
}

export interface Platform extends Plugin {
    requestBuilder: RequestBuilder;
    responseBuilder: ResponseBuilder;
    makeTestSuite(): TestSuite;
}

export interface PlatformConfig extends ExtensibleConfig, PluginConfig {

}


export interface Analytics extends Plugin {
    /**
     * Tracking method
     * @param {HandleRequest} handleRequest
     */
    track(handleRequest: HandleRequest): void;
}


// export interface AppConfig extends ExtensibleConfig {
//     // logging?: boolean;
//     intentMap?: {[key: string]: string};
//     inputMap?: {[key: string]: string};
// }

export interface RequestType {
    type?: string;
    subType?: string;
}

export interface Output {
    tell?: {
        speech: string | SpeechBuilder;
    };

    ask?: {
        speech: string | SpeechBuilder;
        reprompt: string | SpeechBuilder | string[];
    };

    card?: {
        SimpleCard?: {
            title: string;
            content: string;
        }
        ImageCard?: {
            title: string;
            content: string;
            imageUrl: string;
        }
        AccountLinkingCard?: object;
    };
}

export interface JovoRequest {
    /**
     * Converts object to json
     * @return {any}
     */
    toJSON(): any; // tslint:disable-line


    /**
     * Returns user id
     * @return {string}
     */
    getUserId(): string;


    /**
     * Returns access token
     * @return {string}
     */
    getAccessToken(): string | undefined;


    /**
     * Returns locale
     * @return {String}
     */
    getLocale(): string;

    /**
     * Returns true if session is new
     * @return {boolean}
     */
    isNewSession(): boolean;


    /**
     * Returns timestamp
     * @return {string}
     */
    getTimestamp(): string;


    /**
     * Returns true if device has an audio interface
     * @return {boolean}
     */
    hasAudioInterface(): boolean;

    /**
     * Returns true if device has a screen interface
     * @return {boolean}
     */
    hasScreenInterface(): boolean;


    /**
     * Returns true if device has a video interface
     * @return {boolean}
     */
    hasVideoInterface(): boolean;


    /**
     * Returns session data
     * @return {SessionData}
     */
    getSessionAttributes(): SessionData;


    /**
     * Adds session attribute
     * @param {string} key
     * @param value
     * @return {this}
     */
    addSessionAttribute(key: string, value: any): this; // tslint:disable-line


    /**
     * Returns session data
     * @return {SessionData}
     */
    getSessionData(): SessionData;


    /**
     * Adds session attribute
     * @param {string} key
     * @param value
     * @return {this}
     */
    addSessionData(key: string, value: any): this; // tslint:disable-line


    /**
     * Sets Timestamp
     * @param {string} timestamp
     * @return {this}
     */
    setTimestamp(timestamp: string): this;


    /**
     * Sets locale
     * @param {string} locale
     * @return {this}
     */
    setLocale(locale: string): this;

    /**
     * Sets user id
     * @param {string} userId
     * @return {this}
     */
    setUserId(userId: string): this;


    /**
     * Sets access token
     * @param {string} accessToken
     * @return {this}
     */
    setAccessToken(accessToken: string): this;

    /**
     * Sets new session
     * @param {boolean} isNew
     * @return {this}
     */
    setNewSession(isNew: boolean): this;


    /**
     * Sets audio interface capability
     * @return {this}
     */
    setAudioInterface(): this;


    /**
     * Sets screen interface capability
     * @return {this}
     */
    setScreenInterface(): this;


    /**
     * Sets video interface capability
     * @return {this}
     */
    setVideoInterface(): this;


    /**
     * Sets full session data object
     * @param {SessionData} attributes
     * @return {this}
     */
    setSessionAttributes(attributes: SessionData): this;


    /**
     * Sets full session data object
     * @param {SessionData} sessionData
     * @return {this}
     */
    setSessionData(sessionData: SessionData): this;


    /**
     * Sets state to session data
     * @param {string} state
     * @return {this}
     */
    setState(state: string): this;


    /**
     * Returns intent name
     * @return {string | undefined}
     */
    getIntentName(): string | undefined;


    /**
     * Sets intent name
     * @param {string} intentName
     * @returns {this}
     */
    setIntentName(intentName: string): this;

    /**
     * Returns inputs
     * @return {Inputs}
     */
    getInputs(): Inputs;


    /**
     * Adds input to inputs
     * @param {string} key
     * @param {string} value
     * @return {this}
     */
    addInput(key: string, value: string): this;


    /**
     * Returns state from request
     * @return {string | undefined}
     */
    getState(): string | undefined;


    /**
     * Sets inputs
     * @param {Inputs} inputs
     */
    setInputs(inputs: Inputs): this;
}

export interface Input {
    name?: string;
    key?: string;
    value?: any; // tslint:disable-line
    id?: string;
}

export interface Inputs {
    [key: string]: Input;
}

export interface SessionAttributes {
    [key: string]: any; // tslint:disable-line
}

export interface JovoResponse {

    /**
     * Returns speech text without leading <speak> and trailing </speak> tags
     * @return {string | undefined}
     */
    getSpeech(): string | undefined;


    /**
     * Returns reprompt text without leading <speak> and trailing </speak> tags
     * @return {string | undefined}
     */
    getReprompt(): string | undefined;


    /**
     * Returns session data
     * @return {SessionData | undefined}
     */
    getSessionAttributes(): SessionData | undefined;


    /**
     * Sets session data objects
     * @param {SessionData} sessionAttributes
     * @return {JovoResponse}
     */
    setSessionAttributes(sessionAttributes: SessionData): this;


    /**
     * Returns session data
     * @return {SessionData | undefined}
     */
    getSessionData(): SessionData | undefined;


    /**
     * Sets session data objects
     * @param {SessionData} sessionData
     * @return {JovoResponse}
     */
    setSessionData(sessionData: SessionData): this;


    /**
     * Checks if response has tell in it
     * @param {string | string[]} speechText
     * @return {boolean}
     */
    isTell(speechText?: string | string[]): boolean;


    /**
     * Checks if response has ask in it
     * @param {string | string[]} speechText
     * @param {string | string[]} repromptText
     * @return {boolean}
     */
    isAsk(speechText?: string | string[], repromptText?: string | string[]): boolean;


    /**
     * Checks if response has state in it
     * @param {string} state
     * @return {boolean | undefined}
     */
    hasState(state: string): boolean | undefined;


    /**
     * Checks if response has a specific session attribute in it
     * @param {string} name
     * @param value
     * @return {boolean}
     */
    hasSessionAttribute(name: string, value?: any): boolean; // tslint:disable-line


    /**
     * Checks if response has a specific session attribute in it
     * @param {string} name
     * @param value
     * @return {boolean}
     */
    hasSessionData(name: string, value?: any): boolean; // tslint:disable-line


    /**
     * Checks if session ended
     * @return {boolean}
     */
    hasSessionEnded(): boolean;
}

export interface JovoSession {
    $data: SessionData;
}

export interface Host {
    /**
     * Defines file write access
     *
     * Eg. Lambda doesn't have file write access, ExpressJS usually does
     */
    hasWriteFileAccess: boolean;


    /**
     * Headers of the request
     */
    headers: {[key: string]: string};

    /**
     * Full request object
     */
    $request: any; // tslint:disable-line

    /**
     * Full request object
     * @returns {any}
     */
    getRequestObject(): any; // tslint:disable-line


    /**
     * Sets response object
     * @param obj
     * @returns {Promise<any>}
     */
    setResponse(obj: any): Promise<any>; // tslint:disable-line
}

export interface NLUData {
    intent?: {
        name: string;
    };
    // TODO
    inputs?: Map<string, any>; // tslint:disable-line
}


export type HandlerReturnType = Function | Promise<Function> | Promise<Jovo> | Promise<void> | void;
export type JovoFunction = (this: Jovo, jovo?: Jovo, done?: Function) => HandlerReturnType;


export interface Handler {
    [key: string]: JovoFunction | Handler | Function;
}
