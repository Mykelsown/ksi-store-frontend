import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, X } from "lucide-react";
import { getCompareList, removeFromCompare, clearCompareList } from "../utils/compare";
import "./CompareBar.css";

export default function CompareBar() {
  const navigate = useNavigate();
  const [items, setItems] = useState(getCompareList());

  useEffect(() => {
    const onChange = () => setItems(getCompareList());
    window.addEventListener("compare-list-changed", onChange);
    return () => window.removeEventListener("compare-list-changed", onChange);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="compare-bar">
      <div className="compare-bar-items">
        <Scale size={18} />
        <span>{items.length} item{items.length !== 1 ? "s" : ""} to compare</span>
        {items.map((item) => (
          <span key={item.id} className="compare-bar-chip">
            {item.name}
            <button
              onClick={() => removeFromCompare(item.id)}
              aria-label={`Remove ${item.name} from comparison`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="compare-bar-actions">
        <button className="btn-ghost" onClick={clearCompareList}>
          Clear
        </button>
        <button
          className="btn-primary"
          disabled={items.length < 2}
          onClick={() => navigate("/compare")}
        >
          Compare
        </button>
      </div>
    </div>
  );
}
