/*
  ==========================================================
  JERRICK RESUME WEBSITE - JAVASCRIPT (STEP 4)
  ==========================================================
  This file adds beginner-friendly interactive features:
  1) Smooth scrolling for navigation links
  2) Active navigation highlight while scrolling
  3) Fade-in animations using Intersection Observer
  4) Back-to-top button behavior
  5) Dynamic current year in footer
  6) Placeholder download resume functionality

  Notes:
  - Only Vanilla JavaScript is used.
  - We run code after DOM is loaded to safely access elements.
  - Null checks are added before using elements for safety.
*/

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /*
    --------------------------------------------------------
    FEATURE 1: SMOOTH SCROLLING FOR NAVIGATION LINKS
    --------------------------------------------------------
    Purpose:
    - When user clicks a navigation link, scroll smoothly to section.
    - Prevent sudden jump behavior for better user experience.
  */
  const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId) {
        return;
      }

      const targetSection = document.querySelector(targetId);

      /*
        If target section exists, prevent default jump and perform smooth scroll.
      */
      if (targetSection) {
        event.preventDefault();

        targetSection.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

        /*
          Accessibility improvement:
          Move keyboard focus to target section after scrolling.
          tabindex=-1 allows focus even on non-focusable elements.
        */
        targetSection.setAttribute("tabindex", "-1");
        targetSection.focus({ preventScroll: true });
      }
    });
  });

  /*
    --------------------------------------------------------
    FEATURE 2: ACTIVE NAVIGATION HIGHLIGHT ON SCROLL
    --------------------------------------------------------
    Purpose:
    - Detect current section in viewport.
    - Highlight matching nav link.
    - Remove highlight from inactive links.

    How it works:
    - We create a map between section ID and nav link.
    - On scroll, find section closest to top viewport area.
    - Update classes and aria-current for accessibility.
  */
  const sections = document.querySelectorAll("main section[id]");

  const navLinkMap = new Map();
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href.startsWith("#")) {
      navLinkMap.set(href.substring(1), link);
    }
  });

  function updateActiveNav() {
    let activeSectionId = "";

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionBottom = rect.bottom;

      /*
        A section is considered active when it crosses a viewing band
        near top/middle of the screen.
      */
      if (sectionTop <= 180 && sectionBottom >= 180) {
        activeSectionId = section.id;
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
    });

    if (activeSectionId && navLinkMap.has(activeSectionId)) {
      const activeLink = navLinkMap.get(activeSectionId);
      if (activeLink) {
        activeLink.classList.add("active");
        activeLink.setAttribute("aria-current", "page");
      }
    }
  }

  /*
    Use passive scroll listener for better performance.
    Passive tells browser we do not call preventDefault on scroll.
  */
  window.addEventListener("scroll", updateActiveNav, { passive: true });
  window.addEventListener("resize", updateActiveNav);
  updateActiveNav();

  /*
    --------------------------------------------------------
    FEATURE 3: FADE-IN ANIMATION WITH INTERSECTION OBSERVER
    --------------------------------------------------------
    Purpose:
    - Add subtle reveal animation when section enters viewport.
    - Keep behavior efficient (better than continuous scroll checks).

    Steps:
    1) Add .fade-in class to elements we want to animate.
    2) Observe each element.
    3) When visible, add .active class.
  */
  const fadeInTargets = document.querySelectorAll(".resume-section, .hero, .card");

  fadeInTargets.forEach((element) => {
    element.classList.add("fade-in");
  });

  if ("IntersectionObserver" in window) {
    const fadeObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");

            /*
              Unobserve after animation triggers once.
              This keeps animation subtle and avoids repeated flashing.
            */
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -30px 0px"
      }
    );

    fadeInTargets.forEach((element) => {
      fadeObserver.observe(element);
    });
  } else {
    /*
      Fallback for very old browsers that do not support IntersectionObserver.
      We simply show content without animation.
    */
    fadeInTargets.forEach((element) => {
      element.classList.add("active");
    });
  }

  /*
    --------------------------------------------------------
    FEATURE 4: BACK TO TOP BUTTON
    --------------------------------------------------------
    Purpose:
    - Keep long-page navigation easy.
    - Button is hidden at page start, appears after scroll.

    Implementation detail:
    - If #back-to-top button does not exist in HTML yet,
      we create it automatically with JavaScript.
    - This keeps current HTML unchanged and still functional.
  */
  let backToTopButton = document.getElementById("back-to-top");

  if (!backToTopButton) {
    backToTopButton = document.createElement("button");
    backToTopButton.id = "back-to-top";
    backToTopButton.type = "button";
    backToTopButton.textContent = "Top";
    backToTopButton.setAttribute("aria-label", "Back to top");

    /*
      Minimal inline styling so button is usable immediately.
      You can move these styles into CSS later if preferred.
    */
    backToTopButton.style.position = "fixed";
    backToTopButton.style.right = "1rem";
    backToTopButton.style.bottom = "1rem";
    backToTopButton.style.zIndex = "999";
    backToTopButton.style.padding = "0.65rem 0.85rem";
    backToTopButton.style.border = "none";
    backToTopButton.style.borderRadius = "10px";
    backToTopButton.style.backgroundColor = "#2563eb";
    backToTopButton.style.color = "#ffffff";
    backToTopButton.style.cursor = "pointer";
    backToTopButton.style.boxShadow = "0 8px 20px rgba(15, 23, 42, 0.2)";
    backToTopButton.style.display = "none";

    document.body.appendChild(backToTopButton);
  }

  function toggleBackToTopVisibility() {
    if (!backToTopButton) {
      return;
    }

    if (window.scrollY > 300) {
      backToTopButton.style.display = "inline-block";
    } else {
      backToTopButton.style.display = "none";
    }
  }

  window.addEventListener("scroll", toggleBackToTopVisibility, { passive: true });
  toggleBackToTopVisibility();

  if (backToTopButton) {
    backToTopButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  /*
    --------------------------------------------------------
    FEATURE 5: DYNAMIC COPYRIGHT YEAR
    --------------------------------------------------------
    Purpose:
    - Automatically show current year in footer.
    - Avoid manually editing year every year.
  */
  const yearElement = document.getElementById("current-year");
  if (yearElement) {
    yearElement.textContent = String(new Date().getFullYear());
  }

  /*
    --------------------------------------------------------
    FEATURE 6: DOWNLOAD RESUME BUTTON (PLACEHOLDER)
    --------------------------------------------------------
    Purpose:
    - Provide temporary behavior until real PDF is added.
    - Show user-friendly message on click.

    Future upgrade:
    - Replace alert with a direct file download link, for example:
      assets/documents/Jerrick_Prince_Abraham_Resume.pdf
  */
  const downloadResumeButton = document.getElementById("download-resume-btn");
  if (downloadResumeButton) {
    downloadResumeButton.addEventListener("click", () => {
      window.alert("Resume PDF will be available soon.");
    });
  }

  /*
    --------------------------------------------------------
    FEATURE 7: KEYBOARD-FRIENDLY IMPROVEMENT
    --------------------------------------------------------
    Purpose:
    - Allow keyboard users to close/focus out from back-to-top button
      quickly with Escape key when needed.
  */
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && backToTopButton) {
      backToTopButton.blur();
    }
  });
});
