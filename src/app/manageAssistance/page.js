"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";
import ConfirmationPopup from "../components/ConfirmationPopup";
import DataTable from "../components/DataTable";
import SearchInput from "../components/SearchInput";

const ManageAssistance = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");

  const [assistants, setAssistants] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Search for assistance table
  const [popupSearchQuery, setPopupSearchQuery] = useState(""); // Search for add assistance popup
  const [confirmAssistant, setConfirmAssistant] = useState(null);
  const [availableAssistants, setAvailableAssistants] = useState([
    { id: 1, name: "Emily Davis", assistantId: "A101", department: "Math" },
    {
      id: 2,
      name: "Michael Scott",
      assistantId: "A102",
      department: "Physics",
    },
  ]);

  useEffect(() => {
    if (courseId) {
      const fetchAssistantsData = async () => {
        // Simulated data (Replace with API call)
        const assistantsData = [
          {
            id: 3,
            name: "Sarah Lee",
            assistantId: "A103",
            email: "sarah@example.com",
            department: "Math",
          },
          {
            id: 4,
            name: "David Kim",
            assistantId: "A104",
            email: "david@example.com",
            department: "Physics",
          },
        ];
        setAssistants(assistantsData);
      };
      fetchAssistantsData();
    }
  }, [courseId]);

  const confirmAddAssistant = (assistant) => {
    setConfirmAssistant(assistant);
  };

  const addAssistant = () => {
    if (confirmAssistant) {
      setAssistants([...assistants, confirmAssistant]);
      setAvailableAssistants(
        availableAssistants.filter((a) => a.id !== confirmAssistant.id)
      );
      setConfirmAssistant(null);
      setIsPopupOpen(false);
    }
  };

  const [confirmRemoveAssistant, setConfirmRemoveAssistant] = useState(null);

  const confirmRemove = (assistant) => {
    setConfirmRemoveAssistant(assistant);
  };

  const removeAssistantConfirmed = () => {
    if (confirmRemoveAssistant) {
      setAssistants(
        assistants.filter(
          (assistant) => assistant.id !== confirmRemoveAssistant.id
        )
      );
      setConfirmRemoveAssistant(null);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "linear-gradient(to bottom, #a9c3d2, #fcf4e7)",
      }}
    >
      <Header title="Manage Teaching Assistants" />
      <main className="max-w-4xl w-full mx-auto mt-6 mb-6 p-6 bg-white shadow-lg rounded-lg flex-1">
        <h2 className="text-2xl font-bold mb-4 text-slate-900">Assistants</h2>

        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search assistants by name, ID, or department"
        />

        <Button
          text="Add Assistant"
          onClick={() => setIsPopupOpen(true)}
          className="mb-4 px-4 py-2 text-slate-950 bg-blue-300 hover:bg-indigo-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-indigo-950 active:text-white active:border-indigo-400"
        />

        <DataTable
          data={assistants}
          searchQuery={searchQuery}
          onRemove={confirmRemove}
          entityType="Assistant"
        />

        {isPopupOpen && (
          <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center">
            <div className="bg-white p-6 rounded-md shadow-lg w-96">
              <h3 className="text-xl font-bold mb-4">Add Assistant</h3>

              <SearchInput
                value={popupSearchQuery}
                onChange={(e) => setPopupSearchQuery(e.target.value)}
                placeholder="Search by name, ID, or department"
              />

              <ul className="max-h-40 overflow-auto border rounded-md">
                {availableAssistants
                  .filter(
                    (assistant) =>
                      assistant.name
                        .toLowerCase()
                        .includes(popupSearchQuery.toLowerCase()) ||
                      assistant.assistantId
                        .toLowerCase()
                        .includes(popupSearchQuery.toLowerCase()) ||
                      assistant.department
                        .toLowerCase()
                        .includes(popupSearchQuery.toLowerCase())
                  )
                  .map((assistant) => (
                    <li
                      key={assistant.id}
                      className="p-2 border-b flex justify-between items-center"
                    >
                      <span>
                        {assistant.name} ({assistant.assistantId}) -{" "}
                        {assistant.department}
                      </span>
                      <Button
                        text="Add"
                        onClick={() => confirmAddAssistant(assistant)}
                        className="px-3 py-1 text-slate-950 bg-emerald-200 hover:bg-green-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-green-900 active:text-white active:border-green-400"
                      />
                    </li>
                  ))}
              </ul>

              <div className="flex justify-center">
                <Button
                  text="Close"
                  onClick={() => setIsPopupOpen(false)}
                  className="mt-4 px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 font-bold border-2 border-slate-900 active:bg-slate-900 active:border-stone-50 delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-100"
                />
              </div>
            </div>
          </div>
        )}

        {confirmAssistant && (
          <ConfirmationPopup
            title="Confirm Add Assistant"
            message={`Are you sure you want to add ${confirmAssistant.name} (${confirmAssistant.assistantId})?`}
            onConfirm={addAssistant}
            onCancel={() => setConfirmAssistant(null)}
          />
        )}

        {confirmRemoveAssistant && (
          <ConfirmationPopup
            title="Confirm Remove Assistant"
            message={`Are you sure you want to remove ${confirmRemoveAssistant.name} (${confirmRemoveAssistant.assistantId})?`}
            onConfirm={removeAssistantConfirmed}
            onCancel={() => setConfirmRemoveAssistant(null)}
          />
        )}
      </main>

      <div className="flex justify-center">
        <Button
          text="Back"
          onClick={() => router.push("/manageMainPage")}
          className="mb-4 px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 font-bold border-2 border-slate-900 active:bg-slate-900 active:border-stone-50 delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-100"
        />
      </div>
      <Footer />
    </div>
  );
};

export default ManageAssistance;
