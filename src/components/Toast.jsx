// src/components/Toast.jsx
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";
import { useApp } from "../context/useApp";
import "./Toast.css";

const toastIcons = {
  success: <CheckCircle size={20} />,
  error: <AlertCircle size={20} />,
  warning: <AlertTriangle size={20} />,
  info: <Info size={20} />,
  default: <Info size={20} />,
};

export default function Toast() {
  const { toasts, setToasts } = useApp();

  const handleRemoveToast = (id) => {
    setToasts?.((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-item toast-${t.type || "default"}`}>
          <div className="toast-icon">
            {toastIcons[t.type || "default"]}
          </div>
          <div className="toast-message">
            {t.message}
          </div>
          <button
            className="toast-close"
            onClick={() => handleRemoveToast(t.id)}
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
