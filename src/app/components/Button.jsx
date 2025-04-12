"use client";
import React from "react";

const Button = ({
  onClick,
  text,
  className = "",
  disabled = false,
  type = "button", // 🛠️ Default to "button" to prevent unintended submits
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${className} ${
        disabled ? "bg-gray-300 cursor-not-allowed" : ""
      } delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-100 border-2 border-slate-900 font-bold p-3 rounded-lg`}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default Button;
