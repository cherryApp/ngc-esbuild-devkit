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
    // console.log('OPTIONS: ', options);
    options = {...defaultOptions, ...options};
    // console.log('ARGV: ', argv);

    const builder: typeof NgcEsbuild = new NgcEsbuild({
      main: options.main,
      minify: Boolean(options.outputHashing),
      open: true,
      outpath: options.outputPath,
      port: 4200,
      serve: true,
      sourcemap: true,
      watch: true,
    });

    context.reportStatus(`Started.`);
  });
});
