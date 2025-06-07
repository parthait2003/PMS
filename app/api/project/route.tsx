import Project from "@/models/Project";
import projectTask from "@/models/ProjectTask";
import taskMessage from "@/models/TaskMessage";
import connectMongoDB from "@/config/database";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// Utility to generate an 8-digit random number as string
function generate8DigitId(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// GET all projects
export async function GET() {
  try {
    await connectMongoDB();
    const projects = await Project.find();
    return NextResponse.json(
      { success: true, data: projects },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST a new project and insert projectTask + taskMessage entries
export async function POST(req: Request) {
  try {
    await connectMongoDB();
    const body = await req.json();
    const { tasks, ...projectData } = body;

    // First create the project with empty tasks array
    const newProject = await Project.create({
      ...projectData,
      tasks: [],
    });

    // Process tasks if they exist
    if (Array.isArray(tasks) && tasks.length > 0) {
      const projectTasks = [];

      for (const task of tasks) {
        // Generate a single MongoDB ObjectId to use across all related documents
        const taskObjectId = new mongoose.Types.ObjectId();
        const stringId = generate8DigitId();

        // Create the task object for embedding in Project
        const formattedTask = {
          _id: taskObjectId, // Use the same ObjectId here
          title: task.title || "",
          stage: task.stage || "Not Started",
          status: task.status || "current",
          details: task.details || "",
          startDate: task.startDate || new Date().toLocaleDateString(),
          dueDate: task.dueDate || new Date().toLocaleDateString(),
          stringId: stringId,
        };

        // Add to the array of tasks to be saved in the Project
        projectTasks.push(formattedTask);

        // Create a separate projectTask document with the same ObjectId
        // IMPORTANT: Use insertMany with _id explicitly set instead of create()
        await projectTask.insertMany([
          {
            _id: taskObjectId, // Same ObjectId as in Project
            title: formattedTask.title,
            stage: formattedTask.stage,
            status: formattedTask.status,
            details: formattedTask.details,
            startDate: formattedTask.startDate,
            dueDate: formattedTask.dueDate,
            projectId: newProject._id,
            stringId: stringId,
          },
        ]);

        console.log("Inserted projectTask _id:", taskObjectId.toString());

        // Create a message document linked to the task - also use insertMany
        await taskMessage.insertMany([
          {
            projectId: newProject._id,
            taskId: taskObjectId, // Same ObjectId as task
            assigneeId: projectData.assignees?.[0]?.id || "",
            senderId: projectData.assignedBy || "",
            message: "",
            files: [],
          },
        ]);

        console.log("Inserted taskMessage.taskId:", taskObjectId.toString());

        // Optional verification
        const savedTask = await projectTask.findById(taskObjectId);
        const savedMessage = await taskMessage.findOne({
          taskId: taskObjectId,
        });

        if (savedTask && savedMessage) {
          console.log("Verification successful:");
          console.log("Task _id:", savedTask._id.toString());
          console.log("Message taskId:", savedMessage.taskId.toString());

          // Ensure they match
          if (savedTask._id.toString() !== savedMessage.taskId.toString()) {
            console.error("ERROR: IDs still don't match!");
          } else {
            console.log("SUCCESS: IDs match correctly!");
          }
        } else {
          console.error("Verification failed - documents not found");
        }
      }

      // Update the project with the tasks array
      await Project.findByIdAndUpdate(newProject._id, { tasks: projectTasks });

      // Refresh the project data
      const updatedProject = await Project.findById(newProject._id);

      return NextResponse.json(
        { success: true, data: updatedProject },
        { status: 201 }
      );
    } else {
      // If no tasks, just return the created project
      return NextResponse.json(
        { success: true, data: newProject },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create project with tasks and messages",
        details: error.message,
      },
      { status: 500 }
    );
  }
}



// PATCH: update a task in project and related collections
export async function PATCH(req: Request) {
  try {
    await connectMongoDB();
    const body = await req.json();
    const { taskId, updates } = body;

    if (!taskId || !updates) {
      return NextResponse.json(
        { success: false, error: "Missing taskId or updates" },
        { status: 400 }
      );
    }

    // 1. Update in projectTask collection
    await projectTask.findByIdAndUpdate(taskId, updates);

    // 2. Update embedded task in Project.tasks
    await Project.updateOne(
      { "tasks._id": taskId },
      {
        $set: Object.fromEntries(
          Object.entries(updates).map(([key, value]) => [`tasks.$.${key}`, value])
        ),
      }
    );

    // 3. (Optional) Update taskMessage if fields like assigneeId or message are included
    if (updates.assigneeId || updates.message) {
      await taskMessage.updateOne(
        { taskId },
        {
          $set: {
            ...(updates.assigneeId && { assigneeId: updates.assigneeId }),
            ...(updates.message && { message: updates.message }),
          },
        }
      );
    }

    return NextResponse.json({ success: true, message: "Task updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update task",
        details: error.message,
      },
      { status: 500 }
    );
  }
}



// PUT: Add a new task to a specific project
export async function PUT(req: Request) {
  try {
    await connectMongoDB();
    const body = await req.json();
    const { projectId, task } = body;

    if (!projectId || !task) {
      return NextResponse.json(
        { success: false, error: "Missing projectId or task" },
        { status: 400 }
      );
    }

    const taskObjectId = new mongoose.Types.ObjectId();
    const stringId = generate8DigitId();

    const formattedTask = {
      _id: taskObjectId,
      title: task.title || "",
      stage: task.stage || "Not Started",
      status: task.status || "current",
      details: task.details || "",
      startDate: task.startDate || new Date().toLocaleDateString(),
      dueDate: task.dueDate || new Date().toLocaleDateString(),
      stringId: stringId,
    };

    // 1. Insert into projectTask collection
    await projectTask.create({
      ...formattedTask,
      projectId,
    });

    // 2. Add to Project's embedded tasks array
    await Project.findByIdAndUpdate(projectId, {
      $push: { tasks: formattedTask },
    });

    // 3. Add taskMessage entry
    const project = await Project.findById(projectId);
    const assigneeId = project?.assignees?.[0]?.id || "";
    const senderId = project?.assignedBy || "";

    await taskMessage.create({
      projectId,
      taskId: taskObjectId,
      assigneeId,
      senderId,
      message: "",
      files: [],
    });

    return NextResponse.json(
      { success: true, message: "Task added successfully", taskId: taskObjectId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding task:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add task", details: error.message },
      { status: 500 }
    );
  }
}


// DELETE: Remove a task from projectTask, Project.tasks, and taskMessage
export async function DELETE(req: Request) {
  try {
    await connectMongoDB();
    const { taskId, projectId } = await req.json();

    if (!taskId || !projectId) {
      return NextResponse.json(
        { success: false, error: "Missing taskId or projectId" },
        { status: 400 }
      );
    }

    // 1. Remove task from projectTask collection
    await projectTask.findByIdAndDelete(taskId);

    // 2. Remove task from embedded tasks array in Project
    await Project.findByIdAndUpdate(projectId, {
      $pull: { tasks: { _id: new mongoose.Types.ObjectId(taskId) } },
    });

    // 3. Remove associated task messages
    await taskMessage.deleteMany({ taskId });

    return NextResponse.json(
      { success: true, message: "Task deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete task", details: error.message },
      { status: 500 }
    );
  }
}

