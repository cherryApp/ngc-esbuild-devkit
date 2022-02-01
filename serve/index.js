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
        // console.log('CONTEXT.BUILDER: ', context.builder);
        // console.log('OPTIONS: ', options);
        // options = {...defaultOptions, ...options};
        // console.log('ARGV: ', argv);
        var _a;
        new NgcEsbuild({
            bundle: true,
            entryPoints: [options.main],
            minify: false,
            // open: options.liveReload !== false,
            open: true,
            outpath: options.outputPath,
            port: options.port || 4200,
            serve: true,
            sourcemap: true,
            watch: true,
            format: 'esm',
            project: ((_a = options.browserTarget) === null || _a === void 0 ? void 0 : _a.split(':')[0]) || '',
        });
        context.reportStatus(`Started.`);
    });
});
