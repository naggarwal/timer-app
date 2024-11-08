import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || "gpt-3.5-turbo";

//console.log('API Key:', process.env.OPENAI_API_KEY); // For debugging

const SYSTEM_PROMPT = `Create a timer set based on the user's request. Return only valid JSON matching this schema:
{
  "timers": [
    {
      "name": "Exercise Name",
      "duration": number (in seconds)
    }
  ]
}
Example: For "Create a 5 minute arm workout", you might return:
{
  "timers": [
    {"name": "Arm Circles", "duration": 60},
    {"name": "Push-ups", "duration": 120},
    {"name": "Rest", "duration": 30},
    {"name": "Tricep Dips", "duration": 90}
  ]
}`;

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    const completion = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }
    console.log('Content:', content);
    const timerSet = JSON.parse(content);
    return NextResponse.json(timerSet);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { message: 'Error generating timer set' },
      { status: 500 }
    );
  }
} 