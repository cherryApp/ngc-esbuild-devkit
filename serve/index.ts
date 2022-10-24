import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import yargs from 'yargs/yargs';
import helpers from 'yargs/helpers';
import { getAngularOptions } from '../utils/fileHandler';
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
  outputHashing?: string;
  liveReload?: boolean;
  browserTarget?: string;
  certDir?: string;
}

const defaultOptions: AngularBuilderOptions = {
  main: "src/main.ts",
  outputPath: "dist/angular-observables-http",
  index: "src/index.html",
  tsConfig: "tsconfig.app.json",
  inlineStyleLanguage: "scss",
  certDir: "",
};

export default createBuilder<AngularBuilderOptions>((options, context) => {
  return new Promise<BuilderOutput>( async (resolve, reject) => {
    const angularOptions = await getAngularOptions();
    const project = options.browserTarget?.split(':')[0]
        || Object.keys(angularOptions.projects)[0];
    const mode = options.browserTarget?.split(':')[1] || 'build' 
    const entryPoints = [
      angularOptions.projects[project].architect[mode].options.main
    ];

    console.log('OPTIONS:', options);

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
  });
});
