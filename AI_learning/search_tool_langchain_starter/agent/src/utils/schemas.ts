import z from "zod";

// legal contract backend -> AI models -> frontend
// save cost ->

export const WebSearchResultSchema = z.object({
    title: z.string().min(1),
    url: z.url(),
    snippet: z.string().optional().default(""),
    
})

export const WebSearchResultsSchema = z.array(WebSearchResultSchema).max(10);

export type WebSearchResult = z.infer<typeof WebSearchResultsSchema>;

export const OpenUrlInputSchema = z.object({
    url: z.url(),
})
export const OpenUrlOutputSchema = z.object({
    url: z.url(),
    content: z.string().min(1)
})

export const SummariseInputSchema = z.object({
    text: z.string().min(50, 'Need a bit more text to summarise'),
})

export const SummariseOutputSchema = z.object({
    summary: z.string().min(1),
})

export const SearchInputSchema = z.object({
    q: z.string().min(5, 'Please ask a specific query')
})

export type SearchInput = z.infer<typeof SearchInputSchema>;

// export type SummariseInput = z.infer<typeof SummariseInputSchema>;
// export type SummariseOutput = z.infer<typeof SummariseOutputSchema>;