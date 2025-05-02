"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";
import ConfirmationPopup from "../components/ConfirmationPopup";

const ManageMaterials = () => {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [materials, setMaterials] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ title: "", file: null });
  const [showConfirmUpload, setShowConfirmUpload] = useState(false);
  const [courseData, setCourseData] = useState({ title: "", description: "" });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await fetch("/api/courses/material", { method: "GET" });
      const data = await res.json();

      if (res.ok) {
        // Corrected data structure access
        setMaterials(data.materials || []);
        setCourseData({
          title: data.course?.course_title || "Course Materials",
          description: data.course?.course_description || "",
        });
      } else {
        console.error("Failed to fetch materials:", data.error);
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  };

  const handleFileChange = (e) => {
    setNewMaterial((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  const handleUpload = () => {
    if (newMaterial.file && newMaterial.title.trim() !== "") {
      setShowConfirmUpload(true);
    }
  };

  const confirmUpload = async () => {
    const formData = new FormData();
    formData.append("title", newMaterial.title);
    formData.append("file", newMaterial.file);

    try {
      const res = await fetch("/api/courses/material", {
        method: "POST",
        body: formData,
      });

      const textResponse = await res.text();
      const result = textResponse ? JSON.parse(textResponse) : {};

      if (!res.ok) {
        throw new Error(result.error || "Upload failed");
      }

      await fetchMaterials();
      alert(`${newMaterial.title} added successfully!`);
      setShowUploadPopup(false);
      setShowConfirmUpload(false);
      setNewMaterial({ title: "", file: null });
    } catch (error) {
      console.error("Upload error:", error.message);
      alert(`Upload failed: ${error.message}`);
    }
  };

  const confirmDelete = (materialId) => {
    setMaterialToDelete(materialId);
    setShowPopup(true);
  };

  const handleRemove = async () => {
    try {
      // Find the material before deletion to get its title
      const materialToDeleteObj = materials.find(
        (material) => material.material_id === materialToDelete
      );

      const res = await fetch("/api/courses/material", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ material_id: materialToDelete }),
      });

      const result = await res.json();
      if (res.ok) {
        await fetchMaterials();
        setShowPopup(false);
        setMaterialToDelete(null);

        if (materialToDeleteObj) {
          alert(`${materialToDeleteObj.material_title} removed successfully!`);
        }
      } else {
        console.error("Delete failed:", result.message);
      }
    } catch (error) {
      console.error("Error deleting material:", error);
    }
  };
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "linear-gradient(to bottom, #a9c3d2, #fcf4e7)",
      }}
    >
      <Header title="Manage Course's Materials" />

      <main className="flex-grow max-w-3xl w-full mx-auto mt-6 p-6 bg-white shadow-lg rounded-lg min-w-[300px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            {courseData.title}
          </h2>
          <p className="text-slate-900 mt-2">{courseData.description}</p>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold text-slate-900">
            Manage Course Materials
          </h3>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => setShowUploadPopup(true)}
              text="Upload New Material"
              className="px-3 py-1 text-slate-950 bg-fuchsia-200 hover:bg-purple-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-fuchsia-900 active:text-white active:border-fuchsia-400"
            />
          </div>

          <ul className="list-none mt-6 text-slate-500">
            {materials.map((material) => (
              <li key={material.material_id} className="p-2 border-b">
                <div className="flex justify-between items-center">
                  <span className="text-slate-900">
                    {material.material_title}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        window.open(`${material.material_file}`, "_blank")
                      }
                      text="Open"
                      className="px-3 py-1 text-slate-950 bg-blue-300 hover:bg-indigo-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-indigo-950 active:text-white active:border-indigo-400"
                    />
                    <Button
                      onClick={() => confirmDelete(material.material_id)}
                      text="Delete"
                      className="px-3 py-1 text-slate-950 bg-red-300 hover:bg-rose-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-pink-800 active:text-white active:border-rose-400"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <div className="mt-auto p-4 flex justify-center w-full">
        <Button
          onClick={() => router.push("/manageMainPage")}
          text="Back"
          className="px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 font-bold border-2 border-slate-900 active:bg-slate-900 active:border-stone-50 delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-100"
        />
      </div>

      {showPopup && (
        <ConfirmationPopup
          title="Confirm Deletion"
          message="Are you sure you want to delete this material?"
          onConfirm={handleRemove}
          onCancel={() => setShowPopup(false)}
        />
      )}

      {showUploadPopup && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-md flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-lg w-96 border-3">
            <h3 className="text-xl font-bold mb-4">Upload New Material</h3>
            <input
              type="text"
              placeholder="Enter Title"
              value={newMaterial.title}
              onChange={(e) =>
                setNewMaterial((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full p-2 border rounded mb-4"
            />
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end">
              <Button
                onClick={() => setShowUploadPopup(false)}
                text="Cancel"
                className="mr-2 px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 font-bold border-2 border-slate-900 active:bg-slate-900 active:border-stone-50 delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-100"
              />
              <Button
                onClick={handleUpload}
                text="Upload"
                className="px-4 py-2 text-slate-950 bg-emerald-200 hover:bg-green-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-green-900 active:text-white active:border-green-400"
              />
            </div>
          </div>
        </div>
      )}

      {showConfirmUpload && (
        <ConfirmationPopup
          title="Confirm Upload"
          message="Are you sure you want to upload this material?"
          onConfirm={confirmUpload}
          onCancel={() => setShowConfirmUpload(false)}
        />
      )}

      <Footer />
    </div>
  );
};

export default ManageMaterials;
