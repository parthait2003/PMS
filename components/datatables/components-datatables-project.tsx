"use client";
import { useEffect, useState, useRef, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { DataTable } from "mantine-datatable";
import Select from "react-select";
import IconPlus from "@/components/icon/icon-plus";
import IconPencil from "../icon/icon-pencil";
import IconTrash from "@/components/icon/icon-trash";
import IconEye from "../icon/icon-eye";
import Swal from "sweetalert2";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { format } from "date-fns";
import CreatableSelect from "react-select/creatable";


const ComponentsDatatablesProject = () => {
  const [stages, setStages] = useState([]);
  const stageOptions = stages.map((stage) => ({
    value: stage,
    label: stage,
  }));



  const startDateRef = useRef(null);
  const dueDateRef = useRef(null);
  const [modal, setModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    template: "",
    projectName: "",
    dueDate: "",
    assignees: [],
    tasks: [],
    assignedBy: "",
  });
  const [projects, setProjects] = useState([]);
  const [owners, setOwners] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [taskModal, setTaskModal] = useState(false);
  const [templateTasks, setTemplateTasks] = useState([]);

  useEffect(() => {
    fetchTemplates();
    fetchOwners();
    fetchProjects();
    fetchStages();

    if (startDateRef.current && dueDateRef.current) {
      Flatpickr(startDateRef.current, { dateFormat: "Y-m-d" });
      Flatpickr(dueDateRef.current, { dateFormat: "Y-m-d" });
    }
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/project");
      const result = await response.json();
      console.log("API Response:", result); // Inspect the entire response

      // Access the `data` field where the actual array is stored
      const data = result.data;
      console.log("Data:", data);

      if (!Array.isArray(data)) {
        console.error("Expected an array in 'data', but got:", data);
        return;
      }

      const templateRes = await fetch("/api/template");
      const templateData = await templateRes.json();

      const mapped = data
        .map((project) => {
          const template = templateData.find((t) => t._id === project.template);
          return {
            ...project,
            id: project._id || project.id,
            templateTitle: template?.template || "-",
          };
        })
        .filter((p) => p.id);

      setProjects(mapped);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchStages = async () => {
    try {
      const res = await fetch("/api/stage");
      const data = await res.json();
      console.log("fetched data is:", data);
      if (Array.isArray(data)) {
        setStages(data.map((s) => s.stage));
      }
    } catch (error) {
      console.error("Error fetching stages:", error);
    }
  };




  const fetchOwners = async () => {
    try {
      const response = await fetch("/api/owner");
      const data = await response.json();
      setOwners(data.owners || []);
    } catch (error) {
      console.error("Error fetching owners:", error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/template");
      const data = await response.json();
      const templates = Array.isArray(data)
        ? data.map((t) => ({ id: t._id, title: t.template }))
        : [];
      setTemplates(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      setTemplates([]);
    }
  };

  const handleAddClick = () => {
    const assignedBy = localStorage.getItem("userId") || "Unknown";
    setFormData({
      id: null,
      template: "",
      projectName: "",
      assignees: [],
      tasks: [],
      assignedBy,
    });
    setIsEditMode(false);
    setModal(true);
  };

  const handleEditClick = (id) => {
    const projectToEdit = projects.find((project) => project.id === id);
    const assignedBy = localStorage.getItem("userId") || "Unknown";


    if (projectToEdit) {
      setFormData({
        id: projectToEdit.id,
        template: projectToEdit.template || "",
        projectName: projectToEdit.project,
        assignees: projectToEdit.assignees,
        tasks: projectToEdit.tasks || [],
        assignedBy,
      });
      setIsEditMode(true);
      setModal(true);
    } else {
      Swal.fire("Error", "Project not found", "error");
    }
  };

  const handleDeleteClick = async (id) => {
    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmDelete.isConfirmed) {
      try {
        const response = await fetch(`/api/project/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          Swal.fire("Deleted!", "Your project has been deleted.", "success");
          fetchProjects();
        } else {
          Swal.fire("Error!", "Failed to delete project.", "error");
        }
      } catch (error) {
        console.error("Error deleting project:", error);
        Swal.fire("Error!", "Failed to delete project.", "error");
      }
    }
  };

  const assigneeOptions = owners.map((owner) => ({
    value: owner._id,
    label: owner.name,
  }));

  const handleAssigneesChange = (selected) => {
    const selectedAssignees = selected.map((item) => ({
      id: item.value,
      name: item.label,
    }));

    setFormData((prev) => ({
      ...prev,
      assignees: selectedAssignees,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.projectName.trim() ||
      !formData.assignees.length ||
      !formData.template
    ) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "All fields are required",
      });
      return;
    }

    try {
      // Fetch existing stages
      const stageRes = await fetch("/api/stage");
      const stageData = await stageRes.json();
      const existingStages = (stageData || []).map((s) => s.stage.toLowerCase());

      // Get unique new stages from formData.tasks
      // Get stages that are already part of the selected template's tasks
      const templateStageSet = new Set(templateTasks.map((t) => t.stage?.trim().toLowerCase()));

      // Get unique new stages from manually added tasks only
      const newStages = [
        ...new Set(
          formData.tasks
            .filter((task) => !templateStageSet.has(task.stage?.trim().toLowerCase())) // exclude template stages
            .map((task) => task.stage?.trim())
            .filter((stage) => stage && !existingStages.includes(stage.toLowerCase()))
        ),
      ];


      // Post new stages
      for (const stage of newStages) {
        await fetch("/api/stage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage }),
        });
      }

      // ✅ Add this to update dropdown immediately
if (newStages.length > 0) {
  await fetchStages();
}


      const method = isEditMode ? "PUT" : "POST";
      const endpoint = isEditMode
        ? `/api/project/${formData.id}`
        : "/api/project";

      const payload = {
        template: formData.template,
        project: formData.projectName,
        assignees: formData.assignees,
        tasks: formData.tasks || [],
        assignedBy: formData.assignedBy,
      };

      if (isEditMode) {
        payload.id = formData.id;
      }

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: isEditMode
            ? "Project updated successfully!"
            : "Project added successfully!",
          timer: 1500,
          showConfirmButton: false,
        });
        setModal(false);
        fetchProjects();
      } else {
        const data = await response.json();
        Swal.fire("Error", data.message || "Failed to save project", "error");
      }
    } catch (error) {
      console.error("Error saving project:", error);
      Swal.fire("Error", "Failed to save project", "error");
    }
  };


  const handleAddTask = () => {
    setFormData((prev) => ({
      ...prev,
      tasks: [
        ...prev.tasks,
        {
          title: "",

          stage: "",
          status: "",
          details: "",
          startDate: "",
          dueDate: "",
        },
      ],
    }));
  };

  const handleTemplateChange = async (e) => {
    const selectedTemplateId = e.target.value;

    setFormData((prev) => ({
      ...prev,
      template: selectedTemplateId,
    }));

    if (!selectedTemplateId) {
      setTemplateTasks([]);
      setFormData((prev) => ({
        ...prev,
        tasks: [],
      }));
      return;
    }

    try {
      // 🔥 Fetch all tasks
      const response = await fetch(`/api/task`);
      const allTasks = await response.json();

      console.log("All fetched tasks:", allTasks);

      // 🔥 Filter tasks where templateId matches selectedTemplateId
      const filteredTasks = allTasks.filter(
        (task) => task.templateId === selectedTemplateId
      );

      if (filteredTasks.length > 0) {
        setTemplateTasks(filteredTasks);
        setFormData((prev) => ({
          ...prev,
          tasks: filteredTasks,
        }));

        const taskTitles = filteredTasks.map((task) => task.title).join(", ");
        alert(`Tasks from selected template: ${taskTitles}`);
      } else {
        setTemplateTasks([]);
        setFormData((prev) => ({
          ...prev,
          tasks: [],
        }));

        alert("No tasks found for the selected template.");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTemplateTasks([]);
      setFormData((prev) => ({
        ...prev,
        tasks: [],
      }));

      alert("Failed to load tasks.");
    }
  };

  const handleTaskChange = (index, field, value) => {
    const updatedTasks = [...formData.tasks];
    updatedTasks[index][field] = value;
    setFormData((prev) => ({ ...prev, tasks: updatedTasks }));
  };

  const handleRemoveTask = (index) => {
    const updatedTasks = [...formData.tasks];
    updatedTasks.splice(index, 1);
    setFormData((prev) => ({ ...prev, tasks: updatedTasks }));
  };

  return (
    <div className="panel mt-6">
      <h5 className="mb-5 text-lg font-semibold dark:text-white-light">
        Projects
      </h5>

      <div className="mb-4 flex gap-4">
        <button className="btn btn-primary" onClick={handleAddClick}>
          <IconPlus /> Add Project
        </button>
      </div>

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
              row.tasks.map((task) => `${task.title} `).join(", ") || "-",
          },
          {
            accessor: "id",
            title: "Actions",
            render: (row) => (
              <div className="flex space-x-2">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => handleEditClick(row._id)}
                >
                  <IconPencil />
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteClick(row._id)}
                >
                  <IconTrash />
                </button>
                <button
                  className="btn btn-sm btn-info"
                  onClick={() =>
                    (window.location.href = `/viewtask/project/${row._id}`)
                  }
                >
                  <IconEye />
                </button>
              </div>
            ),
          },
        ]}
      />

      {/* Modal */}
      <Transition appear show={modal} as={Fragment}>
        <Dialog as="div" open={modal} onClose={() => setModal(false)}>
          <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
            <div className="flex min-h-screen items-start justify-center px-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                  <div className="flex items-center justify-between border-b px-5 py-3">
                    <h5 className="text-lg font-bold">
                      {isEditMode ? "Edit Project" : "Add Project"}
                    </h5>
                    <button onClick={() => setModal(false)}>X</button>
                  </div>
                  <div className="p-5">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label htmlFor="projectName">Project Name</label>
                        <input
                          type="text"
                          id="projectName"
                          name="projectName"
                          value={formData.projectName}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Enter project name"
                        />
                      </div>
                      <div>
                        <label htmlFor="template">Template</label>
                        <select
                          id="template"
                          name="template"
                          value={formData.template}
                          onChange={handleTemplateChange}
                          className="form-select"
                          required
                        >
                          <option value="">Select Template</option>
                          {templates.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label>Client</label>
                        <Select
                          isMulti
                          options={assigneeOptions}
                          onChange={handleAssigneesChange}
                          value={formData.assignees.map((a) => ({
                            value: a.id,
                            label: a.name,
                          }))}
                          placeholder="Select assignees"
                          className="form-select"
                        />
                      </div>

                      {/* Tasks section */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <label>Tasks</label>
                        </div>

                        {formData.tasks.map((task, index) => (
                          <div
                            key={index}
                            className="mb-2 rounded-md border p-3"
                          >
                            <div className="mb-2">
                              <label>Title</label>
                              <input
                                type="text"
                                placeholder="Title"
                                value={task.title}
                                onChange={(e) =>
                                  handleTaskChange(
                                    index,
                                    "title",
                                    e.target.value
                                  )
                                }
                                className="form-input mb-2"
                              />
                            </div>
                            <div className="mb-2">
                              <label>Stage</label>
                              <CreatableSelect
                                isClearable
                                onChange={(selected) => {
                                  const value = selected?.value || "";
                                  handleTaskChange(index, "stage", value);
                                }}
                                options={stageOptions}
                                value={
                                  task.stage
                                    ? { value: task.stage, label: task.stage }
                                    : null
                                }
                                placeholder="Select or create stage"
                                className="form-select"
                              />
                            </div>

                            <div className="mb-2">
                              <label>Status</label>
                              <select
                                value={task.status}
                                onChange={(e) =>
                                  handleTaskChange(
                                    index,
                                    "status",
                                    e.target.value
                                  )
                                }
                                className="form-select"
                              >
                                <option value="">Select status</option>
                                <option value="complete">Complete</option>
                                <option value="current">Current</option>
                                <option value="upcoming">Upcoming</option>
                              </select>
                            </div>
                            <div className="mb-2">
                              <label>Details</label>
                              <textarea
                                placeholder="Details"
                                value={task.details}
                                onChange={(e) =>
                                  handleTaskChange(
                                    index,
                                    "details",
                                    e.target.value
                                  )
                                }
                                className="form-input mb-2"
                              />
                            </div>
                            <div className="mb-2">
                              <label>Start Time</label>
                              <Flatpickr
                                options={{ dateFormat: "m/d/Y" }}
                                value={task.startDate}
                                onChange={([date]) => {
                                  const formatted = format(date, "MM/dd/yyyy");
                                  handleTaskChange(index, "startDate", format(date, "MM/dd/yyyy"))

                                }}
                                className="form-input mb-2"
                              />
                            </div>
                            <div>
                              <label>Due Date</label>
                              <Flatpickr
                                options={{ dateFormat: "m/d/Y" }}
                                value={task.dueDate}
                                onChange={([date]) => {
                                  const formatted = format(date, "MM/dd/yyyy");
                                  handleTaskChange(index, "dueDate", format(date, "MM/dd/yyyy"))
                                }}
                                className="form-input"
                              />
                            </div>
                            <div>
                              <button
                                type="button"
                                className="btn btn-xs btn-danger"
                                onClick={() => handleRemoveTask(index)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}

                        <div className="mt-4">
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={handleAddTask}
                          >
                            + Add Task
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary mt-6 w-full"
                      >
                        {isEditMode ? "Update Project" : "Create Project"}
                      </button>
                    </form>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default ComponentsDatatablesProject;
