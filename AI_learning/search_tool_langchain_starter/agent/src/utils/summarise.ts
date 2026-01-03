import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getChatModel } from "../shared/models";
import { SummariseInputSchema, SummariseOutputSchema } from "./schemas";

export async function summarise(text: string) {
    const { text: raw } = SummariseInputSchema.parse({
        text,
    })

    const clipped = clip(raw, 6000);
    const model = getChatModel({ temperature: 0.2 });

    const res = await model.invoke([
        new SystemMessage([
            "You are a helpful assistant that summarises text.",
            "Guidelines:",
            "- Be factual and concise",
            " - 5-8 sentences; no lists unless absolutely necessary",
            " - Do not invent sources; you only summarise the provided text",
            "- Keep it readable for beginners"

        ].join('\n')),
        new HumanMessage([
            "Summarise the following content for a beginner friendly audience",
            "Focus on key facts and remove fluff",
            "TEXT:",
            clipped
        ].join("\n\n")),
    ])

    const rawModelOutput = typeof res.content == 'string' ? res.content : String(res.content);
    const summary = normalizeSummary(rawModelOutput);

    return SummariseOutputSchema.parse({summary});

}

function clip(s: string, max: number) {
    return s.length > max ? s.slice(0, max) : s;
}

function normalizeSummary(s: string){
    const t = s
        .replace(/\s+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    
    return t.slice(0,2500);
}