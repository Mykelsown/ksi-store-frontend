// src/pages/Search.jsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchX } from "lucide-react";
import { getProducts } from "../api/products";
import ProductCard from "../components/ProductCard";

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [results, setResults] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadResults = async () => {
      if (!q.trim()) {
        setResults([]);
        return;
      }

      try {
        const response = await getProducts({ search: q.trim(), limit: 60 });
        const payload = response?.data || response;
        const list = payload?.products || [];
        if (!cancelled) {
          setResults(list);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
        }
      }
    };

    void loadResults();

    return () => {
      cancelled = true;
    };
  }, [q]);

  return (
    <div className="section">
      <div className="container">
        <h1
          className="section-title"
          style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}
        >
          Search Results
        </h1>
        <p style={{ color: "var(--text-2)", marginBottom: "2rem" }}>
          {results.length} result{results.length !== 1 ? "s" : ""} for &quot;
          <strong style={{ color: "var(--primary)" }}>{q}</strong>&quot;
        </p>
        {results.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon"><SearchX size={32} /></div>
            <h3>No results found</h3>
            <p>
              Try searching for &quot;iPhone&quot;, &quot;laptop&quot;, or
              &quot;headphones&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
