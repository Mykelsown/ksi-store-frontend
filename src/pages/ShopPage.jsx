// src/pages/ShopPage.jsx
import { useEffect, useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import { getProducts } from "../api/products";
import ProductCard from "../components/ProductCard";
import "./ShopPage.css";

const heroConfig = {
  Smartphones: {
    title: "Smartphones",
    sub: "Latest phones from top brands",
    bg: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)",
  },
  Laptops: {
    title: "Laptops & Computers",
    sub: "Power and performance for every need",
    bg: "linear-gradient(135deg, #1c1917 0%, #292524 100%)",
  },
  Accessories: {
    title: "Accessories",
    sub: "Headphones, watches, cables and more",
    bg: "linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%)",
  },
  deals: {
    title: "Flash Deals",
    sub: "Limited time offers — grab them fast!",
    bg: "linear-gradient(135deg, #7c2d12 0%, #dc2626 100%)",
  },
};

export default function ShopPage({ category }) {
  const config = heroConfig[category];
  const mappedCategory = category === "deals" ? undefined : category;
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [maxPrice, setMaxPrice] = useState(2000);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const sortConfig = {
      popular: { sortBy: "createdAt", sortOrder: "DESC" },
      "price-asc": { sortBy: "price", sortOrder: "ASC" },
      "price-desc": { sortBy: "price", sortOrder: "DESC" },
      rating: { sortBy: "rating", sortOrder: "DESC" },
    };

    const loadProducts = async () => {
      try {
        const params = {
          limit: 100,
          category: mappedCategory,
          featured: category === "deals" ? true : undefined,
          maxPrice,
          ...sortConfig[sortBy],
        };

        const response = await getProducts(params);
        const payload = response?.data || response;
        const list = payload?.products || [];

        if (!cancelled) {
          setProducts(list);
        }
      } catch {
        if (!cancelled) {
          setProducts([]);
        }
      }
    };

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [category, mappedCategory, maxPrice, sortBy]);

  const filtered = useMemo(() => {
    let list = products;

    if (selectedBrand !== "All")
      list = list.filter((p) => p.brand === selectedBrand);

    return list;
  }, [products, selectedBrand]);

  const brands = [
    "All",
    ...new Set((products || []).map((p) => p.brand).filter(Boolean)),
  ];

  return (
    <div className="shop-page">
      {/* Hero */}
      <div className="page-hero" style={{ background: config.bg }}>
        <div className="container">
          <h1>{config.title}</h1>
          <p>{config.sub}</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="shop-layout">
            {/* Sidebar */}
            <aside className="filters-sidebar">
              <h3 className="filter-title">Filters</h3>

              {brands.length > 1 && (
                <div className="filter-group">
                  <label className="filter-label">Brand</label>
                  {brands.map((b) => (
                    <label key={b} className="check-item">
                      <input
                        type="radio"
                        name="brand"
                        checked={selectedBrand === b}
                        onChange={() => setSelectedBrand(b)}
                      />
                      {b}
                    </label>
                  ))}
                </div>
              )}

              <div className="filter-group">
                <label className="filter-label">Max Price</label>
                <input
                  type="range"
                  min="10"
                  max="2000"
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="price-range"
                />
                <span className="price-label">
                  Up to ₦
                  {maxPrice.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <button
                className="btn-primary"
                style={{ width: "100%" }}
                onClick={() => {
                  setSelectedBrand("All");
                  setMaxPrice(2000);
                  setSortBy("popular");
                }}
              >
                Reset Filters
              </button>
            </aside>

            {/* Products */}
            <div className="products-main">
              <div className="sort-bar">
                <span className="results-count">
                  {filtered.length} product{filtered.length !== 1 ? "s" : ""}{" "}
                  found
                </span>
                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="popular">Sort: Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              {filtered.length > 0 ? (
                <div className="products-grid">
                  {filtered.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon"><SearchX size={32} /></div>
                  <h3>No products found</h3>
                  <p>Try adjusting your filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
