import { objectMerge, isPlainObject, objectPath, objectDeepFreeze } from '@tolkam/lib-utils';

const fakeDef = Math.random();

class Configuration {

    /**
     * @type {object}
     */
    private readonly data: object;

    /**
     * @type {IOptions}
     */
    private readonly options: IOptions = {
        pathSeparator: '.',
        strict: true,
        environment: {},
        envNamespace: '',
        strictEnv: true,
    };

    /**
     * @param data
     * @param options
     */
    public constructor(data?: object, options?: Partial<IOptions>) {
        this.data = Object.create(null);

        if(data) {
            this.merge(data);
        }

        this.options = {...this.options, ...options};
    }

    /**
     * Merges new configuration into current one
     *
     * @param data
     *
     * @returns {this}
     */
    public merge(data: object): this {
        let error;

        if(this.isCommitted()) {
            error = 'Unable to merge. Configuration is already committed.';
        } else if(!isPlainObject(data)) {
            error = 'Configuration must be a plain object';
        }

        if(error) {
            throw new Error(error);
        }

        objectMerge(this.data, data);

        return this;
    }

    /**
     * Commits the configuration
     *
     * @returns {this}
     */
    public commit(): this {
        if(!this.isCommitted()) {
            objectDeepFreeze(this.data);
        }

        return this;
    }

    /**
     * Checks if configuration committed
     *
     * @returns {boolean}
     */
    public isCommitted(): boolean {
        return Object.isFrozen(this.data);
    }

    /**
     * Gets value by path
     *
     * @param path
     * @param def
     *
     * @returns {unknown}
     */
    public get(path?: string, def?: unknown): unknown {
        const that = this;
        const { data, options } = that;
        const { strict } = options;

        if(!that.isCommitted()) {
            throw new Error('Configuration is not committed yet, call commit() first!');
        }

        def = strict ? fakeDef : def;
        const found = path != null
            ? objectPath(data, path, def, that.options.pathSeparator)
            : data;

        if(strict && found === def) {
            throw new Error(`Non-existent configuration path "${path}"`);
        }

        return found;
    }

    /**
     * Gets environment value
     *
     * @param path
     * @param def
     *
     * @returns {unknown}
     */
    public getEnv(path: string, def?: unknown): unknown {
        const { environment, envNamespace, strictEnv, pathSeparator } = this.options;
        const fullPath = envNamespace ? envNamespace + pathSeparator + path : path;

        def = strictEnv ? fakeDef : def;
        const found = path != null
            ? objectPath(environment, fullPath, def, pathSeparator)
            : environment;

        if(strictEnv && found === def) {
            throw new Error(`Non-existent environment path "${fullPath}"`);
        }

        return found;
    }
}

interface IOptions {
    // string to use as path separator
    pathSeparator: string;

    // environment to search with
    environment: object;

    // environment namespace path (eg. 'acme.myConfig')
    envNamespace: string;

    // throw on non-existing config paths
    strict: boolean;

    // throw on non-existing environment paths
    strictEnv: boolean;
}

export default Configuration;
export { IOptions }