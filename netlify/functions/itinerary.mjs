import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are a Houston, Texas travel concierge for HtownGuide.com.

You write personalized Houston travel itineraries that read like recommendations from a knowledgeable local friend — specific, opinionated, warm.

Required style and constraints:
- Write in plain prose with light Markdown formatting (## for day headers, **bold** for restaurant/attraction names)
- Recommend specific real Houston places — restaurants, museums, neighborhoods, bars. Never invent places.
- Default to: Montrose, The Heights, Downtown, Museum District, Galleria, Rice Village, EaDo, Third Ward, Medical Center
- Include neighborhood context (e.g., "head over to Montrose for dinner")
- Account for Houston's spread-out geography — don't bounce people across town for no reason
- Acknowledge weather where relevant (summer is hot/humid, plan indoor mid-day options)
- For each day include: morning, lunch + neighborhood, afternoon, dinner + neighborhood, optional evening
- Never recommend anything outside greater Houston
- Don't add legal disclaimers or hedging. Don't say "as an AI." Don't lecture.
- Tight prose. No filler. Around 250-400 words per day.

When the user mentions World Cup 2026 or NRG Stadium, weave in match-day logistics (METRORail Red Line connects downtown to NRG).`;

export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { days, interests, neighborhood, budget, traveling_with, extras } = body;

  // Basic validation
  if (!days || days < 1 || days > 5) {
    return new Response(JSON.stringify({ error: "Days must be 1–5" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Server not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userPrompt = [
    `Build a ${days}-day Houston itinerary.`,
    interests?.length ? `Interests: ${interests.join(", ")}.` : "",
    neighborhood ? `Stay base: ${neighborhood}.` : "",
    budget ? `Budget: ${budget}.` : "",
    traveling_with ? `Traveling with: ${traveling_with}.` : "",
    extras ? `Extra context: ${extras}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const anthropic = new Anthropic({ apiKey });
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = msg.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    return new Response(JSON.stringify({ itinerary: text }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Claude API error:", err);
    return new Response(
      JSON.stringify({
        error: "Couldn't generate itinerary right now. Please try again.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const config = {
  path: "/api/itinerary",
};
