declare module "genv-ex" {
  interface GenerateEnvExampleOptions {
    envFilePath?: string;
    outputFilePath?: string;
    placeholder?: string;
    preserveValues?: string[];
    ignoreKeys?: string[];
    includeComments?: boolean;
    header?: string;
    force?: boolean;
    silent?: boolean;
    dryRun?: boolean;
    configFile?: string;
  }

  interface GenerateEnvExampleResult {
    content: string;
    written: boolean;
    keys: string[];
    skippedKeys: string[];
  }

  function generateEnvExample(
    options?: GenerateEnvExampleOptions
  ): Promise<GenerateEnvExampleResult>;

  export default generateEnvExample;
}
