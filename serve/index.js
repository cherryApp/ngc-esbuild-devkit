"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const architect_1 = require("@angular-devkit/architect");
const yargs_1 = __importDefault(require("yargs/yargs"));
const helpers_1 = __importDefault(require("yargs/helpers"));
const fileHandler_1 = require("../utils/fileHandler");
const argv = (0, yargs_1.default)(helpers_1.default.hideBin(process.argv)).argv;
const NgcEsbuild = require('ngc-esbuild');
const defaultOptions = {
    main: "src/main.ts",
    outputPath: "dist/angular-observables-http",
    index: "src/index.html",
    tsConfig: "tsconfig.app.json",
    inlineStyleLanguage: "scss",
    certDir: "",
};
exports.default = (0, architect_1.createBuilder)((options, context) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const angularOptions = yield (0, fileHandler_1.getAngularOptions)();
        const project = ((_a = options.browserTarget) === null || _a === void 0 ? void 0 : _a.split(':')[0])
            || Object.keys(angularOptions.projects)[0];
        const mode = ((_b = options.browserTarget) === null || _b === void 0 ? void 0 : _b.split(':')[1]) || 'build';
        const entryPoints = [
            angularOptions.projects[project].architect[mode].options.main
        ];
        new NgcEsbuild({
            bundle: true,
            entryPoints,
            minify: false,
            // open: options.liveReload !== false,
            open: true,
            outpath: options.outputPath,
            port: options.port || 4200,
            serve: true,
            sourcemap: true,
            watch: true,
            format: 'esm',
            project,
            mode,
            certDir: options.certDir,
        });
        context.reportStatus(`Started.`);
    }));
});
