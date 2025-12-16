type Provider = "openai" | "gemini" | "groq";

type HelloOutput = {
    ok: true,
    provider: Provider,
    model: string,
    message: string,
}

type OpenAIChatCompletionResponse = {
choices?: Array<{message?: {content?: string}}>
}


async function helloOpenAi(): Promise<HelloOutput> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

    const model = "gpt-4o-mini";
    const url = `https://api.openai.com/v1/chat/completions`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: "Hello, how are you?" }], temperature: 0.7,
        }),
    })
    if (!response.ok) throw new Error(`OpenAI ${response.status}: ${await response.text()}`);

    const json = await response.json() as OpenAIChatCompletionResponse;
    const content = json.choices?.[0]?.message?.content ?? "Hello as default";


    return {
        ok: true,
        provider: "openai",
        model: model,
        message: String(content).trim(),
    }
}

export async function selectAndHello(provider: Provider): Promise<HelloOutput> {
    const forced = (process.env.PROVIDER || "").toLowerCase();  

    switch(forced) {
        case "openai":
            return await helloOpenAi();
        default:
            throw new Error(`Unsupported Provider: ${forced}`);
    }
}