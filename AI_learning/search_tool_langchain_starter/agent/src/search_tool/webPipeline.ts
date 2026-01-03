import { RunnableLambda, RunnableSequence } from "@langchain/core/runnables";
import { webSearch } from "../utils/webSearch";
import { openUrl } from "../utils/openUrl";
import { summarise } from "../utils/summarise";
import { getChatModel } from "../shared/models";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { candidate } from "./types";


const setTopResults = 5;

export const webSearchStep = RunnableLambda.from(
    async (input: { q: string, model: 'web' | 'direct' }) => {
        const results = await webSearch(input.q)

        return {
            ...input,
            results
        }
    }
)

export const openAndSummarizeStep = RunnableLambda.from(
    async (input: { q: string; mode: 'web' | 'direct'; results: any[] }) => {
        if (!Array.isArray(input.results) || input.results.length === 0) {
            return {
                ...input,
                pageSummaries: [],
                fallback: 'no results' as const
            };
        }
        const extractTopResults = input.results.slice(0, setTopResults);

        const settledResults = await Promise.allSettled(
            extractTopResults.map(async (result: any) => {

                const opened = await openUrl(result.url);
                const summarizeContent = await summarise(opened.content)

                return {
                    url: opened.url,
                    summary: summarizeContent.summary
                }
            })
        )

        const settledResultsPageSummaries = settledResults
            .filter(settledResults => settledResults.status === 'fulfilled')
            .map(s => s.value)

        if (settledResultsPageSummaries.length === 0) {
            const fallbackSnippetSummaries = extractTopResults.map((result: any) => ({
                url: result.url,
                summary: String(result.snippet || result.title || "").trim()
            })).filter((x: any) => x.summary.length > 0)

            return {
                ...input,
                pageSummaries: fallbackSnippetSummaries,
                fallback: 'none' as const
            }
        }
    }
)

export const stepCompose = RunnableLambda.from(
    async (input: {
        q: string,
        pageSummaries: Array<{ url: string; summary: string }>,
        mode: 'web' | 'direct';
        fallback: 'no-results' | 'snippets' | 'none'
    }): Promise<candidate> => {
        const model = getChatModel({ temperature: 0.2 });
        if (!input.pageSummaries || input.pageSummaries.length === 0) {
            const directResponseFromModel = await model.invoke([
                new SystemMessage(  
                    [
                        "You answer briefly and clearly for beginners",
                        "If unsure, say so"
                    ].join("\n")
                ),
                new HumanMessage(input.q)
            ]);
            const directAnswer = (
                typeof directResponseFromModel.content === 'string' ?
                    directResponseFromModel.content : String(directResponseFromModel.content)).trim()

            return {
                answer: directAnswer,
                sources: [],
                mode: 'direct'
            }
        }

        const res = await model.invoke(
            [
                new SystemMessage(
                    [
                        "You concisely answer questions using provided page summaries",
                        "Rules: ",
                        "- Be accurate and neutral",
                        "- 5-8 sentences max",
                        "Use only provided summaries; do not invent new facts."
                    ].join('\n')
                ),
                new HumanMessage(
                    [
                        `Question: ${input.q}`,
                        "Summaries: ",
                        JSON.stringify(input.pageSummaries, null, 2)
                    ].join('\n')
                )
            ]
        )

        const finalAnswer = (
            typeof res.content === 'string' ? res.content : String(res.content)
        )

        const extractSources = input.pageSummaries.map(x => x.url)

        return {
            answer: finalAnswer,
            sources: extractSources,
            mode: 'web'

        }

    }
)


export const webBasedPath = RunnableSequence.from([
    webSearchStep,
    openAndSummarizeStep,
    stepCompose
])