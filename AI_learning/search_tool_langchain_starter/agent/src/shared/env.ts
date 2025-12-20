import { z} from 'zod';

const EnvSchema = z.object({
    PORT: z.string().default("5000"),
    ALLOWED_ORIGIN: z.url().default('http://localhost:5000'),
    MODEL_PROVIDER: z.enum(['openai']).default('openai'),
    OPENAI_API_KEY: z.string().optional(),
    OPENAI_MODEL: z.string().default("gpt-4o-mini"),
    SEARCH_PROVIDER: z.string().default('tavily'),
    TAVILY_API_KEY: z.string().optional()
})

export const env = EnvSchema.parse(process.env);