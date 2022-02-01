import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import yargs from 'yargs/yargs';
import helpers from 'yargs/helpers';
const argv = yargs(helpers.hideBin(process.argv)).argv;
const NgcEsbuild = require('ngc-esbuild');
const fs = require('fs');
const fsp = fs.promises;
const glob = require('glob');
const path = require('path');
var globToRegExp = require('glob-to-regexp');

import { runCLI } from 'jest';

interface AngularTestBuilderOptions extends JsonObject {
  [key: string]: any;
  assets?: string[];
  browsers?: undefined,
  budgets?: { type: string, maximumWarning: string, maximumError: string }[];
  codeCoverage?: false,
  codeCoverageExclude?: [],
  fileReplacements?: { replace: string, with: string }[];
  include?: [],
  index?: string;
  inlineStyleLanguage?: string;
  karmaConfig?: string;
  main: string[];
  outputHashing?: string,
  outputPath?: string;
  poll?: undefined,
  polyfills?: string;
  preserveSymlinks?: undefined,
  progress?: true,
  reporters?: [],
  scripts?: string[],
  sourceMap?: true,
  stylePreprocessorOptions?: { includePaths: [] },
  styles?: string[];
  tsConfig?: string;
  watch?: undefined,
  webWorkerTsConfig?: undefined
}

const defaultOptions: AngularTestBuilderOptions = {
  main: ["src/test.ts"],
  outputPath: "dist/.jest",
  index: "src/index.html",
  tsConfig: "tsconfig.app.json",
  inlineStyleLanguage: "scss",
};

const loadConfig = async (configPath?: string): Promise<JsonObject> => {
  if (!configPath) {
    return {};
  }

  let content = await fsp.readFile(configPath, 'utf8');
  content = content.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
  return JSON.parse(content);
};

const getDirectories = async (src: string): Promise<string[]> => {
  return new Promise( (resolve, reject) => {
    glob(src, (err: Error, list: string[]) => {
      if (err) {
        return reject(err);
      }

      resolve(list);
    });
  });
};

const processGlobPatterns = async (tsConfig?: {include?: string[]}): Promise<string[]> => {
  const list: string[] = [];
  if (!tsConfig || !Array.isArray(tsConfig.include)) {
    return list;
  }  

  tsConfig.include = ['src/**/*.spec.ts'];
  
  const getDirs: Promise<string[]>[] = [];
  for (const globalPath of tsConfig.include) {
    getDirs.push( getDirectories(globalPath) );
  }
  
  const dirLists = await Promise.all(getDirs);
  list.push( ...dirLists.flat() );

  return list;
  
};

const jestRunner = async () => {
  const projectRootPath = process.cwd();

  // Add any Jest configuration options here
  const jestConfig: any = {
    roots: ['./.jest'],
    passWithNoTests: true,
    testEnvironment: 'jsdom',
    maxWorkers: '50%'
  };

  // Run the Jest asynchronously
  await runCLI(jestConfig as any, [projectRootPath]);
};

const processOptions = async (
  options: AngularTestBuilderOptions,
): Promise<AngularTestBuilderOptions> => {
  const _options = { ...defaultOptions, ...options };

  const tsConfig = await loadConfig(_options.tsConfig);
  let files: string[] = await processGlobPatterns(tsConfig);
  if (Array.isArray(_options.include)) {
    for (const includeGlob of _options.include) {
      const re = globToRegExp(includeGlob);  
      files = files.filter( file => re.test(file) );
    }
  }

  _options.main = [...(files)];
  return _options;
};

export default createBuilder<AngularTestBuilderOptions>((options, context) => {
  return new Promise<BuilderOutput>( async (resolve, reject) => {

    options = await processOptions(options);  
    
    fs.rmSync(path.join(process.cwd(), '/.jest'), {recursive: true, force: true});
    
    new NgcEsbuild({ 
      bundle: true,
      entryPoints: options.main,
      minify: false,
      open: false,
      outpath: '/.jest/',
      port: 4200,
      serve: false,
      sourcemap: false,
      watch: false,
      format: 'iife',
      splitting: false,
      tsconfig: options.tsConfig,
    }).resolve.then( async () => {
  
      await jestRunner();
      resolve({ success: true, path: '' });
    });

    context.reportStatus(`Started.`);
  });
});
