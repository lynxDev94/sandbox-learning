import { RunnableLambda } from "@langchain/core/runnables";
import { webSearch } from "../utils/webSearch";
import { openUrl } from "../utils/openUrl";
import { summarise } from "../utils/summarise";


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

            if(settledResultsPageSummaries.length === 0){
                const fallbackSnippetSummaries = extractTopResults.map((result: any) => ({
                    url: result.url,
                    summary: String(result.snippet || result.title || "").trim()
                })).filter((x: any) => x.summary.length > 0)

                return {
                    ...input,
                    pageSummaries : fallbackSnippetSummaries,
                    fallback: 'none' as const
                }
            }
    }
)