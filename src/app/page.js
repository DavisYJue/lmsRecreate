"use client";
import { useState } from "react";
import LoginInput from "@/app/components/LoginInput";
import LoginButton from "@/app/components/LoginButton";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all information");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      // Check content type before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid server response");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      const redirectPath =
        data.role === "student" ? "/lmsMainPageStudent" : "/lmsMainPage";
      router.push(redirectPath);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between"
      style={{
        backgroundImage: "linear-gradient(to bottom, #a9c3d2, #fcf4e7)",
      }}
    >
      <Header title="Cloud LMS" />

      <div className="flex-grow flex flex-col justify-center items-center">
        <h2 className="text-indigo-950 text-4xl font-bold mb-5">Login</h2>
        <div className="bg-white p-8 rounded-xl border-4 border-slate-900 w-max">
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit}>
            <LoginInput
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
            <div className="relative">
              <LoginInput
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-13 text-slate-600 hover:text-blue-700 focus:outline-none"
              >
                {showPassword ? (
                  <FiEyeOff className="text-xl" />
                ) : (
                  <FiEye className="text-xl" />
                )}
              </button>
            </div>
            <div className="flex justify-center mt-6">
              <LoginButton
                text={isLoading ? "Authenticating..." : "Login"}
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full"
              />
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
