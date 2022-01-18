import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import yargs from 'yargs/yargs';
import helpers from 'yargs/helpers';
const argv = yargs(helpers.hideBin(process.argv)).argv;
const NgcEsbuild = require('ngc-esbuild');
const fsp = require('fs').promises;
const glob = require('glob');

import { runCLI } from 'jest';

interface AngularBuilderOptions extends JsonObject {
  [key: string]: any;
  outputPath: string;
  index: string;
  main: string[];
  polyfills?: string;
  tsConfig?: string;
  inlineStyleLanguage?: string;
  assets?: string[];
  styles?: string[];
  scripts?: string[],
  budgets?: { type: string, maximumWarning: string, maximumError: string }[];
  fileReplacements?: { replace: string, with: string }[];
  outputHashing?: string,
}

const defaultOptions: AngularBuilderOptions = {
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
  };

  // Run the Jest asynchronously
  await runCLI(jestConfig as any, [projectRootPath]);
};

export default createBuilder<AngularBuilderOptions>((options, context) => {
  return new Promise<BuilderOutput>( async (resolve, reject) => {
    options = { ...defaultOptions, ...options };

    const tsConfig = await loadConfig(options.tsConfig);
    options.main = [...(await processGlobPatterns(tsConfig))];
    
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
    }).resolve.then( async () => {
      console.log('Starting Jest ...');
      await jestRunner();
      resolve({ success: true, path: '' });
    });

    context.reportStatus(`Started.`);
  });
});
