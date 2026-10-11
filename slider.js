
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const slider = document.getElementById("image-slider");
  const track = document.getElementById("slider-track");
  const previousButton = document.getElementById("previous-button");
  const nextButton = document.getElementById("next-button");
  const dotsContainer = document.getElementById("slider-dots");
  const currentNumber = document.getElementById("current-number");
  const totalNumber = document.getElementById("total-number");

  const copyrightButton = document.getElementById("copyright-button");
  const copyrightNotice = document.getElementById("copyright-notice");
  const copyrightYear = document.getElementById("copyright-year");

  if (
    !slider ||
    !track ||
    !previousButton ||
    !nextButton ||
    !dotsContainer
  ) {
    console.error("Required slider elements were not found.");
    return;
  }

  const originalSlides = Array.from(track.children);
  const totalSlides = originalSlides.length;

  if (totalSlides === 0) {
    console.error("The slider needs at least one slide.");
    return;
  }

  let currentIndex = 1;
  let isTransitioning = false;
  let transitionTimer = null;

  const dots = [];

  function formatNumber(number) {
    return String(number).padStart(2, "0");
  }

  // Clone the last and first slides for infinite looping.
  const firstClone = originalSlides[0].cloneNode(true);
  const lastClone = originalSlides[totalSlides - 1].cloneNode(true);

  firstClone.setAttribute("aria-hidden", "true");
  lastClone.setAttribute("aria-hidden", "true");

  firstClone.querySelectorAll("img").forEach((image) => {
    image.alt = "";
  });

  lastClone.querySelectorAll("img").forEach((image) => {
    image.alt = "";
  });

  track.insertBefore(lastClone, originalSlides[0]);
  track.appendChild(firstClone);

  // Generate navigation dots dynamically.
  originalSlides.forEach((slide, index) => {
    const dot = document.createElement("button");

    dot.type = "button";
    dot.className = "slider-dot";
    dot.setAttribute("aria-label", `Go to image ${index + 1}`);
    dot.setAttribute("aria-current", "false");

    dot.addEventListener("click", () => {
      if (isTransitioning) return;
      goToSlide(index + 1);
    });

    dotsContainer.appendChild(dot);
    dots.push(dot);
  });

  totalNumber.textContent = formatNumber(totalSlides);

  // Update the image counter and active navigation dot.
  function updateInterface() {
    const realIndex =
      ((currentIndex - 1) % totalSlides + totalSlides) % totalSlides;

    currentNumber.textContent = formatNumber(realIndex + 1);

    dots.forEach((dot, index) => {
      dot.setAttribute(
        "aria-current",
        String(index === realIndex)
      );
    });
  }

  // Move the track horizontally.
  function updateTrack(animate = true) {
    track.style.transition = animate ? "" : "none";

    track.style.transform =
      `translateX(-${currentIndex * 100}%)`;

    if (!animate) {
      track.getBoundingClientRect();
      track.style.transition = "";
    }
  }

  // Move to the requested slide.
  function goToSlide(index) {
    if (isTransitioning) return;

    currentIndex = index;
    isTransitioning = true;

    updateInterface();
    updateTrack(true);
    startTransitionFallback();
  }

  function nextSlide() {
    if (isTransitioning) return;
    goToSlide(currentIndex + 1);
  }

  function previousSlide() {
    if (isTransitioning) return;
    goToSlide(currentIndex - 1);
  }

  // Prevent navigation from remaining locked if an event is missed.
  function startTransitionFallback() {
    clearTimeout(transitionTimer);

    transitionTimer = setTimeout(() => {
      finishTransition();
    }, 700);
  }

  // Reset the track position after reaching a cloned slide.
  function finishTransition() {
    if (!isTransitioning) return;

    clearTimeout(transitionTimer);

    if (currentIndex === 0) {
      currentIndex = totalSlides;
      updateTrack(false);
    } else if (currentIndex === totalSlides + 1) {
      currentIndex = 1;
      updateTrack(false);
    }

    isTransitioning = false;
    updateInterface();
  }

  // Detect the end of the CSS sliding animation.
  track.addEventListener("transitionend", (event) => {
    if (
      event.target !== track ||
      event.propertyName !== "transform"
    ) {
      return;
    }

    finishTransition();
  });

  // Connect the Previous and Next buttons.
  previousButton.addEventListener("click", previousSlide);
  nextButton.addEventListener("click", nextSlide);

  // Keyboard navigation when the slider is focused.
  slider.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      nextSlide();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      previousSlide();
    }
  });

  // Display or hide the copyright notice.
  if (copyrightButton && copyrightNotice && copyrightYear) {
    copyrightYear.textContent = new Date().getFullYear();

    copyrightButton.addEventListener("click", () => {
      const isExpanded =
        copyrightButton.getAttribute("aria-expanded") === "true";

      copyrightButton.setAttribute(
        "aria-expanded",
        String(!isExpanded)
      );

      copyrightNotice.hidden = isExpanded;
    });
  }

  // Start at the first original slide.
  updateTrack(false);
  updateInterface();
});
