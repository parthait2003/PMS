import Owner from "@/models/Owner";
import connectMongoDB from "@/config/database";
import { NextResponse } from "next/server";
import crypto from "crypto"; // Import crypto for hashing

// Utility function to hash password
const hashPassword = (password: string) => {
  return crypto.createHash("md5").update(password).digest("hex");
};

// GET method to fetch a single owner by ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  await connectMongoDB();
  try {
    const owner = await Owner.findById(params.id);
    if (!owner) {
      return NextResponse.json({ message: "Owner not found" }, { status: 404 });
    }
    return NextResponse.json(owner, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching owner", error }, { status: 500 });
  }
}

// PUT method to update an owner by ID
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectMongoDB();
  try {
    const body = await req.json();

    // Get existing owner from database
    const existingOwner = await Owner.findById(params.id);
    if (!existingOwner) {
      return NextResponse.json({ message: "Owner not found" }, { status: 404 });
    }

    // Compare password: if it's different, then hash new password
    if (body.password && body.password !== existingOwner.password) {
      body.password = hashPassword(body.password);
    } else {
      body.password = existingOwner.password; // keep the old password
    }

    const updatedOwner = await Owner.findByIdAndUpdate(params.id, body, { new: true });
    
    return NextResponse.json(updatedOwner, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error updating owner", error }, { status: 500 });
  }
}

// DELETE method to remove an owner by ID
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await connectMongoDB();
  try {
    const deletedOwner = await Owner.findByIdAndDelete(params.id);
    if (!deletedOwner) {
      return NextResponse.json({ message: "Owner not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Owner deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting owner", error }, { status: 500 });
  }
}
