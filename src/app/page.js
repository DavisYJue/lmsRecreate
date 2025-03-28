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
      const response = await fetch(
        `/api/login?username=${encodeURIComponent(username)}`
      );

      if (!response.ok) throw new Error("Invalid username or password");

      const accounts = await response.json();

      if (accounts.length === 0 || accounts[0].password !== password) {
        throw new Error("Invalid username or password");
      }

      // Store user session
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: accounts[0].account_id,
          role: accounts[0].role,
        })
      );

      // Redirect based on role
      if (accounts[0].role === "student") {
        router.push("/lmsMainPageStudent");
      } else {
        router.push("/lmsMainPage");
      }
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
          {error && (
            <div className="text-red-500 mb-4 text-center">{error}</div>
          )}
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
                className="absolute right-3 top-13 text-sm text-slate-950 hover:text-blue-700 focus:outline-none"
              >
                {showPassword ? (
                  <FiEyeOff className="text-xl" />
                ) : (
                  <FiEye className="text-xl" />
                )}
              </button>
            </div>
            <div className="flex justify-center">
              <LoginButton
                text={isLoading ? "Logging In..." : "Login"}
                onClick={handleSubmit}
                disabled={isLoading}
              />
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
