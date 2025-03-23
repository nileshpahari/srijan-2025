"use server";

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || " ");

interface Prompt {
  teamDescription: string;
  users: {
    userId: string;
    skills: string[];
  }[];
}

interface Quiz {
  question: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  answer: string;
}
[];

const schema = {
  description: "A list of userIds that match the team description",
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.STRING,
    description: "User ID of a suggested team member",
    nullable: false,
  },
};

export async function generateTeamSuggestions(prompt: Prompt): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction:
        "You are a helpful assistant that suggests team members based on their skills and the given team description.",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema as any,
      },
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `These are the users and their respective skills: ${JSON.stringify(
                prompt.users
              )}`,
            },
            {
              text: `This is the team description: ${prompt.teamDescription}`,
            },
          ],
        },
      ],
    });

    const responseText = result.response.text();
    const userIds: string[] = responseText ? JSON.parse(responseText) : [];

    return userIds;
  } catch (error) {
    console.error("Error generating team suggestions:", error);
    return [];
  }
}

export async function generateQuiz(skill: string): Promise<Quiz[]> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction:
        "You are a helpful assistant that generates multiple-choice questions (MCQs) for skill assessment.",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Generate 20 multiple-choice questions (MCQs) for testing knowledge in ${skill}. 
              Each question should have exactly four answer choices labeled as "a", "b", "c", and "d".
              The correct answer should be one of these options ("a", "b", "c", or "d").
              Format the response as a JSON array:
              [
                {
                  "question": "What is React?",
                  "options": {
                    "a": "A library",
                    "b": "A framework",
                    "c": "A language",
                    "d": "A database"
                  },
                  "answer": "a"
                },
                ...
              ]`,
            },
          ],
        },
      ],
    });

    const responseText = result.response.text();
    const quiz: Quiz[] = responseText ? JSON.parse(responseText) : [];

    return quiz;
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    return [];
  }
}
