"use client";
import MultiStepProgressBar from "@/components/datatables/components-datatables-multiprogressbar";
import { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { DataTable } from "mantine-datatable";
import Select from "react-select";
import Swal from "sweetalert2";
import IconPlus from "@/components/icon/icon-plus";
import IconPencil from "@/components/icon/icon-pencil";
import IconTrash from "@/components/icon/icon-trash";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import CreatableSelect from "react-select/creatable";


const ComponentsDatatablesTask = () => {
    const [fetchedStages, setFetchedStages] = useState([]);

    const [modal, setModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [owners, setOwners] = useState([]);
    const [steps, setSteps] = useState([
        { label: 'Onboarding Stage', status: 'upcoming' },
        { label: 'Design Stage', status: 'upcoming' },
        { label: 'Development', status: 'upcoming' },
        { label: 'Website Review', status: 'upcoming' },
        { label: 'Deployment', status: 'upcoming' },
        { label: 'Offboarding', status: 'upcoming' },
    ]);

    const { id: projectId } = useParams();
    const { id: templateId } = useParams();

    const [formData, setFormData] = useState({
        id: null,
        title: "",
        stage: "",
        status: "",
        details: "",
        dueDate: "",
        startDate: "",
        templateId: templateId,
    });

    const stageOrder = [
        'onboarding stage',
        'design stage',
        'development',
        'website review',
        'deployment',
        'offboarding'
    ];

    useEffect(() => {
        fetchTasks();
        fetchOwners();
    }, [templateId]);

    const updateStepStatuses = () => {
        const stepStatuses = stageOrder.map((stage) => {
            const tasksInStage = tasks.filter(task => task.stage.toLowerCase() === stage);
            const totalTasks = tasksInStage.length;
            const completedTasks = tasksInStage.filter(task => task.status === "complete").length;

            let status = "upcoming";

            if (totalTasks > 0) {
                if (completedTasks === totalTasks) {
                    status = "complete";
                } else {
                    status = "current";
                }
            }

            const label = (
                <>
                    {stage
                        .split(" ")
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")}
                    <br />
                    <span style={{ fontSize: "12px", color: "#888" }}>
                        {totalTasks > 0 ? `${completedTasks}/${totalTasks} tasks` : "not started"}
                    </span>
                </>
            );
            return {
                label,
                status,
            };
        });

        setSteps(stepStatuses);
    };

    useEffect(() => {
        if (tasks.length > 0) {
            updateStepStatuses();
        }
    }, [tasks]);

    const fetchTasks = async () => {
        try {
            const res = await fetch("/api/task");
            const data = await res.json();
            const filtered = data.filter(task => task.templateId === templateId);
            setTasks(filtered || []);
        } catch (err) {
            console.error("Failed to fetch tasks:", err);
        }
    };

    const fetchStages = async () => {
        try {
            const res = await fetch("/api/stage");
            const data = await res.json();
            if (Array.isArray(data)) {
                setFetchedStages(data.map((stage) => ({ label: stage.stage, value: stage.stage })));
            }
        } catch (err) {
            console.error("Failed to fetch stages", err);
        }
    };

    useEffect(() => {
        fetchStages();
    }, []);


    const fetchOwners = async () => {
        try {
            const response = await fetch("/api/owner");
            const data = await response.json();
            setOwners(data.owners || []);
        } catch (error) {
            console.error("Error fetching owners:", error);
        }
    };

    const assigneeOptions = owners.map(owner => ({
        value: owner._id,
        label: owner.name,
    }));

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
            startDate: "", // Add startDate to the form data
            dueDate: "",
            templateId: templateId, // Set templateId from URL automatically
        });
        setIsEditMode(false);
        setModal(true);
    };

    const handleEditClick = (id) => {
        console.log("Edit clicked with ID:", id);
        const task = tasks.find((t) => t._id === id);
        if (task) {
            setFormData({
                id: task._id,
                title: task.title || "",
                stage: task.stage || "",
                status: task.status || "",
                details: task.details || "",
                startDate: task.startDate || "", // Add startDate to form data
                dueDate: task.dueDate || "",
                templateId: task.templateId || templateId, // Set templateId
            });
            setIsEditMode(true);
            setModal(true);
        }
    };

    const handleDeleteClick = async (id) => {
        console.log("Delete clicked with ID:", id);
        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
        });

        if (confirm.isConfirmed) {
            try {
                await fetch(`/api/task/${id}`, { method: "DELETE" });
                Swal.fire("Deleted!", "Task has been deleted.", "success");
                fetchTasks();
            } catch (err) {
                Swal.fire("Error!", "Failed to delete task.", "error");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            Swal.fire("Error", "Title is required", "error");
            return;
        }

      

        const method = isEditMode ? "PUT" : "POST";
        const endpoint = isEditMode ? `/api/task/${formData.id}` : "/api/task";

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                Swal.fire("Success!", `Task ${isEditMode ? "updated" : "created"} successfully.`, "success");
                setModal(false);
                fetchTasks();
            } else {
                const err = await res.json();
                Swal.fire("Error", err.message || "Failed to save task.", "error");
            }
        } catch (err) {
            Swal.fire("Error", "Something went wrong.", "error");
        }
    };


    const stageOptions = fetchedStages;




    return (
        <div className="panel mt-6">
            <h5 className="mb-5 text-lg font-semibold dark:text-white-light">Tasks</h5>

            <div className="flex gap-4 mb-4">
                <button className="btn btn-primary" onClick={handleAddClick}>
                    <IconPlus /> Add Task
                </button>
            </div>

            <DataTable
                records={tasks}
                columns={[
                    { accessor: "title", title: "Title" },

                    { accessor: "stage", title: "Stage" },
                    { accessor: "status", title: "Status" },
                    { accessor: "dueDate", title: "Due Date" },
                    {
                        accessor: "actions",
                        title: "Actions",
                        render: (row) => (
                            <div className="flex space-x-2">
                                <button className="btn btn-sm btn-primary" onClick={() => handleEditClick(row._id)}>
                                    <IconPencil />
                                </button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteClick(row._id)}>
                                    <IconTrash />
                                </button>
                            </div>
                        ),
                    },
                ]}
            />

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
                                                    onCreateOption={async (inputValue) => {
                                                        try {
                                                            // POST to /api/stage
                                                            const res = await fetch("/api/stage", {
                                                                method: "POST",
                                                                headers: { "Content-Type": "application/json" },
                                                                body: JSON.stringify({ stage: inputValue }),
                                                            });

                                                            if (res.ok) {
                                                                // Add to options
                                                                const newOption = { label: inputValue, value: inputValue };
                                                                setFetchedStages((prev) => [...prev, newOption]);
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    stage: inputValue,
                                                                }));
                                                            } else {
                                                                console.error("Failed to create new stage");
                                                            }
                                                        } catch (err) {
                                                            console.error("Error creating stage", err);
                                                        }
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
                                                    options={{ dateFormat: "m/d/Y" }} // MM/DD/YYYY format
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
                                                    options={{ dateFormat: "m/d/Y" }} // MM/DD/YYYY format
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
