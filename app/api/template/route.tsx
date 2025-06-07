import Template from "@/models/Template"; // Adjust the import path based on your project structure
import connectMongoDB from "@/config/database";
import { NextResponse } from "next/server";

// Connect to MongoDB
await connectMongoDB();

// GET all templates
export async function GET() {
  try {
    const templates = await Template.find();
    return NextResponse.json(templates, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching templates', error }, { status: 500 });
  }
}

// POST a new template
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newTemplate = new Template(body);
    await newTemplate.save();
    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating template', error }, { status: 400 });
  }
}

// DELETE a template by ID (expects ?id=templateId in query)
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: 'Template ID is required' }, { status: 400 });
  }

  try {
    const deleted = await Template.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: 'Template not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Template deleted', id }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting template', error }, { status: 500 });
  }
}
