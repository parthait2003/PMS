"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DataTable } from "mantine-datatable";
import { Modal, Select } from '@mantine/core';
import IconEye from "@/components/icon/icon-eye";
import IconPencil from "@/components/icon/icon-pencil";

const TasksByProject = () => {
  const { id: projectId } = useParams(); // Get project ID from URL
  const [tasks, setTasks] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedStatus, setEditedStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  

  useEffect(() => {
    if (projectId) {
      console.log("Project ID from URL:", projectId); // Debug: Log projectId
      fetchTasksByProject();
    } else {
      setError("No project ID provided in the URL.");
      setLoading(false);
    }
  }, [projectId]);

  const handleStatusSave = async (taskId: string) => {
    try {
      // Fetch the current project
      const res = await fetch(`/api/project/${projectId}`);
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const project = await res.json();
  
      // Modify the tasks array: update the status of the selected task
      const updatedTasks = project.tasks.map((task: any) =>
        task._id === taskId ? { ...task, status: editedStatus } : task
      );
  
      // Send updated tasks to backend
      const updateRes = await fetch(`/api/project/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...project,
          tasks: updatedTasks,
        }),
      });
  
      if (!updateRes.ok) {
        throw new Error(`Failed to update task status: ${updateRes.status}`);
      }
  
      const updatedProject = await updateRes.json();
  
      // Enrich tasks with projectName before setting state
      const enrichedTasks = updatedProject.tasks.map((task: any) => ({
        ...task,
        projectName: updatedProject.project || "Unknown Project",
      }));
  
      // Update UI
      setTasks(enrichedTasks);
      setProjectName(updatedProject.project || "Unknown Project");
      console.log("Task status updated successfully");
      setEditingTaskId(null); // Reset editing state
      setIsModalOpen(false); // Close modal
    } catch (err) {
      console.error("Error saving task status:", err);
      setError("Failed to update task status. Please try again.");
    }
  };
  
  

  const fetchTasksByProject = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/project");
      if (!res.ok) {
        throw new Error(`API request failed with status ${res.status}`);
      }
      const response = await res.json();
      console.log("API Response:", response); // Debug: Log full response

      if (!response.success || !Array.isArray(response.data)) {
        throw new Error("Invalid API response structure.");
      }

      // Find the project with matching _id
      const project = response.data.find((p) => p._id === projectId);
      console.log("Found Project:", project); // Debug: Log found project

      if (!project) {
        console.error("No project found for ID:", projectId);
        setError("Project not found.");
        setTasks([]);
        setProjectName("");
        return;
      }

      // Extract tasks and add project name
      const projectTasks = (project.tasks || []).map((task) => {
        console.log("Task:", task); // Debug: Log each task
        return {
          ...task,
          projectName: project.project || "Unknown Project",
        };
      });

      setTasks(projectTasks);
      setProjectName(project.project || "Unknown Project");
      setError(null);
    } catch (err) {
      console.error("Failed to fetch project tasks:", err);
      setError("Failed to load project tasks. Please try again.");
      setTasks([]);
      setProjectName("");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="panel mt-6">
        <h5 className="mb-5 text-lg font-semibold dark:text-white-light">
          Loading...
        </h5>
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel mt-6">
        <h5 className="mb-5 text-lg font-semibold dark:text-white-light">
          Error
        </h5>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="panel mt-6">
      <h5 className="mb-5 text-lg font-semibold dark:text-white-light">
        Tasks for Project: {projectName}
      </h5>
      <Modal
  opened={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Edit Task Status"
  centered
>
  <div className="space-y-4">
    <Select
      label="Status"
      value={editedStatus}
      onChange={setEditedStatus}
      data={[
        { value: "upcoming", label: "Upcoming" },
        { value: "current", label: "Current" },
        { value: "completed", label: "Completed" },
      ]}
      placeholder="Select status"
    />

    <button
      className="btn btn-primary mt-2"
      onClick={() => {
        handleStatusSave(editingTaskId);
        setIsModalOpen(false);
      }}
    >
      Save
    </button>
  </div>
</Modal>

      <DataTable
        records={tasks}
        columns={[
          {
            accessor: "title",
            title: "Task Title",
            render: (row) => row.title || "-",
          },
          {
            accessor: "stage",
            title: "Stage",
            render: (row) => row.stage || "-",
          },
          {
            accessor: "status",
            title: "Status",
            render: (row) => row.status || "-",
          },
          {
            accessor: "startDate",
            title: "Start Date",
            render: (row) => row.startDate || "-",
          },
          {
            accessor: "dueDate",
            title: "Due Date",
            render: (row) => row.dueDate || "-",
          },
          {
            accessor: "projectName",
            title: "Project Name",
            render: (row) => row.projectName || "-",
          },
          {
            accessor: "actions",
            title: "Actions",
            render: (row) => {
              const isEditing = editingTaskId === row._id;
          
              return (
                <div className="flex items-center gap-2">
                  <button
                    className="btn btn-sm btn-info"
                    onClick={() => {
                      console.log("Navigating to task:", row._id);
                      window.location.href = `/viewtask/assignees/${row._id}`;
                    }}
                  >
                    <IconEye />
                  </button>
          
                  <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              setEditingTaskId(row._id);
              setEditedStatus(row.status);
              setIsModalOpen(true);
            }}
          >
            <IconPencil />
          </button>
                </div>
              );
            },
          }
          
        ]}
        noRecordsText="No tasks found for this project."
      />
    </div>
  );
};

export default TasksByProject;