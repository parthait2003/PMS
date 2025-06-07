import User from "@/models/User";
import Admin from "@/models/Admin";
import connectMongoDB from "@/config/database";
import { NextResponse } from "next/server";
import crypto from "crypto";

// The GET and POST methods
export async function GET() {
  try {
    await connectMongoDB(); // Ensure the database is connected
    const users = await User.find(); // Only fetching from User collection
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching users" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectMongoDB();
    const { username, email, password, usertype } = await req.json();
    console.log("Received user creation data:", { username, email, usertype });
    
    if (!email || !password || !usertype) {
      return NextResponse.json(
        { message: "Email, password, and usertype are required." },
        { status: 400 }
      );
    }

    const hashedPassword = crypto.createHash("md5").update(password).digest("hex");

    const newUser = new User({
      username: username || "", // fallback if admin has no username
      email,
      password: hashedPassword,
      usertype,
    });

    await newUser.save();

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    const message = error?.message?.includes("duplicate key")
      ? "Email already exists."
      : "Error creating user.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

