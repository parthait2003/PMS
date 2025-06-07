import { NextResponse } from "next/server";
import projectTask from "@/models/projectTask";
import connectMongoDB from "@/config/database";

// Middleware to ensure DB is connected
async function ensureDBConnection() {
  await connectMongoDB();
}

// GET a single task by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  await ensureDBConnection();
  try {
    const task = await projectTask.findById(params.id);
    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }
    return NextResponse.json(task, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching task", error },
      { status: 500 }
    );
  }
}

// PUT - update a task by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  await ensureDBConnection();
  try {
    const data = await request.json();
    const updatedTask = await projectTask.findByIdAndUpdate(params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!updatedTask) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }
    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating task", error },
      { status: 400 }
    );
  }
}

// DELETE a task by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await ensureDBConnection();
  try {
    const deletedTask = await projectTask.findByIdAndDelete(params.id);
    if (!deletedTask) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Task deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting task", error },
      { status: 500 }
    );
  }
}
