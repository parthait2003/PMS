import Owner from "@/models/Owner"; // Adjust the import path based on your project structure
import connectMongoDB from "@/config/database";
import { NextResponse } from "next/server";
import crypto from "crypto";

const hashPassword = (password: string): string => {
  return crypto.createHash("md5").update(password).digest("hex");
};

// Utility function to set CORS headers
const setCORSHeaders = (response: NextResponse) => {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, GET, DELETE, PUT, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
};

// Handle OPTIONS preflight request
export async function OPTIONS() {
  const response = NextResponse.json({}, { status: 200 });
  setCORSHeaders(response);
  return response;
}

// GET method to fetch all owners
export async function GET() {
  await connectMongoDB();
  try {
    const owners = await Owner.find(); // If needed: add projection to exclude passwords
    const response = NextResponse.json({ owners }, { status: 200 });
    setCORSHeaders(response);
    return response;
  } catch (error) {
    console.error("Error fetching owners:", error);
    const response = NextResponse.json({ message: "Error fetching owners", error }, { status: 500 });
    setCORSHeaders(response);
    return response;
  }
}

// POST method to create new owner(s)
export async function POST(req: Request) {
  try {
    await connectMongoDB();
    const body = await req.json();
    console.log("Received Body:", body);

    const owners = Array.isArray(body) ? body : [body];

    // Validate required fields
    for (const owner of owners) {
      if (!owner.name || !owner.email || !owner.password || !owner.address || !owner.phone) {
        const response = NextResponse.json(
          { message: "All fields (name, email, password, address, phone) are required for all owners" },
          { status: 400 }
        );
        setCORSHeaders(response);
        return response;
      }
    }

    // Hash passwords and save
    const newOwners = await Promise.all(
      owners.map(ownerData => {
        const hashedPassword = hashPassword(ownerData.password);
        const newOwner = new Owner({
          name: ownerData.name,
          email: ownerData.email,
          password: hashedPassword,
          address: ownerData.address,
          phone: ownerData.phone,
        });
        return newOwner.save();
      })
    );

    const response = NextResponse.json(
      { message: "Owners created successfully", owners: newOwners },
      { status: 201 }
    );
    setCORSHeaders(response);
    return response;
  } catch (error) {
    console.error("Error creating owners:", error);
    const response = NextResponse.json({ message: "Error creating owners", error }, { status: 500 });
    setCORSHeaders(response);
    return response;
  }
}