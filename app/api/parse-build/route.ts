import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  const { description } = await request.json();
  if (!description?.trim()) {
    return NextResponse.json({ error: "No description provided" }, { status: 400 });
  }

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system:
      "You are a helper for a furniture maker. Extract structured build data from a plain-English description. Only include fields you can confidently infer. Return numeric values as numbers (no currency symbols). For status: use 'sold' if the piece was sold, 'completed' if finished but not sold, 'in_progress' if still being made.",
    tools: [
      {
        name: "create_build",
        description: "Create a furniture build record from a description",
        input_schema: {
          type: "object" as const,
          properties: {
            name: {
              type: "string",
              description: "Name or description of the furniture piece, e.g. 'Walnut Coffee Table'",
            },
            status: {
              type: "string",
              enum: ["in_progress", "completed", "sold"],
            },
            primary_material: { type: "string", description: "Primary material, e.g. 'Walnut', 'Oak'" },
            wood_type: { type: "string", description: "Wood species or type" },
            finish_type: { type: "string", description: "Finish applied, e.g. 'Oil', 'Lacquer', 'Wax'" },
            other_materials: { type: "string", description: "Other materials used" },
            hours_spent: { type: "number", description: "Hours of labour" },
            material_cost: { type: "number", description: "Cost of materials in dollars" },
            sale_price: { type: "number", description: "Sale price in dollars" },
            buyer_name: { type: "string", description: "Name of the buyer" },
            sold_via: { type: "string", description: "Platform or method of sale, e.g. 'Facebook', 'Etsy', 'Direct'" },
            notes: { type: "string", description: "Any other notes from the description" },
          },
          required: [],
        },
      },
    ],
    tool_choice: { type: "tool", name: "create_build" },
    messages: [
      {
        role: "user",
        content: `Parse this furniture build description: "${description}"`,
      },
    ],
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    return NextResponse.json({ error: "Failed to parse description" }, { status: 500 });
  }

  return NextResponse.json(toolUse.input);
}
