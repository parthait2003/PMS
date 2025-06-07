import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectMongoDB from "@/config/database";
import User from "@/models/User";
import Owner from "@/models/Owner"

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  console.log("Received login data:", { email, password });

  const hashedPassword = crypto.createHash("md5").update(password).digest("hex");
  console.log("Hashed password:", hashedPassword);

  try {
    await connectMongoDB();

    const user = await User.findOne({ email: email, password: hashedPassword });

    if (user) {
      console.log("User authenticated successfully:", user);

      const response = NextResponse.json(
        {
          message: `Login successful (${user.usertype})`,
          role: user.usertype,
          userId: user._id,
        },
        { status: 200 }
      );

      response.cookies.set("auth", "true", { httpOnly: true });
      return response;
    }



   // Developer login attempt (fixed)
const dev = await Owner.findOne({ email: email, password: hashedPassword });

if (dev) {
  console.log("Developer authenticated successfully:", dev);

  const response = NextResponse.json(
    {
      message: "Login successful (developer)",
      role: "developer",
      userId: dev._id,
    },
    { status: 200 }
  );

  response.cookies.set("auth", "true", { httpOnly: true });
  return response;
}

 
     // If no matching user is found or passwords don't match
     console.log("Invalid credentials, no matching user found.");
     return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
 
   } catch (error) {
     console.error("Login error:", error);
     return NextResponse.json({ message: "Server error during authentication." }, { status: 500 });
   }
 }
