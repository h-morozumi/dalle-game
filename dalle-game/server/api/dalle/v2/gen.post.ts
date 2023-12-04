import { defineEventHandler, createError } from 'h3';
import { useRuntimeConfig } from '#imports'
import fetch from 'node-fetch';
import type {GenerateImagesResponse,OperationResponse,} from '~/types/dalle2'

const config = useRuntimeConfig();
// Azure OpenAI DALL-E v2
const endpoint = config.dalle2Endpoint ; // Azure OpenAI DALL-E v2 Endpoint URL
const key = config.dalle2ApiKey; // Azure OpenAI DALL-E v2 API Key
const api_version = '2023-06-01-preview';
const apiUrl = `${endpoint}openai/images/generations:submit?api-version=${api_version}`;

export default defineEventHandler(async (event) => {
    try {
        // リクエストボディを取得
        const body = await readBody(event);
        // ボディからデータを取り出す
        const { prompt } = body;

        if(!prompt){
            throw createError({ statusCode: 400, statusMessage: 'Parameter Error' });
        }

        const response = await fetch(apiUrl, getFetchRequestOptions('POST', { prompt:prompt, size: "1024x1024", n: 1 }));

        if (!response.ok) {
            throw createError({ statusCode: response.status, statusMessage: response.statusText });
        }
        
        // Get the result
        const result = await response.json() as GenerateImagesResponse;
        // Headerからoperation-locationを取得
        const operationLocation = response.headers.get('operation-location');

        if (!operationLocation) {
          throw createError({ statusCode: 500, statusMessage: 'Operation location not found' });
        }

        await waitForOperationToSucceed(operationLocation);

        const operationResponse = await fetch(operationLocation, getFetchRequestOptions('GET'));
        const operationResult = await operationResponse.json() as OperationResponse;
    
        const ret = operationResult.result.data[0]?.url;
        console.log(ret);
        return ret;
    } catch (error) {
        console.error(error);
        throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
    }
});

function getFetchRequestOptions(method: string, body?: Record<string, any>) {
  return {
      method,
      headers: {
          'Content-Type': 'application/json',
          'api-key': key,
      },
      body: body ? JSON.stringify(body) : undefined,
  };
}

async function waitForOperationToSucceed(operationLocation: string) {
  let status = '';
  while (status !== 'succeeded') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const operationResponse = await fetch(operationLocation, getFetchRequestOptions('GET'));
      if (!operationResponse.ok) {
          throw createError({ statusCode: operationResponse.status, statusMessage: operationResponse.statusText });
      }
      const operationResult = await operationResponse.json() as OperationResponse;
      status = operationResult.status;
  }
}