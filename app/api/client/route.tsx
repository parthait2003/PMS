import Client from "@/models/Client";
import connectMongoDB from "@/config/database";
import { NextResponse } from "next/server";

// GET: Fetch all clients
export async function GET() {
  try {
    await connectMongoDB();
    const clients = await Client.find();
    return NextResponse.json(clients, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

// POST: Create a new client
export async function POST(req: Request) {
  try {
    await connectMongoDB();
    const body = await req.json();
    const newClient = await Client.create(body);
    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
