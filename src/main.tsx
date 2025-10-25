import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "@/context/theme-context";

// Hydrate the React app, ensuring StrictMode catches potential side effects in development.
// The ThemeProvider sits here so every route and component receives consistent dark/light mode state.

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ThemeProvider>
			<App />
		</ThemeProvider>
	</StrictMode>
);
