import Task from "@/models/task";
import connectMongoDB from "@/config/database";
import { NextResponse } from "next/server";

// GET - Fetch a specific task by its ID
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectMongoDB();
    const task = await Task.findById(params.id);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

// PUT - Update a specific task by its ID
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectMongoDB();
    const body = await req.json();

    const updatedTask = await Task.findByIdAndUpdate(params.id, body, { new: true });

    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// DELETE - Delete a specific task by its ID
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectMongoDB();
    const deletedTask = await Task.findByIdAndDelete(params.id);

    if (!deletedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
