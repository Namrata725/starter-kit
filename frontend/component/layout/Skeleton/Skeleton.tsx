"use client";
import React from "react";

type SkeletonVariant = "text" | "circle" | "rect";

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: boolean;
}

export function Skeleton({
  variant = "text",
  width,
  height,
  className = "",
  rounded,
}: SkeletonProps) {
  let defaultStyle: React.CSSProperties = {};

  switch (variant) {
    case "text":
      defaultStyle = { width: width || "100%", height: height || "1rem" };
      break;
    case "rect":
      defaultStyle = { width: width || "100%", height: height || "6rem" };
      break;
    case "circle":
      defaultStyle = { width: width || "40px", height: height || "40px" };
      break;
  }

  const borderRadius =
    rounded !== undefined
      ? rounded
        ? "0.375rem"
        : "0"
      : variant === "circle"
        ? "50%"
        : "0.375rem";

  return (
    <div
      className={`bg-gray-200 animate-pulse ${className}`}
      style={{ ...defaultStyle, borderRadius }}
    />
  );
}
