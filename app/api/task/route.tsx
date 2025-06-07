import Task from "@/models/task";
import connectMongoDB from "@/config/database";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongoDB();
    const tasks = await Task.find();
    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectMongoDB();
    const body = await req.json();
    const newTask = await Task.create(body);
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
