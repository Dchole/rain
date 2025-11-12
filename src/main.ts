import { RainScene } from "./rainScene.js";

/**
 * Initialize the rain animation when the page loads
 */
function initializeRainAnimation(): void {
  const canvas = document.getElementById("rainCanvas") as HTMLCanvasElement;

  if (!canvas) {
    console.error("Canvas element not found");
    return;
  }

  try {
    const rainScene = new RainScene(canvas);
    rainScene.start();

    console.log("🌧️ Night rain animation started successfully!");

    // Add some fun console messages
    console.log("🌙 Welcome to the night rain scene");
    console.log("⚡ Lightning may strike at any moment");
    console.log("🎮 Use the controls to adjust the rain and lightning");
  } catch (error) {
    console.error("Failed to initialize rain animation:", error);
  }
}

// Wait for DOM content to load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeRainAnimation);
} else {
  initializeRainAnimation();
}

// Handle visibility change to optimize performance
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    console.log("🌙 Animation paused (tab hidden)");
  } else {
    console.log("🌧️ Animation resumed");
  }
});
