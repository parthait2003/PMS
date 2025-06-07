import taskMessage from "@/models/TaskMessage";
import connectMongoDB from "@/config/database";
import { NextResponse } from "next/server";



// POST a new task message
export async function POST(req: Request) {
  try {
    await connectMongoDB();
    const body = await req.json();

    const newMessage = await taskMessage.create(body);

    return NextResponse.json(
      { success: true, data: newMessage },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create task message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create task message" },
      { status: 500 }
    );
  }
}


// GET task messages (optionally filter by projectId or taskId)
export async function GET(req: Request) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const taskId = searchParams.get("taskId");

    const filter: any = {};
    if (projectId) filter.projectId = projectId;
    if (taskId) filter.taskId = taskId;

    const messages = await taskMessage.find(filter).sort({ createdAt: -1 }); // newest first
    return NextResponse.json(
      { success: true, data: messages },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch task messages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch task messages" },
      { status: 500 }
    );
  }
}
