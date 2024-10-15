import React from "react";

export default function Button({
  children,
  type = "button",
  bgColor = "bg-black",
  textColor = "text-white",
  hoverBgColor = "hover:bg-black/80",
  hoverTextColor = "hover:text-white",
  activeBgColor = "active:bg-black/60",
  activeTextColor = "active:text-white",
  disabledBgColor = "disabled:bg-black/40",
  disabledTextColor = "disabled:text-white",
  className = "",
  ...props
}) {
  return (
    <button
      className={`px-4 py-2 rounded-lg ${bgColor} ${textColor} ${hoverBgColor} ${hoverTextColor} ${activeBgColor} ${activeTextColor} ${disabledBgColor} ${disabledTextColor} ${className}`}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
