import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the message interface to fix type errors
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function POST(req: Request) {
  try {
    const { prompt, conversation } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // System message that includes the word "json" to satisfy the API requirement
    const systemMessage: ChatMessage = {
      role: 'system',
      content: 'You are a helpful assistant that creates workout timer sets. Generate a list of named timers with durations in seconds. Respond with a JSON object containing an array of timers.'
    };

    // Prepare messages for the API
    let messages: ChatMessage[] = [];
    
    if (conversation && Array.isArray(conversation)) {
      // Use the existing conversation history
      messages = conversation as ChatMessage[];
      
      // Check if there's a system message, if not add one
      if (!messages.some((msg: ChatMessage) => msg.role === 'system')) {
        messages.unshift(systemMessage);
      } else {
        // Replace the existing system message to ensure it contains "json"
        const systemIndex = messages.findIndex(msg => msg.role === 'system');
        if (systemIndex >= 0) {
          messages[systemIndex] = systemMessage;
        }
      }
    } else {
      // Start a new conversation
      messages = [
        systemMessage,
        { role: 'user', content: prompt }
      ];
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    // Parse the JSON response
    const parsedContent = JSON.parse(content);
    
    if (!parsedContent.timers || !Array.isArray(parsedContent.timers)) {
      throw new Error('Invalid response format from OpenAI');
    }

    return NextResponse.json({ timers: parsedContent.timers });
  } catch (error) {
    console.error('Error generating timers:', error);
    return NextResponse.json(
      { error: 'Failed to generate timers' },
      { status: 500 }
    );
  }
} 