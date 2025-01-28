/**
 * @fileoverview Manages responsive navigation menu functionality
 * @description Initializes navigation toggle behavior and handles click events and Escape key
 *              for showing/hiding the mobile navigation menu with accessibility support.
 */

document.addEventListener("DOMContentLoaded", function () {
  // Navigation toggle functionality
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");

  if (navToggle && nav) {
    const handleNavToggle = () => {
      nav.classList.toggle("active");
      navToggle.setAttribute("aria-expanded", nav.classList.contains("active"));
    };

    // Close the navigation when clicking outside of it
    const handleOutsideClick = (e) => {
      if (!nav.contains(e.target) && !navToggle.contains(e.target)) {
        nav.classList.remove("active");
        navToggle.setAttribute("aria-expanded", "false");
      }
    };

    // Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("active")) {
        nav.classList.remove("active");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });

    navToggle.addEventListener("click", handleNavToggle);
    document.addEventListener("click", handleOutsideClick);
  }
});
