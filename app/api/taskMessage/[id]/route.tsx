// app/api/taskMessage/[id]/route.ts
import taskMessage from "@/models/taskMessage";
import connectMongoDB from "@/config/database";
import { NextResponse } from "next/server";

// GET - Fetch a specific task message by its ID
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectMongoDB();
    const message = await taskMessage.findById(params.id);

    if (!message) {
      return NextResponse.json({ error: "Task message not found" }, { status: 404 });
    }

    return NextResponse.json(message, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch task message" }, { status: 500 });
  }
}

// PUT - Update a specific task message by its ID
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectMongoDB();
    const body = await req.json();

    const updatedMessage = await taskMessage.findByIdAndUpdate(params.id, body, { new: true });

    if (!updatedMessage) {
      return NextResponse.json({ error: "Task message not found" }, { status: 404 });
    }

    return NextResponse.json(updatedMessage, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update task message" }, { status: 500 });
  }
}

// DELETE - Delete a specific task message by its ID
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectMongoDB();
    const deletedMessage = await taskMessage.findByIdAndDelete(params.id);

    if (!deletedMessage) {
      return NextResponse.json({ error: "Task message not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task message deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete task message" }, { status: 500 });
  }
}
