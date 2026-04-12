import { useEffect } from "react";
import "./App.css";
import RoutesConfig from "./routes";
import { setupAxiosInterceptors } from "./api/http";
import AppTourManager from "./tours/AppTourManager";

export default function App() {
  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

  return (
    <>
      <RoutesConfig />
      <AppTourManager />
    </>
  );
}