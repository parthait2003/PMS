"use client";
import { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { DataTable } from "mantine-datatable";
import IconPlus from "@/components/icon/icon-plus";
import IconPencil from "@/components/icon/icon-pencil";
import IconEye from "../icon/icon-eye";
import IconTrash from "@/components/icon/icon-trash";
import Swal from 'sweetalert2';
import { useRouter } from "next/navigation";


const ComponentsDatatablesTemplate = () => {
  const [recordsData, setRecordsData] = useState([]);
  const [modal1, setModal1] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ template: "" });
  const [editId, setEditId] = useState(null);
  const [editDocId, setEditDocId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/template");
      const data = await response.json();
      console.log("Fetched templates:", data);

      if (response.ok) {
        const templates = Array.isArray(data) ? data : [];
        const normalizedTemplates = templates.map(template => ({
          id: template._id,
          docId: template._id,
          template: template.template || "",
        }));
        console.log("Normalized templates:", normalizedTemplates);
        setRecordsData(normalizedTemplates);
      } else {
        console.error("API response not ok:", data);
        setRecordsData([]);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      setRecordsData([]);
    }
  };

  

  const handleAddClick = () => {
    setFormData({ template: "" });
    setEditMode(false);
    setModal1(true);
  };

  const handleEditClick = (id) => {
    const selectedRecord = recordsData.find((record) => record.id === id);
    if (selectedRecord) {
      setFormData({ template: selectedRecord.template });
      setEditId(id);
      setEditDocId(selectedRecord.docId);
      setEditMode(true);
      setModal1(true);
    }
  };

  const handleDeleteClick = async (id) => {
    const record = recordsData.find(r => r.id === id);
    if (!record) return;

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the template "${record.template}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/template/${record.docId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted',
            text: 'Template deleted successfully!',
            timer: 1500,
            showConfirmButton: false,
          });
          await fetchTemplates();
        } else {
          const data = await response.json();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.message || 'Failed to delete template',
          });
        }
      } catch (error) {
        console.error("Error deleting template:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete template',
        });
      }
    }
  };

  const handleShowClick = (id) => {
    router.push(`/viewtask/template/${id}`);
  };
  

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.template.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Template name is required.',
      });
      return;
    }
  
    try {
      const method = editMode ? "PUT" : "POST";
      const url = editMode ? `/api/template/${editDocId}` : "/api/template";
      const body = { template: formData.template };
  
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
  
      const data = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: editMode ? "Updated" : "Added",
          text: `Template ${editMode ? "updated" : "added"} successfully!`,
          timer: 1500,
          showConfirmButton: false,
        });
  
        if (!editMode && data._id) {
          // Redirect only after adding a new template
          router.push(`/viewtask/template/${data._id}`);
        } else {
          await fetchTemplates();
          setModal1(false);
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || `Failed to ${editMode ? "update" : "add"} template`,
        });
      }
    } catch (error) {
      console.error(`Error ${editMode ? "updating" : "adding"} template:`, error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to ${editMode ? "update" : "add"} template`,
      });
    }
  };
  

  return (
    <div className="panel mt-6">
      <h5 className="mb-5 text-lg font-semibold dark:text-white-light">Templates</h5>

      <div className="flex gap-4 mb-4">
        <button className="btn btn-secondary" onClick={handleAddClick}>
          <IconPlus /> Add Template
        </button>
      </div>

      <DataTable
        records={recordsData}
        columns={[
          {
            accessor: "template",
            title: "Template",
            render: (row) => row.template || "-",
          },
          {
            accessor: "actions",
            title: "Actions",
            render: (row) => (
              <div className="flex space-x-2">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => handleEditClick(row.id)}
                >
                  <IconPencil />
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteClick(row.id)}
                >
                  <IconTrash />
                </button>

                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => handleShowClick(row.id)}
                >
                  <IconEye />
                </button>


              </div>
            ),
          },
        ]}
      />

      {/* Edit/Add Modal */}
      <Transition appear show={modal1} as={Fragment}>
        <Dialog as="div" open={modal1} onClose={() => setModal1(false)}>
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
                    <h5 className="text-lg font-bold">
                      {editMode ? "Edit Template" : "Add Template"}
                    </h5>
                    <button
                      type="button"
                      className="text-white-dark hover:text-dark"
                      onClick={() => setModal1(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-5">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label htmlFor="template">Template Name</label>
                        <input
                          type="text"
                          id="template"
                          value={formData.template}
                          onChange={(e) => handleInputChange("template", e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <button type="submit" className="btn btn-primary mt-6">
                        {editMode ? "Update" : "Submit"}
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

export default ComponentsDatatablesTemplate;