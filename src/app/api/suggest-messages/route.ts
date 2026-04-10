import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export const runtime = "edge";

// Fallback questions to show if the API is down or busy
const FALLBACK_QUESTIONS = "What’s the best piece of advice you’ve ever received?||If you could travel anywhere tomorrow, where would you go?||What is a small win you had today?";

export async function POST(req: Request) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. " +
      "Each question should be separated by '||'. Do not include numbers or bullet points. " +
      "Example: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'";

    // Call the API
    const result = await model.generateContentStream(prompt).catch((err) => {
      // Specifically check for 503 or overload errors
      if (err.status === 503 || err.message?.includes("503")) {
        throw new Error("SERVICE_BUSY");
      }
      throw err;
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            controller.enqueue(encoder.encode(text));
          }
        } catch (err) {
          console.error("Stream processing error:", err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("API Error:", error);

    // If the service is busy, return the fallback questions instead of an error
    if (error.message === "SERVICE_BUSY") {
      return new Response(FALLBACK_QUESTIONS, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
        status: 200, // Return 200 so the frontend still displays content
      });
    }

    return new Response(
      JSON.stringify({ error: "Failed to generate suggestions" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}