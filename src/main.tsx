import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Capacitor } from "@capacitor/core";

// Initialize native plugins
async function initNativePlugins() {
  if (Capacitor.isNativePlatform()) {
    try {
      const { StatusBar, Style } = await import("@capacitor/status-bar");
      // Enable edge-to-edge rendering — app manages its own safe area padding
      await StatusBar.setOverlaysWebView({ overlay: true });
      // Use dark content (dark icons) for light backgrounds
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: "#00000000" });
    } catch (e) {
      console.warn("StatusBar plugin not available:", e);
    }
  }
}

initNativePlugins();

createRoot(document.getElementById("root")!).render(<App />);
