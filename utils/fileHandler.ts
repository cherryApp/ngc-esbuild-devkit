
import { promises as fsp } from 'fs';
import { join } from 'path';

export const getAngularOptions = async () => {
    return await fsp.readFile(
        join(process.cwd(), 'angular.json'),
        'utf8'
    ).then(source => JSON.parse(source));
};
