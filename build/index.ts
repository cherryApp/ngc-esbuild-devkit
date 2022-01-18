import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import yargs from 'yargs/yargs';
import helpers from 'yargs/helpers';
const argv = yargs(helpers.hideBin(process.argv)).argv;
const NgcEsbuild = require('ngc-esbuild');

interface AngularBuilderOptions extends JsonObject {
  [key: string]: any;
  outputPath: string;
  index: string;
  main: string;
  polyfills?: string;
  tsConfig?: string;
  inlineStyleLanguage?: string;
  assets?: string[];
  styles?: string[];
  scripts?: string[],
  budgets?: { type: string, maximumWarning: string, maximumError: string }[];
  fileReplacements?: {replace: string, with: string}[];
  outputHashing?: string,
}

const defaultOptions: AngularBuilderOptions = {
  main: "src/main.ts",
  outputPath: "dist/angular-observables-http",
  index: "src/index.html",
  tsConfig: "tsconfig.app.json",
  inlineStyleLanguage: "scss",
};

export default createBuilder<AngularBuilderOptions>((options, context) => {
  return new Promise<BuilderOutput>((resolve, reject) => {
    options = {...defaultOptions, ...options};

    new NgcEsbuild({
      bundle: true,
      main: [options.main],
      minify: true,
      open: false,
      outpath: options.outputPath,
      port: 4200,
      serve: false,
      sourcemap: false,
      watch: false,
      format: 'esm',
    }).resolve.then(
      (result: any) => {
        console.log(`Build has been finished: ${options.outputPath}`);
        resolve({ success: true, path: '' });
      }
    ).catch( (err: any) => reject(err) );

    context.reportStatus(`Started.`);
  });
});
