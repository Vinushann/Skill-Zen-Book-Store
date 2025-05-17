#!/usr/bin/env node

const { program } = require("commander");
const generateEnvExample = require("../index");
const { existsSync } = require("fs");
const fs = require("fs").promises;
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function prompt(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

program
  .version("1.0.8")
  .description("Generate a .env.example file from a .env file")
  .option("-i, --input <path>", "Input .env file path")
  .option("-o, --output <path>", "Output .env.example file path")
  .option("-p, --placeholder <value>", "Placeholder for values")
  .option("--preserve <keys...>", "Keys to preserve original values")
  .option("--ignore <keys...>", "Keys to exclude from output")
  .option("--no-comments", "Exclude comments from output", false)
  .option("--header <text>", "Custom header text")
  .option("--force", "Overwrite existing output file", true)
  .option("--no-force", "Do not overwrite existing output file")
  .option("--silent", "Suppress console output", true)
  .option("--dry-run", "Preview output without writing", false)
  .option("--init", "Create a sample .env file", false)
  .action(async (options) => {
    try {
      if (options.init) {
        const samplePath = path.resolve(process.cwd(), options.input || ".env");
        if (existsSync(samplePath)) {
          console.log(
            `'${
              options.input || ".env"
            }' already exists. Skipping sample creation.`
          );
        } else {
          const sampleContent = `# Sample .env file\nAPI_KEY=your_key\nDATABASE_URL=your_url\n`;
          await fs.writeFile(samplePath, sampleContent, "utf8");
          console.log(
            `Created sample '${
              options.input || ".env"
            }'. Edit it and run again.`
          );
        }
        process.exit(0);
      }

      const inputPath = path.resolve(process.cwd(), options.input || ".env");
      if (!existsSync(inputPath)) {
        console.log(`No '${options.input || ".env"}' file found.`);
        const create = await prompt("Create a sample .env file? (y/n): ");
        if (create.toLowerCase() === "y") {
          const sampleContent = `# Sample .env file\nAPI_KEY=your_key\nDATABASE_URL=your_url\n`;
          await fs.writeFile(inputPath, sampleContent, "utf8");
          console.log(
            `Created '${options.input || ".env"}'. Edit it and run again.`
          );
          process.exit(0);
        } else {
          console.log("Aborting. Please create a .env file to proceed.");
          process.exit(1);
        }
      }

      const cliOptions = {
        envFilePath: options.input,
        outputFilePath: options.output,
        placeholder: options.placeholder,
        preserveValues: options.preserve,
        ignoreKeys: options.ignore,
        includeComments: options.noComments ? false : undefined,
        header: options.header,
        force: options.force && !options.noForce, // Handle force/noForce
        silent: options.silent,
        dryRun: options.dryRun,
      };

      if (!options.silent) {
        console.log(
          "CLI options passed to generateEnvExample:",
          JSON.stringify(cliOptions, null, 2)
        );
      }

      const result = await generateEnvExample(cliOptions);

      if (!options.silent && result.written) {
        console.log(
          `Generated '${options.output || ".env.example"}' with keys: ${
            result.keys.join(", ") || "none"
          }`
        );
        if (result.skippedKeys.length) {
          console.log(`Skipped keys: ${result.skippedKeys.join(", ")}`);
        }
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    } finally {
      rl.close();
    }
  });

program.on("--help", () => {
  console.log("\nExamples:");
  console.log(
    "  $ genv-ex                              # Generate .env.example from .env"
  );
  console.log(
    "  $ genv-ex -i .env.prod -o .env.prod.example --preserve API_KEY"
  );
  console.log(
    "  $ genv-ex --init                       # Create a sample .env file"
  );
  console.log("  $ genv-ex --dry-run                    # Preview output");
  console.log("\nCreate a .genv-exrc file for default settings:");
  console.log('  { "placeholder": "YOUR_VALUE", "includeComments": true }');
});

program.parse(process.argv);
