import ReactDOM from "react-dom/client";
import App from "./App";
import { register } from "./serviceWorker";
import "./index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(<App />);

register();
