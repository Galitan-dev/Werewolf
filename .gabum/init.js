const { spawn } = require('child_process');
const { writeFileSync, readFileSync } = require('fs');
const PATH = require('path');

/**
 * @param {object} infos
 * @param {string} infos.name
 * @param {string} infos.author
 * @param {string} infos.description
 * @param {boolean} infos.private
 * @param {string} infos.type
 * @param {string} infos.language
 * @param {object} infos.license
 * @param {string} infos.license.id
 * @param {string} infos.license.name
 * @param {string} path
 * @returns {Listr}
 */
module.exports = function (infos, path, { Listr, Observable, ProgressBar, request, zip, shell }) {
    /** @type {license} */
    let licenseModel, license, templateArchive;

    return new Listr(
        [
            {
                title: 'Editing package.json',
                task() {
                    const packageTemplate = readFileSync(
                        PATH.join(path, 'package.json'),
                        'utf-8'
                    );
                    const package = packageTemplate
                        .replace(/--author--/g, infos.author)
                        .replace(/--project--/g, infos.name)
                        .replace(/--description--/g, infos.description)
                        .replace(/--license--/g, infos.license.spdx)
                        .replace(/--private--/g, infos.private);

                    writeFileSync(
                        PATH.join(path, 'package.json'),
                        package,
                        'utf-8'
                    );
                },
            },
            {
                title: 'Installing project',
                task: () =>
                    new Observable((observer) => {
                        spawn('yarn', { cwd: path })
                            .on('message', (msg) => observer.next(msg))
                            .on('error', (msg) => observer.error(msg))
                            .on('close', (code) =>
                                code !== 0
                                    ? observer.error(`Exited with code ${code}`)
                                    : observer.complete()
                            )
                            .on('exit', (code) =>
                                code !== 0
                                    ? observer.error(`Exited with code ${code}`)
                                    : observer.complete()
                            );
                    }),
            },
        ],
        {
            rendererOptions: {
                collapse: false,
            },
        }
    );
};

/**
 * @typedef license
 * @type {object}
 * @property {string} key
 * @property {string} name
 * @property {string} spdx_id
 * @property {string} node_id
 * @property {string} html_url
 * @property {string} description
 * @property {string} implementation
 * @property {string[]} permissions
 * @property {string[]} conditions
 * @property {string[]} limitations
 * @property {string} body
 * @property {boolean} featured
 */
