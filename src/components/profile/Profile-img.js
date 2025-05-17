// src/components/profile/Profile-img.jsx
import React from "react";
// note: go up two levels to reach src/component-styles
import "../../component-styles/Profile-img.css";

export default function ProfileImage({ src }) {
  return (
    <img
      id="profile-img"
      src={src || "https://via.placeholder.com/150"}
      alt="Profile"
    />
  );
}
