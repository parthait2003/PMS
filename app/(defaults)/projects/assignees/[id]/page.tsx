"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DataTable } from "mantine-datatable";
import IconEye from "@/components/icon/icon-eye";

const ProjectsByOwner = () => {
  const { id: ownerId } = useParams(); // Get owner ID from URL
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (ownerId) {
      fetchProjectsByAssignee();
    }
  }, [ownerId]);

  const fetchProjectsByAssignee = async () => {
    try {
      // Fetch templates first
      const templateRes = await fetch("/api/template");
      const templateData = await templateRes.json();
      const templates = Array.isArray(templateData)
        ? templateData.map((t) => ({ id: t._id, title: t.template }))
        : [];

      // Fetch projects
      const res = await fetch("/api/project");
      const { data } = await res.json();

      // Filter projects where the current user is an assignee
      const assignedProjects = data.filter((project) =>
        project.assignees.some((assignee) => assignee.id === ownerId)
      );

      // Map projects to include template title
      const mappedProjects = assignedProjects
        .map((project) => {
          const template = templates.find((t) => t.id === project.template);
          return {
            ...project,
            id: project._id || project.id,
            templateTitle: template?.title || "-",
          };
        })
        .filter((p) => p.id);

      setProjects(mappedProjects);
    } catch (err) {
      console.error("Failed to fetch projects or templates:", err);
    }
  };

  return (
    <div className="panel mt-6">
      <h5 className="mb-5 text-lg font-semibold dark:text-white-light">
        Projects Assigned to You
      </h5>
      <DataTable
        records={projects}
        columns={[
          {
            accessor: "project",
            title: "Project Name",
            render: (row) => row.project || "-",
          },
          {
            accessor: "template",
            title: "Template",
            render: (row) => row.templateTitle || "-",
          },
          {
            accessor: "assignees",
            title: "Client",
            render: (row) =>
              Array.isArray(row.assignees) && row.assignees.length > 0
                ? row.assignees.map((a) => a.name).join(", ")
                : "-",
          },
          {
            accessor: "tasks",
            title: "Tasks",
            render: (row) =>
              row.tasks.map((task) => `${task.title}`).join(", ") || "-",
          },
          {
            accessor: "actions",
            title: "Actions",
            render: (row) => (
              <div className="flex space-x-2">
                <button
                  className="btn btn-sm btn-info"
                  onClick={() =>
                    (window.location.href = `/tasks/assignees/${row._id}`)
                  }
                >
                  <IconEye />
                </button>
              </div>
            ),
          },
        ]}
        noRecordsText="No projects assigned."
      />
    </div>
  );
};

export default ProjectsByOwner;