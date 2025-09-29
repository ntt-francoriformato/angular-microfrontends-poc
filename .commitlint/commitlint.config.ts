import { UserConfig } from '@commitlint/types';

const config: UserConfig = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'scope-enum': async () => {
            const scopes = [
                // Frontend Apps
                'fe',
            ];
            return [2, 'always', scopes];
        },
    },
};

export default config;