import Stage from "@/models/Stage"
import connectMongoDB from "@/config/database";
import { NextResponse } from "next/server";

// GET all stages
export async function GET() {
  try {
    await connectMongoDB();
    const stages = await Stage.find({});
    return NextResponse.json(stages);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stages" }, { status: 500 });
  }
}

// POST a new stage
export async function POST(req: Request) {
  try {
    await connectMongoDB();
    const { stage } = await req.json();
    const newStage = await Stage.create({ stage });
    return NextResponse.json(newStage, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create stage" }, { status: 500 });
  }
}
