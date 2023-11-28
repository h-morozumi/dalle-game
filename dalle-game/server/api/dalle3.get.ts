import { defineEventHandler, createError, getQuery } from 'h3';
import { useRuntimeConfig } from '#imports'
import fetch from 'node-fetch';

const config = useRuntimeConfig();

const endpoint = config.dalle3Endpoint ; // Azure OpenAI DALL-E v3 Endpoint URL
const key = config.dalle3ApiKey; // Azure OpenAI DALL-E v3 API Key
const api_version = '2023-12-01-preview';
const apiUrl = `${endpoint}openai/deployments/Dalle3/images/generations?api-version=${api_version}`;

interface GenerateImagesResponse  {
    created: number;
    data: GenerateImagesResponseData[];
}
interface GenerateImagesResponseData {
    url: string;
    revised_prompt: string;
}

export default defineEventHandler(async (event) => {
    try {
        const query = await getQuery(event);
        const text = query.text as string | undefined;
        if (!text) {
          throw createError({ statusCode: 400, statusMessage: 'No text provided' });
        }
        console.log(`url: ${apiUrl}`);

        const response = await fetch(apiUrl,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': key,
            },
            body: JSON.stringify({
                prompt: text,
                size: "1024x1024",
                n: 1,
                quality: "standard",
                style:"natural"
            })
        })

        const result = await response.json() as GenerateImagesResponse;
        if (!response.ok) {
            throw createError({ statusCode: response.status, statusMessage: response.statusText });
        }
        const url = result.data[0].url;
        const revised_prompt = result.data[0].revised_prompt;

        return {
            url,
            revised_prompt,
        };

    } catch (error) {
        console.error(error);
        throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
    }
});
