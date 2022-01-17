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
const fsp = require('fs').promises;
const glob = require('glob');
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
            console.log('GLOBFN: ', list);
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
    console.log('getDirs: ', getDirs);
    const dirLists = yield Promise.all(getDirs);
    console.log('dirLists: ', tsConfig);
    list.push(...dirLists.flat());
    return list;
});
const jestRunner = () => __awaiter(void 0, void 0, void 0, function* () {
    const projectRootPath = process.cwd();
    // Add any Jest configuration options here
    const jestConfig = {
        roots: ['./.jest'],
        passWithNoTests: true,
    };
    // Run the Jest asynchronously
    yield (0, jest_1.runCLI)(jestConfig, [projectRootPath]);
});
exports.default = (0, architect_1.createBuilder)((options, context) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('OPTIONS: ', options);
        options = Object.assign(Object.assign({}, defaultOptions), options);
        // console.log('ARGV: ', argv);
        const tsConfig = yield loadConfig(options.tsConfig);
        options.main = !Array.isArray(options.main) ? [options.main] : options.main;
        options.main = [...options.main, ...(yield processGlobPatterns(tsConfig))];
        console.log(options.main);
        new NgcEsbuild({
            bundle: false,
            main: ['src/app/app.component.spec.ts'],
            minify: false,
            open: false,
            outpath: '/.jest/',
            port: 4200,
            serve: false,
            sourcemap: true,
            watch: false,
            format: 'cjs',
            tsconfig: options.tsConfig,
        }).resolve.then(() => __awaiter(void 0, void 0, void 0, function* () {
            console.log('Starting Jest ...');
            yield jestRunner();
            resolve({ success: true, path: '' });
        }));
        context.reportStatus(`Started.`);
    }));
});
