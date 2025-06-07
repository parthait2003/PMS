"use client";
import MultiStepProgressBar from "@/components/datatables/components-datatables-multiprogressbar";
import { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { DataTable } from "mantine-datatable";
import Swal from "sweetalert2";
import IconPlus from "@/components/icon/icon-plus";
import IconPencil from "@/components/icon/icon-pencil";
import IconTrash from "@/components/icon/icon-trash";
import IconEye from "@/components/icon/icon-eye";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import CreatableSelect from "react-select/creatable";

const ComponentsDatatablesTask = () => {
  const [stageOptions, setStageOptions] = useState([]);
  const router = useRouter();
  const [modal, setModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [owners, setOwners] = useState([]);
  const [projects, setProjects] = useState([]);
  const { id: projectId } = useParams();
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    stage: "",
    status: "",
    details: "",
    startDate: "",
    dueDate: "",
    projectId: "",
  });
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    fetchTasks();
    fetchOwners();
    fetchProjects();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/project");
      const data = await res.json();
      if (data.success && data.data) {
        const project = data.data.find(
          (project) => String(project._id) === String(projectId)
        );
        if (project) {
          const projectTasks = project.tasks || [];
          setTasks(projectTasks);
          updateProgressBar(projectTasks);
        } else {
          setTasks([]);
          setSteps((prev) => prev.map((step) => ({ ...step, count: 0 })));
        }
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setTasks([]);
    }
  };

  const fetchStages = async () => {
    try {
      const res = await fetch("/api/stage");
      const data = await res.json();
  
      if (Array.isArray(data)) {
        setStageOptions(
          data.map((stage) => ({
            label: stage.stage,
            value: stage.stage,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch stages:", err);
    }
  };
  
  
  
  useEffect(() => {
    fetchStages();
  }, []);

  const handleViewClick = async (_id) => {
    router.push(`/viewtask/task/${_id}`);
  };

  const updateProgressBar = (tasks) => {
    const stageMap = {};

    tasks.forEach((task) => {
      const stage = task.stage?.toLowerCase() || "uncategorized";
      if (!stageMap[stage]) {
        stageMap[stage] = { total: 0, completed: 0 };
      }
      stageMap[stage].total += 1;
      if (task.status === "complete") {
        stageMap[stage].completed += 1;
      }
    });

    const dynamicSteps = Object.entries(stageMap).map(([stage, { total, completed }]) => {
      const status = total === completed
        ? "complete"
        : completed > 0
          ? "current"
          : "upcoming";

      return {
        label: (
          <>
            {stage
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
            <br />
            <span style={{ fontSize: "12px", color: "#888" }}>
              {total > 0 ? `${completed}/${total} tasks` : "not started"}
            </span>
          </>
        ),
        status,
      };
    });

    setSteps(dynamicSteps);
  };


  useEffect(() => {
    if (tasks.length > 0) {
      updateProgressBar(tasks);
    }
  }, [tasks]);

  const fetchOwners = async () => {
    try {
      const response = await fetch("/api/owner");
      const data = await response.json();
      setOwners(data.owners || []);
    } catch (error) {
      console.error("Error fetching owners:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/project");
      const data = await res.json();
      setProjects(data.data || []);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddClick = () => {
    setFormData({
      id: null,
      title: "",

      stage: "",
      status: "",
      details: "",
      startDate: "",
      dueDate: "",
      projectId: projectId,
    });
    setIsEditMode(false);
    setModal(true);
  };

  const handleEditClick = (taskId) => {
    const task = tasks.find((t) => t._id === taskId);
    if (task) {
      setFormData({
        id: task._id,
        title: task.title || "",

        stage: task.stage || "",
        status: task.status || "",
        details: task.details || "",
        startDate: task.startDate || "",
        dueDate: task.dueDate || "",
        projectId: task.projectId || projectId,
      });
      setIsEditMode(true);
      setModal(true);
    }
  };

  const handleDeleteClick = async (taskId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`/api/project`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId, projectId }),
        });

        if (res.ok) {
          Swal.fire("Deleted!", "Task has been deleted.", "success");
          fetchTasks();
        } else {
          throw new Error("Failed to delete task");
        }
      } catch (err) {
        console.error("Failed to delete task:", err);
        Swal.fire("Error!", "Failed to delete task.", "error");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.title || !formData.stage || !formData.status) {
      Swal.fire("Error", "Title, Stage, and Status are required", "error");
      return;
    }
  
    // Check if new stage needs to be saved
    const isNewStage = !stageOptions.some(
      (opt) => opt.value.toLowerCase() === formData.stage.toLowerCase()
    );
  
    try {
      if (isNewStage) {
        await fetch("/api/stage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage: formData.stage }),
        });
        await fetchStages(); // Refresh stage list
      }
  
      let res;
      if (isEditMode) {
        const updates = {
          title: formData.title,
          stage: formData.stage,
          status: formData.status,
          details: formData.details,
          startDate: formData.startDate,
          dueDate: formData.dueDate,
        };
        res = await fetch(`/api/project`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId: formData.id, updates }),
        });
      } else {
        const task = {
          title: formData.title,
          stage: formData.stage,
          status: formData.status,
          details: formData.details,
          startDate: formData.startDate,
          dueDate: formData.dueDate,
        };
        res = await fetch(`/api/project`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, task }),
        });
      }
  
      if (res.ok) {
        Swal.fire("Success!", `Task ${isEditMode ? "updated" : "added"} successfully`, "success");
        setModal(false);
        fetchTasks();
      } else {
        throw new Error("Server error");
      }
    } catch (err) {
      console.error("Failed to save task:", err);
      Swal.fire("Error", "Could not save task", "error");
    }
  };
  

  // Group tasks by stage
  const getTasksByStage = () => {
    const grouped = {};

    tasks.forEach((task) => {
      const stage = task.stage?.toLowerCase() || "uncategorized";
      if (!grouped[stage]) {
        grouped[stage] = [];
      }
      grouped[stage].push({
        ...task,
        id: task._id,
      });
    });

    return grouped;
  };

  const tableColumns = [
    { accessor: "title", title: "Title" },
    { accessor: "status", title: "Status" },
    { accessor: "dueDate", title: "Due Date" },
    {
      accessor: "actions",
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
            onClick={() => handleViewClick(row._id)}
          >
            <IconEye />
          </button>
        </div>
      ),
    },
  ];

  const formatStageTitle = (stage) => {
    return stage
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

 

  return (
    <div className="panel mt-6">
      <h5 className="mb-5 text-lg font-semibold dark:text-white-light">
        Tasks
      </h5>
      <div className="mx-auto mt-10 max-w-3xl">
        <MultiStepProgressBar steps={steps} />
      </div>
      <div className="mb-4 flex gap-4">
        <button className="btn btn-primary" onClick={handleAddClick}>
          <IconPlus /> Add Task
        </button>
      </div>

      {Object.entries(getTasksByStage()).map(([stage, stageTasks]) => (
        <div key={stage} className="mb-10">
          {stageTasks.length > 0 && (
            <>
              <h6 className="mb-3 text-base font-medium dark:text-white-light">
                {formatStageTitle(stage)}
              </h6>
              <DataTable
                records={stageTasks}
                columns={tableColumns}
                className="mb-5"
              />
            </>
          )}
        </div>
      ))}

      <Transition appear show={modal} as={Fragment}>
        <Dialog as="div" onClose={() => setModal(false)}>
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
                    <h5 className="text-lg font-bold">{isEditMode ? "Edit Task" : "Add Task"}</h5>
                    <button onClick={() => setModal(false)} className="text-white-dark hover:text-dark">
                      ✕
                    </button>
                  </div>
                  <div className="p-5">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label>Title *</label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          className="form-input"
                          required
                        />
                      </div>



                      <div>
                        <label>Stage</label>
                        <CreatableSelect
  isClearable
  options={stageOptions}
  value={formData.stage ? { label: formData.stage, value: formData.stage } : null}
  onChange={(selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      stage: selectedOption ? selectedOption.value : "",
    }));
  }}
  onCreateOption={(inputValue) => {
    setFormData((prev) => ({
      ...prev,
      stage: inputValue,
    }));
  }}
