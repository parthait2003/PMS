import projectTask from "@/models/ProjectTask";
import connectMongoDB from "@/config/database"; // Your MongoDB connection utility
import { NextResponse } from "next/server";

// Connect to MongoDB
await connectMongoDB();

// GET all project tasks
export async function GET() {
  try {
    const tasks = await projectTask.find();
    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching project tasks", error },
      { status: 500 }
    );
  }
}

// POST a new project task
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received task POST:", body);
    const newTask = new projectTask(body);
    await newTask.save();
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating project task", error },
      { status: 400 }
    );
  }
}
