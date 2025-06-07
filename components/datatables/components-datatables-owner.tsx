"use client";
import { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { DataTable } from "mantine-datatable";
import IconPlus from "@/components/icon/icon-plus";
import IconPencil from "../icon/icon-pencil";
import IconTrash from "@/components/icon/icon-trash";
import Swal from 'sweetalert2';

const ComponentsDatatablesOwner = () => {
  const [modal, setModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", address: "", phone: "", password: "" });
  const [owners, setOwners] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const response = await fetch("/api/owner");
      const data = await response.json();
  
      // If data.owners exists, use it. Else fallback to data if it's already an array.
      const ownerArray = Array.isArray(data) ? data : data.owners;
  
      if (!Array.isArray(ownerArray)) throw new Error("Invalid response format");
  
      setOwners(ownerArray);
    } catch (error) {
      console.error("Error fetching owners:", error);
      setOwners([]); // fallback to empty array to avoid further errors
    }
  };
  

  const handleAddClick = () => {
    setFormData({ name: "", email: "", address: "", phone: "", password: "" });
    setEditingId(null);
    setModal(true);
  };

  const handleEditClick = (id) => {
    const ownerToEdit = owners.find((owner) => owner._id === id);
    if (ownerToEdit) {
      setFormData({ ...ownerToEdit });
      setEditingId(id);
      setModal(true);
    }
  };

  const handleDeleteClick = async (id) => {
    const confirmDelete = await Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "This action cannot be undone!",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (confirmDelete.isConfirmed) {
      try {
        const response = await fetch(`/api/owner/${id}`, { method: "DELETE" });
        if (response.ok) {
          Swal.fire({ icon: "success", title: "Deleted!", text: "Client has been deleted.", timer: 1500, showConfirmButton: false });
          fetchOwners();
        } else {
          Swal.fire({ icon: "error", title: "Error", text: "Failed to delete Client." });
        }
      } catch (error) {
        console.error("Error deleting Client:", error);
        Swal.fire({ icon: "error", title: "Error", text: "Failed to delete Client." });
      }
    }
  };



  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.address.trim() || !formData.phone.trim() || !formData.password.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please fill in all fields',
      });
      return;
    }

    try {

      const requestBody = editingId ? { ...formData } : { ...formData, _id: undefined };
      const response = await fetch(editingId ? `/api/owner/${editingId}` : "/api/owner", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody), // Preserve _id
      });


      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: editingId ? "Client updated successfully!" : "Client added successfully!",
          timer: 1500,
          showConfirmButton: false,
        });
        setEditingId(null);
        setModal(false);
        fetchOwners();
      } else {
        const data = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Failed to add Client',
        });
      }
    } catch (error) {
      console.error("Error adding Client:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add Client',
      });
    }
  };

  return (
    <div className="panel mt-6">
      <h5 className="mb-5 text-lg font-semibold dark:text-white-light">Clients</h5>

      <div className="flex gap-4 mb-4">
        <button className="btn btn-primary" onClick={handleAddClick}>
          <IconPlus /> Add Client
        </button>
      </div>

      <DataTable
        records={owners}
        columns={[
          {
            accessor: "name",
            title: "Name",
            render: (row) => row.name || "-",
          },
          {
            accessor: "email",
            title: "Email",
            render: (row) => row.email || "-",
          },
          {
            accessor: "address",
            title: "Address",
            render: (row) => row.address || "-",
          },
          {
            accessor: "phone",
            title: "Phone No.",
            render: (row) => row.phone || "-",
          },
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
              </div>
            ),
          },
        ]}
      />

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
                  <div className="flex items-center justify-between border-b border-white-light/10 px-5 py-3 dark:border-[#191e3a]">
                    <h5 className="text-lg font-bold">Add Developer</h5>
                    <button
                      type="button"
                      className="text-white-dark hover:text-dark"
                      onClick={() => setModal(false)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="p-5">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label htmlFor="name">Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Enter name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email">Email</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Enter email"
                        />
                      </div>
                      <div>
                        <label htmlFor="address">Address</label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Enter address"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone">Phone no.</label>
                        <input
                          type="text"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Enter Phone no."
                        />
                      </div>
                      <div>
                        <label htmlFor="password">Password</label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Enter password"
                        />
                      </div>

                      <button type="submit" className="btn btn-primary mt-6">Submit</button>
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

export default ComponentsDatatablesOwner;
