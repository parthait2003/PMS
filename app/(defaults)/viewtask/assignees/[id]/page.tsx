"use client";
import React, { useRef, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Swal from "sweetalert2";
import { format } from "date-fns";

const AssigneeTaskDetails = () => {
    const { id } = useParams(); // taskId from the URL
    const [projects, setProjects] = useState([]);
    const [task, setTask] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [newFiles, setNewFiles] = useState([]);
    const fileInputRef = useRef(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [readStatus, setReadstatus] = useState(false);

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            // Fetch projects
            const resProject = await fetch("/api/project");
            if (!resProject.ok) throw new Error("Failed to fetch projects");
            const { data: projectData } = await resProject.json();
            console.log("Raw project data:", projectData);
            setProjects(projectData);
    
            // Flatten tasks and map assignees
            const allTasks = projectData.flatMap(project => {
                const assigneeId = project.assignees && project.assignees.length > 0 
                    ? project.assignees[0].id 
                    : null;

                return project.tasks.map(task => ({
                    _id: task._id,
                    title: task.title,
                    stage: task.stage,
                    status: task.status,
                    details: task.details,
                    startDate: task.startDate,
                    dueDate: task.dueDate,
                    assignee: assigneeId,
                    projectName: project.project,
                    projectId: project._id,
                }));
            });

            const currentTask = allTasks.find(t => t._id === id);
            console.log("Current task:", currentTask);
            setTask(currentTask);
    
            // Fetch messages
            const resMessages = await fetch("/api/taskMessage");
            if (!resMessages.ok) throw new Error("Failed to fetch messages");
            const { data: allMessages } = await resMessages.json();
            const relatedMessages = allMessages.filter(msg => msg.taskId === id);
            setMessages(relatedMessages);
            console.log("Fetched messages:", relatedMessages);
    
            // Fetch users
            const resUsers = await fetch("/api/user");
            if (!resUsers.ok) throw new Error("Failed to fetch users");
            const userData = await resUsers.json();
            let usersArray = Array.isArray(userData) ? userData : Array.isArray(userData.data) ? userData.data : [];
            usersArray = usersArray.map(user => ({
                ...user,
                type: "user",
            }));
            console.log("User data:", usersArray);
    
            // Fetch owners
            const resOwners = await fetch("/api/owner");
            if (!resOwners.ok) throw new Error("Failed to fetch owners");
            const ownerData = await resOwners.json();
            const ownersArray = Array.isArray(ownerData.owners) ? ownerData.owners : [];
            const normalizedOwners = ownersArray.map((owner, index) => {
                if (!owner._id || !owner.name) {
                    console.warn(`Invalid owner at index ${index}:`, owner);
                    return null;
                }
                return {
                    _id: String(owner._id),
                    username: owner.name || "Unknown Owner",
                    type: "owner",
                };
            }).filter(owner => owner !== null);
            console.log("Normalized owners:", normalizedOwners);
    
            const combinedUsers = [...usersArray, ...normalizedOwners];
            console.log("Combined users:", combinedUsers);
            setUsers(combinedUsers);

            if (currentTask && currentTask.assignee) {
                const assigneeExists = combinedUsers.some(user => String(user._id) === String(currentTask.assignee));
                console.log("Assignee exists in users:", assigneeExists);
            }
    
        } catch (err) {
            console.error("Fetch error:", err);
            Swal.fire("Error", "Failed to load data", "error");
        } finally {
            setLoading(false);
        }
    };

    const getAssigneeName = (projectId, assigneeId) => {
        const project = projects.find(p => p._id === projectId);
        const assignee = project?.assignees.find(a => a.id === assigneeId);
        return assignee?.name || "Unknown Assignee";
    };
    
    const getSenderName = (userId) => {
        console.log("Looking for userId:", userId);
        const user = users.find((u) => String(u._id) === String(userId));
        console.log("Found user:", user);
        return {
            username: user?.username || "Unknown Sender",
            type: user?.type || "unknown",
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const senderId = localStorage.getItem('userId');
        if (!senderId) {
            Swal.fire("Error", "User is not logged in", "error");
            return;
        }

        if (!task.assignee) {
            Swal.fire("Error", "No assignee found for this task", "error");
            return;
        }

        console.log("Submitting message with assigneeId:", task.assignee);

        try {
            // Upload files to DigitalOcean Spaces
            const uploadedFileUrls = [];
            for (const file of newFiles) {
                const formData = new FormData();
                formData.append('file', file);

                const uploadResponse = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    throw new Error(`Failed to upload file: ${file.name}`);
                }

                const uploadResult = await uploadResponse.json();
                if (uploadResult.error) {
                    throw new Error(uploadResult.error);
                }

                uploadedFileUrls.push(uploadResult.url);
            }

            // Post message with file URLs
            const res = await fetch("/api/taskMessage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: newMessage,
                    projectId: task.projectId,
                    taskId: task._id,
                    assigneeId: task.assignee,
                    senderId: senderId,
                    files: uploadedFileUrls, // Send URLs instead of file names
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to add message");
            }

            const updatedMessages = await res.json();
            console.log("API response:", updatedMessages);
            setMessages((prev) => [...prev, updatedMessages.data]);
            setShowModal(false);
            setNewMessage("");
            setNewFiles([]);
            if (fileInputRef.current) fileInputRef.current.value = "";
            Swal.fire("Success", "Message and files submitted successfully", "success");
        } catch (error) {
            console.error("Submit error:", error);
            Swal.fire("Error", `Could not add message: ${error.message}`, "error");
        }
    };

    // Helper functions
    const getProjectName = (projectId) => {
        return projects.find(p => p._id === projectId)?.project || "Unknown Project";
    };

    const getTaskTitle = (projectId, taskId) => {
        const project = projects.find(p => p._id === projectId);
        return project?.tasks.find(t => t._id === taskId)?.title || "Unknown Task";
    };

    if (loading) return <div className="p-6">Loading...</div>;
    if (!task) return <div className="p-6 text-red-600">Task not found.</div>;

    return (
        <div className="panel mt-6 p-6 bg-white rounded-xl shadow-md space-y-6">
            <h2 className="text-2xl font-bold">Task Details</h2>
            <div className="space-y-2 text-base">
                <div><strong>Title:</strong> {task.title}</div>
                <div><strong>Stage:</strong> {task.stage}</div>
                <div><strong>Status:</strong> {task.status}</div>
                <div>
                    <strong>Start Date:</strong>{" "}
                    {task.startDate ? format(new Date(task.startDate), "MM/dd/yyyy") : "N/A"}
                </div>
                <div>
                    <strong>Due Date:</strong>{" "}
                    {task.dueDate ? format(new Date(task.dueDate), "MM/dd/yyyy") : "N/A"}
                </div>
                <div><strong>Project:</strong> {task.projectName}</div>
                <div><strong>Details:</strong> {task.details || "No details provided."}</div>
            </div>

            {/* Task Messages Section */}
            <div className="mt-10">
                <h3 className="text-3xl font-semibold text-gray-700 mb-4 border-b pb-2">Task Messages</h3>
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Add Message
                    </button>
                </div>

                {messages.length === 0 ? (
                    <p className="text-gray-500 text-lg">No messages for this task.</p>
                ) : (
                    <ul className="space-y-4">
                        {[...messages].reverse().map((msg) => {
                            const { username, type } = getSenderName(msg.senderId);
                            const messageBgColor = type === "user" ? "bg-blue-100" : type === "owner" ? "bg-green-100" : "bg-gray-100";
                            return (
                                <li key={msg._id} className={`border p-4 rounded-lg shadow-sm ${messageBgColor} text-lg`}>
                                    <div><span className="font-semibold text-gray-800 text-xl">Project:</span> {getProjectName(msg.projectId)}</div>
                                    <div><span className="font-semibold text-gray-800 text-xl">Task:</span> {getTaskTitle(msg.projectId, msg.taskId)}</div>
                                    <div><span className="font-semibold text-gray-800 text-xl">Client:</span> {getAssigneeName(msg.projectId, msg.assigneeId)}</div>
                                    <div>
                                        <span className="font-semibold text-gray-800 text-xl">Sender:</span>{" "}
                                        <span>{username}</span>
                                    </div>
                                    <div><span className="font-semibold text-gray-800 text-xl">Message:</span> {msg.message || "No message."}</div>
                                    <div>
                                        <span className="font-semibold text-gray-800 text-xl">Files:</span>{" "}
                                        {msg.files.length > 0 ? (
                                            msg.files.map((url, index) => (
                                                <a
                                                    key={index}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                   View File 
                                                </a>
                                            )).reduce((prev, curr, i) => (i === 0 ? [curr] : [...prev, ", ", curr]), [])
                                        ) : (
                                            "No files"
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Add New Message</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block font-medium mb-1">Message</label>
                                <textarea
                                    className="w-full p-2 border rounded"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block font-medium mb-1">File(s)</label>
                                <input
                                    type="file"
                                    multiple
                                    ref={fileInputRef}
                                    onChange={(e) => setNewFiles(e.target.files ? Array.from(e.target.files) : [])}
                                    className="block w-full"
                                    accept="image/jpeg,image/png,application/pdf"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setNewMessage("");
                                        setNewFiles([]);
                                        if (fileInputRef.current) fileInputRef.current.value = "";
                                    }}
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssigneeTaskDetails;