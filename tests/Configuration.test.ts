import Configuration from '../index';

describe('Configuration', () => {

    const getData = () => ({
        a: {
            b: {
                c: 500,
            },
        },
    });

    const getEnv = () => ({
        acme: {
            a: {
                b: {
                    c: 600,
                },
            },
        },
    });

    test('instance without arguments', () => {
        expect(() => {
            new Configuration();
        }).not.toThrow();
    });

    test('get without commit', () => {
        const configuration = new Configuration(getData());
        expect(() => {
            configuration.get();
        }).toThrowError('Configuration is not committed yet, call commit() first!');
    });

    test('check if configuration committed', () => {
        const configuration = new Configuration(getData());
        configuration.commit();
        expect(configuration.isCommitted()).toEqual(true);
    });

    test('set data', () => {
        const configuration = new Configuration(getData());
        configuration.commit();
        expect(configuration.get()).toEqual(getData());
    });

    test('disallow merge after commit', () => {
        const configuration = new Configuration(getData());
        configuration.commit();
        expect(() => {
            configuration.merge({});
        }).toThrowError('Unable to merge. Configuration is already committed.');
    });

    test('merge only valid', () => {
        const configuration = new Configuration(getData());
        expect(() => {
            configuration.merge(new Object(500));
        }).toThrowError('Configuration must be a plain object');
    });

    test('merge', () => {
        const configuration = new Configuration(getData());
        configuration.merge({
            a: {b: {c1: 550}}
        }).commit();
        expect(configuration.get()).toEqual({a: {b: {c: 500, c1: 550}}});
    });

    test('get existing', () => {
        const configuration = new Configuration(getData());
        configuration.commit();
        expect(configuration.get('a.b.c')).toEqual(500);
    });

    test('get existing, custom separator', () => {
        const configuration = new Configuration(getData(), {
            pathSeparator: '~',
        });
        configuration.commit();
        expect(configuration.get('a~b~c')).toEqual(500);
    });

    test('get non-existing, strict', () => {
        const configuration = new Configuration(getData());
        configuration.commit();
        expect(() => configuration.get('a.b.cx'))
            .toThrowError('Non-existent configuration path "a.b.cx"');
    });

    test('get non-existing, loose', () => {
        const configuration = new Configuration(getData(), {strict: false});
        configuration.commit();
        expect(configuration.get('a.b.cx')).toEqual(undefined);
    });

    test('get non-existing, with default', () => {
        const configuration = new Configuration(getData(), {strict: false});
        configuration.commit();
        expect(configuration.get('a.b.cx', 'def')).toEqual('def');
    });


    test('environment namespace', () => {
        const configuration = new Configuration(getData(), {
            environment: getEnv(),
            envNamespace: 'acme',
        });
        configuration.commit();
        expect(configuration.getEnv('a.b.c')).toEqual(600);
    });


    test('getEnv existing', () => {
        const configuration = new Configuration(getData(), {
            environment: getEnv(),
            envNamespace: 'acme',
        });
        configuration.commit();
        expect(configuration.getEnv('a.b.c')).toEqual(600);
    });

    test('getEnv non-existing, strict', () => {
        const configuration = new Configuration(getData(), {
            environment: getEnv(),
            envNamespace: 'acme',
        });
        configuration.commit();
        expect(() => configuration.getEnv('a.b.cx'))
            .toThrowError('Non-existent environment path "acme.a.b.cx"');
    });

    test('getEnv non-existing, loose', () => {
        const configuration = new Configuration(getData(), {
            environment: getEnv(),
            envNamespace: 'acme',
            strictEnv: false
        });
        configuration.commit();
        expect(configuration.getEnv('a.b.cx')).toEqual(undefined);
    });

    test('getEnv non-existing, with default', () => {
        const configuration = new Configuration(getData(), {
            environment: getEnv(),
            envNamespace: 'acme',
            strictEnv: false
        });
        configuration.commit();
        expect(configuration.getEnv('a.b.cx', 'def')).toEqual('def');
    });
});

