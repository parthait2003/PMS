import Template from "@/models/Template";
import connectMongoDB from "@/config/database";
import { NextResponse } from "next/server";

// GET method to fetch a single template by ID
export async function GET(req, { params }) {
  await connectMongoDB();
  try {
    const template = await Template.findById(params.id);
    if (!template) {
      return NextResponse.json({ message: "Template not found" }, { status: 404 });
    }
    return NextResponse.json(template, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching template", error }, { status: 500 });
  }
}

// PUT method to update a template by ID
export async function PUT(req, { params }) {
  await connectMongoDB();
  try {
    const body = await req.json();
    console.log("PUT Request - ID:", params.id, "Body:", body); // Debug log

    // Remove 'id' from the update body to avoid conflicts
    const { id, ...updateData } = body;

    const updatedTemplate = await Template.findByIdAndUpdate(params.id, updateData, { new: true });
    if (!updatedTemplate) {
      console.log("Template not found for ID:", params.id);
      return NextResponse.json({ message: "Template not found" }, { status: 404 });
    }

    console.log("Updated Template:", updatedTemplate); // Debug log
    return NextResponse.json(updatedTemplate, { status: 200 });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ message: "Error updating template", error: error.message }, { status: 500 });
  }
}

// DELETE method to remove a template by ID
export async function DELETE(req, { params }) {
  await connectMongoDB();
  try {
    const deletedTemplate = await Template.findByIdAndDelete(params.id);
    if (!deletedTemplate) {
      return NextResponse.json({ message: "Template not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Template deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting template", error }, { status: 500 });
  }
}