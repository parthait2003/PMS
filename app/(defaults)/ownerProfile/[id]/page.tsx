"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation"; // Import useParams from next/navigation
import Swal from "sweetalert2";
import IconPencil from "@/components/icon/icon-pencil"; 
import IconFile from "@/components/icon/icon-file";

const OwnerProfilePage = () => {
  const [owner, setOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [formData, setFormData] = useState<any>({});
  const [modal, setModal] = useState(false);
  const { id } = useParams(); // Fetch the 'id' from the dynamic route params

  useEffect(() => {
    const fetchOwnerProfile = async () => {
      if (!id) return; // Ensure that `id` exists before making the API call

      try {
        const response = await fetch(`/api/owner/${id}`);
        if (response.ok) {
          const data = await response.json();
          setOwner(data);
          setFormData(data); // Initialize form data with the fetched owner data
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Owner not found!",
          });
        }
      } catch (error) {
        console.error("Error fetching owner profile:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch owner data.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerProfile();
  }, [id]);

  // Handle input change for the form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle submit for editing the profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/owner/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Profile Updated",
          text: "Your profile has been successfully updated.",
        });
        setModal(false); // Close the modal after successful update
        setOwner(formData); // Update the owner data with the new values
      } else {
        const data = await response.json();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to update profile.",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update profile.",
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <p>Loading...</p>
      </div>
    );
  }

  if (!owner) {
    return (
      <div>
        <p>Owner not found.</p>
      </div>
    );
  }

  return (
    <div className="panel mt-6">
      <h5 className="mb-5 text-lg font-semibold dark:text-white-light">Client Profile</h5>
      <div className="space-y-4">
        <div>
          <strong>Name:</strong> <span>{owner.name}</span>
        </div>
        <div>
          <strong>Email:</strong> <span>{owner.email}</span>
        </div>
        <div>
          <strong>Address:</strong> <span>{owner.address}</span>
        </div>
        <div>
          <strong>Phone:</strong> <span>{owner.phone}</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-4 flex gap-2">
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <IconPencil /> Edit Profile
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => router.push(`/projects/assignees/${id}`)}
        >
          <IconFile /> View Projects
        </button>
      </div>

     

      {/* Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-[black]/60 flex items-center justify-center">
          <div className="panel w-full max-w-lg p-6 bg-white rounded-lg">
            <h5 className="text-lg font-semibold">Edit Profile</h5>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
                <label htmlFor="phone">Phone No.</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter phone number"
                />
              </div>
              <div className="flex justify-between items-center mt-6">
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerProfilePage;
