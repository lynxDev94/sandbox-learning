import { env } from "./env";
import { ChatOpenAI } from '@langchain/openai';
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

type ModelOpts = {
    temperature?: number,
    maxTokens?: number;
}

export function getChatModel(opts: ModelOpts = {}): BaseChatModel {
    const temp = opts?.temperature ?? 0.2;

    switch (env.MODEL_PROVIDER) {
        case 'openai':
            return new ChatOpenAI
        default:
            return new ChatOpenAI({
                apiKey: env.OPENAI_API_KEY,
                model: env.OPENAI_MODEL,
                temperature: temp
            })
    }
}