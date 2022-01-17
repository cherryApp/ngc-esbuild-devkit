"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const architect_1 = require("@angular-devkit/architect");
const yargs_1 = __importDefault(require("yargs/yargs"));
const helpers_1 = __importDefault(require("yargs/helpers"));
const argv = (0, yargs_1.default)(helpers_1.default.hideBin(process.argv)).argv;
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
            minify: Boolean(options.outputHashing),
            open: false,
            outpath: options.outputPath,
            serve: false,
            sourcemap: false,
            watch: false,
        }).resolve.then((result) => {
            console.log(`Build has been finished: ${options.outputPath}`);
        });
        context.reportStatus(`Started.`);
    });
});
