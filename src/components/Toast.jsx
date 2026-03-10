// src/components/Toast.jsx
import { useApp } from "../context/AppContext";
import "./Toast.css";

export default function Toast() {
  const { toasts } = useApp();
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className="toast-item">
          {t.message}
        </div>
      ))}
    </div>
  );
}