/>

                      </div>


                      <div>
                        <label>Status</label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="form-select"
                          required
                        >
                          <option value="">Select status</option>
                          <option value="complete">Complete</option>
                          <option value="current">Current</option>
                          <option value="upcoming">Upcoming</option>
                        </select>
                      </div>

                      <div>
                        <label>Details</label>
                        <textarea
                          name="details"
                          value={formData.details}
                          onChange={handleInputChange}
                          className="form-input"
                          rows="4"
                        />
                      </div>

                      <div>
                        <label>Start Date</label>
                        <Flatpickr
                          options={{ dateFormat: "m/d/Y" }}
                          value={formData.startDate}
                          onChange={([date]) => {
                            const formatted = format(date, "MM/dd/yyyy");
                            setFormData((prev) => ({ ...prev, startDate: formatted }));
                          }}
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label>Due Date</label>
                        <Flatpickr
                          options={{ dateFormat: "m/d/Y" }}
                          value={formData.dueDate}
                          onChange={([date]) => {
                            const formatted = format(date, "MM/dd/yyyy");
                            setFormData((prev) => ({ ...prev, dueDate: formatted }));
                          }}
                          className="form-input"
                        />
                      </div>

                      <button type="submit" className="btn btn-primary mt-4">
                        {isEditMode ? "Update" : "Save Task"}
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

export default ComponentsDatatablesTask;