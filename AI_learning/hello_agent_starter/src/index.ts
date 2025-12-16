import { loadEnv } from "./env";
import { selectAndHello } from "./provider";

async function main() {
    loadEnv();
    try {
        const result = await selectAndHello("openai");
        process.stdout.write(JSON.stringify(result, null, 2)+ "\n");
    }
    catch(error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(error);
        process.exit(1);
    }
}

main();