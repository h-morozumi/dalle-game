import { defineEventHandler, createError, getQuery } from 'h3';
import { useRuntimeConfig } from '#imports'
import fetch from 'node-fetch';

const config = useRuntimeConfig();
// Azure OpenAI DALL-E v2
const endpoint = config.dalle2Endpoint ; // Azure OpenAI DALL-E v2 Endpoint URL
const key = config.dalle2ApiKey; // Azure OpenAI DALL-E v2 API Key
const api_version = '2023-06-01-preview';
const apiUrl = `${endpoint}openai/images/generations:submit?api-version=${api_version}`;

interface GenerateImagesResponse {
  id: string;
  status: string;
}

interface OperationResponse {
  created: number;
  expires: number;
  id: string;
  result: OperationResult;
  status: string;
}

interface OperationResult {
  created: number;
  data: OperationResultData[];
}

interface OperationResultData {
  url: string;
}

export default defineEventHandler(async (event) => {
    try {

        const query = await getQuery(event);
        const text = query.text as string | undefined;
        if (!text) {
          throw createError({ statusCode: 400, statusMessage: 'No text provided' });
        }

        const response = await fetch(apiUrl, getFetchRequestOptions('POST', { prompt:text, size: "1024x1024", n: 1 }));

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
    
        return operationResult.result.data[0]?.url;
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      const operationResponse = await fetch(operationLocation, getFetchRequestOptions('GET'));
      if (!operationResponse.ok) {
          throw createError({ statusCode: operationResponse.status, statusMessage: operationResponse.statusText });
      }
      const operationResult = await operationResponse.json() as OperationResponse;
      status = operationResult.status;
  }
}