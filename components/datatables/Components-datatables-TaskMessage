"use client";
import { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { DataTable } from "mantine-datatable";
import Swal from "sweetalert2";
import Select from "react-select";
import IconPlus from "@/components/icon/icon-plus";
import IconPencil from "@/components/icon/icon-pencil";
import IconTrash from "@/components/icon/icon-trash";
import IconEye from "@/components/icon/icon-eye";

const TaskMessageTable = () => {
  const [messages, setMessages] = useState([]);
  const [modal, setModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [owners, setOwners] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    taskId: "",
    projectId: "",
    clientId: "",
    developerId: "",
    projectCreator: "",
    message: "",
    file: "",
  });

  useEffect(() => {
    fetchMessages();
    fetchProjects();
    fetchClients();
    fetchOwners();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/taskMessage");
      const data = await res.json();
      setMessages(data || []);
    } catch (err) {
      console.error("Failed to fetch task messages:", err);
    }
  };

  const fetchProjects = async () => {
    const res = await fetch("/api/project");
    const data = await res.json();
    setProjects(data.data || []);
  };

  const fetchClients = async () => {
    const res = await fetch("/api/client");
    const data = await res.json();
    console.log(data);
    setClients(data || []);
  };

  const fetchOwners = async () => {
    const res = await fetch("/api/owner");
    const data = await res.json();
    setOwners(data.owners || []);
  };

  const handleAddClick = () => {
    setFormData({
      id: null,
      taskId: "",
      projectId: "",
      clientId: "",
      developerId: "",
      projectCreator: "",
      message: "",
      file: "",
    });
    setIsEditMode(false);
    setModal(true);
  };

  const handleEditClick = (id) => {
    const messageToEdit = messages.find((message) => message._id === id);
    if (messageToEdit) {
      setFormData({
        id: messageToEdit._id,
        taskId: messageToEdit.taskId || "",
        projectId: messageToEdit.projectId || "",
        clientId: messageToEdit.clientId || "",
        developerId: messageToEdit.developerId || "",
        projectCreator: messageToEdit.projectCreator || "",
        message: messageToEdit.message || "",
        file: messageToEdit.file || "",
      });
      setIsEditMode(true);
      setModal(true);
    } else {
      Swal.fire("Error", "Message not found", "error");
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
        const response = await fetch(`/api/taskMessage/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          Swal.fire("Deleted!", "Your task message has been deleted.", "success");
          fetchMessages();
        } else {
          Swal.fire("Error!", "Failed to delete task message.", "error");
        }
      } catch (error) {
        console.error("Error deleting task message:", error);
        Swal.fire("Error!", "Failed to delete task message.", "error");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      setFormData((prev) => ({ ...prev, file: data.url }));
    } catch (err) {
      console.error("Failed to upload file:", err);
      Swal.fire("Error", "Failed to upload file", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = isEditMode ? `/api/taskMessage/${formData.id}` : "/api/taskMessage";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        Swal.fire("Success", isEditMode ? "Message updated" : "Message added", "success");
        setModal(false);
        fetchMessages();
      } else {
        const err = await res.json();
        Swal.fire("Error", err.message || "Something went wrong", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Request failed", "error");
    }
  };

  const projectOptions = projects.map((project) => ({
    value: project._id,
    label: project.project,
  }));

  const taskOptions = projects.flatMap((p) =>
    p.tasks.map((task) => ({
      value: task._id,
      label: `${task.title} (${p.project})`,
    }))
  );

  const clientOptions = clients.map((c) => ({
    value: c._id,
    label: c.name,
  }));

  const developerOptions = owners.map((o) => ({
    value: o._id,
    label: o.name,
  }));

  return (
    <div className="panel mt-6">
      <h5 className="mb-5 text-lg font-semibold dark:text-white-light">Task Messages</h5>

      <div className="mb-4 flex gap-4">
        <button className="btn btn-primary" onClick={handleAddClick}>
          <IconPlus /> Add Task Message
        </button>
      </div>

      <DataTable
        withBorder
        highlightOnHover
        records={messages}
        columns={[
          {
            accessor: "projectId",
            title: "Project",
            render: ({ projectId }) => {
              const project = projects.find((p) => p._id === projectId);
              return project?.project || "-";
            },
          },
          {
            accessor: "taskId",
            title: "Task",
            render: ({ taskId }) => {
              for (let p of projects) {
                const task = p.tasks?.find((t) => t._id === taskId);
                if (task) return task.title;
              }
              return "-";
            },
          },
          {
            accessor: "clientId",
            title: "Client",
            render: ({ clientId }) => {
              const client = clients.find((c) => c._id === clientId);
              return client?.name || "-";
            },
          },
          {
            accessor: "developerId",
            title: "Developer",
            render: ({ developerId }) => {
              const dev = owners.find((o) => o._id === developerId);
              return dev?.name || "-";
            },
          },
          { accessor: "projectCreator", title: "Creator" },
          { accessor: "message", title: "Message" },
          {
            accessor: "file",
            title: "Attachment",
            render: ({ file }) =>
              file ? (
                <a href={file} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                  View File
                </a>
              ) : (
                "-"
              ),
          },
          {
            accessor: "_id",
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
                      {isEditMode ? "Edit Task Message" : "Add Task Message"}
                    </h5>
                    <button onClick={() => setModal(false)}>X</button>
                  </div>
                  <div className="p-5">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label htmlFor="projectId">Project</label>
                        <Select
                          options={projectOptions}
                          onChange={(opt) => setFormData({ ...formData, projectId: opt.value })}
                          value={projectOptions.find((opt) => opt.value === formData.projectId)}
                          placeholder="Select project"
                          className="form-select"
                        />
                      </div>
                      <div>
                        <label htmlFor="taskId">Task</label>
                        <Select
                          options={taskOptions}
                          onChange={(opt) => setFormData({ ...formData, taskId: opt.value })}
                          value={taskOptions.find((opt) => opt.value === formData.taskId)}
                          placeholder="Select task"
                          className="form-select"
                        />
                      </div>
                      <div>
                        <label htmlFor="clientId">Client</label>
                        <Select
  options={clientOptions}
  onChange={(opt) => setFormData({ ...formData, clientId: opt.value })}
  value={
    clientOptions.find((opt) => opt.value === formData.clientId) || null
  }
  placeholder="Select client"
  className="form-select"
/>

                      </div>
                      <div>
                        <label htmlFor="developerId">Developer</label>
                        <Select
                          options={developerOptions}
                          onChange={(opt) => setFormData({ ...formData, developerId: opt.value })}
                          value={developerOptions.find((opt) => opt.value === formData.developerId)}
                          placeholder="Select developer"
                          className="form-select"
                        />
                      </div>
                      <div>
                        <label htmlFor="projectCreator">Project Creator</label>
                        <input
                          type="text"
                          id="projectCreator"
                          name="projectCreator"
                          value={formData.projectCreator}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Enter project creator"
                        />
                      </div>
                      <div>
                        <label htmlFor="message">Message</label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          className="form-input"
                          rows={3}
                          placeholder="Enter message"
                        />
                      </div>
                      <div>
                        <label htmlFor="file">Upload File</label>
                        <input
                          type="file"
                          id="file"
                          onChange={handleFileChange}
                          className="form-input"
                        />
                        {formData.file && (
                          <a
                            href={formData.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline"
                          >
                            View Uploaded File
                          </a>
                        )}
                      </div>
                      <button type="submit" className="btn btn-primary mt-6 w-full">
                        {isEditMode ? "Update Task Message" : "Submit"}
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

export default TaskMessageTable;
