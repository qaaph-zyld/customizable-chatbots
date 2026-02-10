import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bot_id, message, session_id } = body;

    if (!bot_id || !message) {
      return NextResponse.json(
        { error: "bot_id and message are required" },
        { status: 400 }
      );
    }

    // Demo response — in production, this routes to the appropriate AI engine
    const responses: Record<string, string> = {
      "pricing": "We offer three plans: Starter (free), Professional ($49/mo), and Enterprise (custom). Would you like details on any specific plan?",
      "features": "Our platform includes multi-engine AI support, conversation templates, analytics dashboard, sentiment analysis, and multi-channel deployment. What feature interests you most?",
      "support": "I can help with technical questions, account management, and general inquiries. What do you need assistance with?",
      "default": "Thanks for your message! I'm a demo bot. In production, I'd be powered by your configured AI engine (GPT-4o, Hugging Face, or Botpress). How can I help you?",
    };

    const msgLower = message.toLowerCase();
    let reply = responses["default"];
    if (msgLower.includes("pric") || msgLower.includes("cost") || msgLower.includes("plan")) reply = responses["pricing"];
    else if (msgLower.includes("feature") || msgLower.includes("what can")) reply = responses["features"];
    else if (msgLower.includes("help") || msgLower.includes("support")) reply = responses["support"];

    return NextResponse.json({
      bot_id,
      session_id: session_id || `session-${Date.now()}`,
      reply,
      timestamp: new Date().toISOString(),
      engine: "demo",
      tokens_used: reply.split(" ").length,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: "Customizable Chatbots API",
    version: "1.0.0",
    endpoints: {
      "POST /api/chat": "Send a message to a chatbot",
    },
    docs: "https://customizable-chatbots.netlify.app/dashboard",
  });
}
