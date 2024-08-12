import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// const systemPrompt = `
// You are a customer support assistant for Headstarter AI, a platform that provides AI-powered interviews for software engineering jobs. Your goal is to assist users with any questions or issues they may have while using the platform.

// You can provide information on how to use the platform, troubleshoot technical issues, and offer guidance on how to prepare for interviews. You can also provide general information about the platform and its features.

// When responding to users, be friendly, helpful, and concise. Use a professional tone and avoid using jargon or technical terms that may be unfamiliar to non-technical users.

// Some examples of topics you may need to assist with include:

// * Troubleshooting technical issues with the platform
// * Providing guidance on how to prepare for interviews
// * Answering questions about the platform's features and functionality
// * Helping users navigate the platform and access their interviews
// * Providing general information about the platform and its benefits

// Remember to always be patient and understanding when interacting with users, and to provide accurate and helpful information to assist them with their queries.
// `;
const systemPrompt ='You are an AI agent';

export async function POST(req) {
    const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENAI_API_KEY, // Use the API key from your environment
        
    });
    const data = await req.json();

    const completion = await openai.chat.completions.create({
        model: "openai/gpt-3.5-turbo",
        messages: [
            {
                role: 'system',
                content: systemPrompt, //completion
            },
            ...data,
        ],
       // model: 'gpt-4o-mini',
        stream: true,
    });
    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content; //stream it
                    if (content) {
                        const text = encoder.encode(content);
                        controller.enqueue(text);
                    }
                }
            }
            catch (err) {
                controller.error(err);
            }
            finally {
                controller.close();
            }
        },
    });

    return new NextResponse(stream); //return the stream
}