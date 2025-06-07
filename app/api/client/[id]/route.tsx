import Client from "@/models/Client";
import connectMongoDB from "@/config/database";
import { NextResponse } from "next/server";

// GET: Get a client by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoDB();
    const client = await Client.findById(params.id);
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    return NextResponse.json(client, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 });
  }
}

// PUT: Update a client by ID
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoDB();
    const body = await req.json();
    const updatedClient = await Client.findByIdAndUpdate(params.id, body, {
      new: true,
    });
    if (!updatedClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    return NextResponse.json(updatedClient, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}

// DELETE: Delete a client by ID
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoDB();
    const deletedClient = await Client.findByIdAndDelete(params.id);
    if (!deletedClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Client deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
  }
}
