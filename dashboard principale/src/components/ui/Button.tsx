import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Button({
  children,
  variant = "secondary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const variantClass =
    variant === "primary"
      ? "bg-tt-blue text-white hover:bg-blue-600"
      : variant === "ghost"
        ? "bg-transparent text-gray-700 hover:bg-gray-100"
        : "bg-white text-gray-900 ring-1 ring-inset ring-gray-200 hover:bg-gray-50";

  return (
    <button
      {...props}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition",
        variantClass,
        props.className ?? "",
      ]
        .join(" ")
        .trim()}
    >
      {children}
    </button>
  );
}
