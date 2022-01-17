"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const architect_1 = require("@angular-devkit/architect");
const yargs = require("yargs");
const helpers = require("yargs/helpers");
const argv = yargs(helpers.hideBin(process.argv)).argv;
const NgcEsbuild = require('ngc-esbuild');
const defaultOptions = {
    main: "src/main.ts",
    outputPath: "dist/angular-observables-http",
    index: "src/index.html",
    tsConfig: "tsconfig.app.json",
    inlineStyleLanguage: "scss",
};
exports.default = (0, architect_1.createBuilder)((options, context) => {
    return new Promise((resolve, reject) => {
        // console.log('OPTIONS: ', options);
        options = Object.assign(Object.assign({}, defaultOptions), options);
        // console.log('ARGV: ', argv);
        const builder = new NgcEsbuild({
            main: options.main,
            outpath: options.outputPath,
            minify: Boolean(options.outputHashing),
            open: true,
            port: 4200,
            sourcemap: true,
            serve: true,
            watch: true,
        });
        context.reportStatus(`Started.`);
    });
});
