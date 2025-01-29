import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message) return NextResponse.json({ reply: "⚠️ Please provide input." });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(message);
    const response = await result.response;
    let text = response.text();

    // 🛠️ **Fix Markdown Formatting for Code Blocks**
    text = text.replace(/```([\s\S]*?)```/g, "```\n$1\n```");

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ reply: "⚠️ Error fetching AI response." });
  }
}