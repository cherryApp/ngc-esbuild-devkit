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
const argv = (0, yargs_1.default)(helpers_1.default.hideBin(process.argv)).argv;
const NgcEsbuild = require('ngc-esbuild');
const fs = require('fs');
const fsp = fs.promises;
const glob = require('glob');
const path = require('path');
var globToRegExp = require('glob-to-regexp');
const jest_1 = require("jest");
const defaultOptions = {
    main: ["src/test.ts"],
    outputPath: "dist/.jest",
    index: "src/index.html",
    tsConfig: "tsconfig.app.json",
    inlineStyleLanguage: "scss",
};
const loadConfig = (configPath) => __awaiter(void 0, void 0, void 0, function* () {
    if (!configPath) {
        return {};
    }
    let content = yield fsp.readFile(configPath, 'utf8');
    content = content.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
    return JSON.parse(content);
});
const getDirectories = (src) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        glob(src, (err, list) => {
            if (err) {
                return reject(err);
            }
            resolve(list);
        });
    });
});
const processGlobPatterns = (tsConfig) => __awaiter(void 0, void 0, void 0, function* () {
    const list = [];
    if (!tsConfig || !Array.isArray(tsConfig.include)) {
        return list;
    }
    tsConfig.include = ['src/**/*.spec.ts'];
    const getDirs = [];
    for (const globalPath of tsConfig.include) {
        getDirs.push(getDirectories(globalPath));
    }
    const dirLists = yield Promise.all(getDirs);
    list.push(...dirLists.flat());
    return list;
});
const jestRunner = () => __awaiter(void 0, void 0, void 0, function* () {
    const projectRootPath = process.cwd();
    // Add any Jest configuration options here
    const jestConfig = {
        roots: ['./.jest'],
        passWithNoTests: true,
        testEnvironment: 'jsdom',
        maxWorkers: '50%'
    };
    // Run the Jest asynchronously
    yield (0, jest_1.runCLI)(jestConfig, [projectRootPath]);
});
const processOptions = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const _options = Object.assign(Object.assign({}, defaultOptions), options);
    const tsConfig = yield loadConfig(_options.tsConfig);
    let files = yield processGlobPatterns(tsConfig);
    if (Array.isArray(_options.include)) {
        for (const includeGlob of _options.include) {
            const re = globToRegExp(includeGlob);
            files = files.filter(file => re.test(file));
        }
    }
    _options.main = [...(files)];
    return _options;
});
exports.default = (0, architect_1.createBuilder)((options, context) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        options = yield processOptions(options);
        fs.rmSync(path.join(process.cwd(), '/.jest'), { recursive: true, force: true });
        new NgcEsbuild({
            bundle: true,
            main: options.main,
            minify: false,
            open: false,
            outpath: '/.jest/',
            port: 4200,
            serve: false,
            sourcemap: false,
            watch: false,
            format: 'iife',
            tsconfig: options.tsConfig,
        }).resolve.then(() => __awaiter(void 0, void 0, void 0, function* () {
            yield jestRunner();
            resolve({ success: true, path: '' });
        }));
        context.reportStatus(`Started.`);
    }));
});
