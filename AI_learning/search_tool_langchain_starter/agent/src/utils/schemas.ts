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