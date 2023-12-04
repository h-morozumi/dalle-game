import { defineEventHandler, createError, getQuery } from 'h3';
import { useRuntimeConfig } from '#imports'
import fetch from 'node-fetch';
import type { GenerateImagesResponse } from '~/types/dalle3'

const config = useRuntimeConfig();

const endpoint = config.dalle3Endpoint ; // Azure OpenAI DALL-E v3 Endpoint URL
const key = config.dalle3ApiKey; // Azure OpenAI DALL-E v3 API Key
const api_version = '2023-12-01-preview';
const apiUrl = `${endpoint}openai/deployments/Dalle3/images/generations?api-version=${api_version}`;

export default defineEventHandler(async (event) => {
    try {
        // リクエストボディを取得
        const body = await readBody(event);
        // ボディからデータを取り出す
        const { prompt } = body;

        if(!prompt){
            throw createError({ statusCode: 400, statusMessage: 'Parameter Error' });
        }

        const response = await fetch(apiUrl,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': key,
            },
            body: JSON.stringify({
                prompt: prompt,
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

        console.log(`url: ${url}, revised_prompt: ${revised_prompt}`);

        return url;
    } catch (error) {
        console.error(error);
        throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
    }
});
