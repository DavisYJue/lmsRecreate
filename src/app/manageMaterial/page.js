"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";
import ConfirmationPopup from "../components/ConfirmationPopup";

const courseData = {
  title: "Cloud Computing 101",
  description: "An introduction to cloud computing and cloud architectures.",
  materials: [
    {
      name: "Lecture 1: Introduction to Cloud Computing",
      link: "/materials/lecture1.pdf",
    },
    {
      name: "Lecture 2: Advanced Cloud Architectures",
      link: "/materials/lecture2.pdf",
    },
    {
      name: "Project Guidelines",
      link: "/materials/project_guidelines.pdf",
    },
  ],
};

const ManageMaterials = () => {
  const router = useRouter();
  const [materials, setMaterials] = useState(courseData.materials);
  const [showPopup, setShowPopup] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ title: "", file: null });
  const [showConfirmUpload, setShowConfirmUpload] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    setNewMaterial((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  const handleUpload = () => {
    if (newMaterial.file && newMaterial.title) {
      setShowConfirmUpload(true);
    }
  };

  const confirmUpload = () => {
    const updatedMaterials = [
      ...materials,
      { name: newMaterial.title, link: URL.createObjectURL(newMaterial.file) },
    ];
    setMaterials(updatedMaterials);
    setShowUploadPopup(false);
    setShowConfirmUpload(false);
    setNewMaterial({ title: "", file: null });
  };

  const confirmDelete = (materialName) => {
    setMaterialToDelete(materialName);
    setShowPopup(true);
  };

  const handleRemove = () => {
    const updatedMaterials = materials.filter(
      (material) => material.name !== materialToDelete
    );
    setMaterials(updatedMaterials);
    setShowPopup(false);
    setMaterialToDelete(null);
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
            {materials.map((material, index) => (
              <li key={index} className="p-2 border-b">
                <div className="flex justify-between items-center">
                  <span className="text-slate-900">{material.name}</span>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => window.open(material.link, "_blank")}
                      text="Open"
                      className="px-3 py-1 text-slate-950 bg-blue-300 hover:bg-indigo-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-indigo-950 active:text-white active:border-indigo-400"
                    />
                    <Button
                      onClick={() => confirmDelete(material.name)}
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
