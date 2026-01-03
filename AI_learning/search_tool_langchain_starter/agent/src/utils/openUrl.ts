import { convert } from 'html-to-text';
import { OpenUrlOutputSchema } from './schemas';

export async function openUrl(url: string) {
    const normalized = validateUrl(url);
    const res = await fetch(normalized, {
        headers: {
            'User-Agent': 'agent-core/1.0 (+course-demo)',

        }
    });
    if (!res.ok) {
        const body = await safeText(res);
        throw new Error(`Failed to fetch URL: ${normalized} - ${body}`);
    }

    const contentType = res.headers.get('content-type') ?? '';
    const raw = await res.text();

    const text = contentType.includes('text/html') ?
        convert(raw, {
            wordwrap: false,
            selectors: [
                {
                    selector: 'nav', format: 'skip',
                },
                {
                    selector: 'header', format: 'skip',
                },
                {
                    selector: 'footer', format: 'skip',
                },
                {
                    selector: 'script', format: 'skip',
                },
                {
                    selector: 'style', format: 'skip',
                },

            ]
        }) : raw;

    const cleaned = collapseWhitespace(text);
    const capped = cleaned.slice(0, 8000);

    return OpenUrlOutputSchema.parse({
        url: normalized,
        content: capped,
    })
}

export function validateUrl(url: string) {
    try {
        const parsed = new URL(url);
        if (!/^https?:$/.test(parsed.protocol)) throw new Error(`Invalid URL: ${url}`);
        return parsed.toString();
    }
    catch {
        throw new Error(`Invalid URL: ${url}`);
    }

}
async function safeText(res: Response) {
    try {
        return await res.json();
    }
    catch {
        return "<no body>"
    }
}

function collapseWhitespace(text: string) {
    return text.replace(/\s+/g, ' ').trim();
}