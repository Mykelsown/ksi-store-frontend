// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Headphones,
  Laptop,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Truck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getProducts } from "../api/products";
import ProductCard from "../components/ProductCard";
import samsungS25PlusImage from "../assets/samsung-s25-plus.png";
import macbook17ProImage from "../assets/mackbook-17-pro.png";
import iphone17ProMaxImage from "../assets/Iphone17-PM.png";
import "./Home.css";

// Flash deals reset daily at local midnight — the countdown reflects
// time remaining until then, so it's always accurate rather than an
// arbitrary value that loops forever with no real expiry.
function useCountdownToMidnight() {
  const getSecondsRemaining = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.max(0, Math.round((midnight.getTime() - now.getTime()) / 1000));
  };

  const [time, setTime] = useState(getSecondsRemaining);

  useEffect(() => {
    const t = setInterval(() => setTime(getSecondsRemaining()), 1000);
    return () => clearInterval(t);
  }, []);

  const h = String(Math.floor(time / 3600)).padStart(2, "0");
  const m = String(Math.floor((time % 3600) / 60)).padStart(2, "0");
  const s = String(time % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function Home() {
  const navigate = useNavigate();
  const countdown = useCountdownToMidnight();
  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Carousel slides data
  const heroSlides = [
    {
      image: samsungS25PlusImage,
      title: "Samsung S25+",
      description: "Experience the next generation of mobile technology with the Samsung S25+.",
      cta: "Shop Now",
      ctaLink: "/shop"
    },
    {
      image: macbook17ProImage,
      title: "MacBook Pro 17\"",
      description: "Unleash your creativity with the all-new MacBook Pro 17-inch.",
      cta: "Explore MacBook",
      ctaLink: "/shop"
    },
    {
      image: iphone17ProMaxImage,
      title: "iPhone 17 Pro Max",
      description: "Discover innovation redefined with the iPhone 17 Pro Max.",
      cta: "View iPhone",
      ctaLink: "/shop"
    }
  ];

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };


  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        const response = await getProducts({ limit: 60 });
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
  }, []);

  const featured = products.slice(0, 8);
  const deals = products.filter((p) => p.featured).slice(0, 4);
  const categories = [
    { label: "Smartphones", value: "phones" },
    { label: "Laptops", value: "laptops" },
    { label: "Accessories", value: "accessories" },
  ];
  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))]
    .slice(0, 8)
    .map((name) => ({ name }));

  return (
    <div className="home-page">
      {/* HERO CAROUSEL */}
      <section className="hero">
        <div className="hero-carousel-wrapper">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`hero-slide ${index === currentSlide ? "active" : ""}`}
            >
              <div className="container hero-content">
                <div className="hero-text">
                  <h1 className="hero-title">
                    {slide.title}
                    <br />
                    <span>{slide.subtitle}</span>
                  </h1>
                  <p className="hero-sub">{slide.description}</p>
                  <div className="hero-price">
                    From <strong>{slide.price}</strong>
                  </div>
                  <div className="hero-btns">
                    <button
                      className="btn-primary"
                      onClick={() => navigate(slide.ctaLink)}
                    >
                      {slide.cta}
                    </button>
                    <button className="btn-ghost" onClick={() => navigate("/deals")}>
                      View Deals
                    </button>
                  </div>
                </div>
                <div className="hero-image">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="phone-mockup"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Prev/Next Controls */}
        <button
          className="carousel-btn carousel-btn-prev"
          onClick={goToPrevSlide}
          aria-label="Previous slide"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          className="carousel-btn carousel-btn-next"
          onClick={goToNextSlide}
          aria-label="Next slide"
        >
          <ChevronRight size={22} />
        </button>

        {/* Carousel Indicators/Dots */}
        <div className="hero-dots">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? "active" : ""}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* PROMO BANNERS */}
      <section className="promo-section">
        <div className="container">
          <div className="promo-grid">
            <div
              className="promo-card promo-green"
              onClick={() => navigate("/phones")}
            >
              <div className="promo-label">Up to 30% off</div>
              <div className="promo-title">Latest iPhones</div>
              <div className="promo-emoji">
                <Smartphone size={36} />
              </div>
            </div>
            <div
              className="promo-card promo-dark"
              onClick={() => navigate("/laptops")}
            >
              <div className="promo-label">Best Sellers</div>
              <div className="promo-title">MacBook Pro M4</div>
              <div className="promo-emoji">
                <Laptop size={36} />
              </div>
            </div>
            <div
              className="promo-card promo-accent"
              onClick={() => navigate("/deals")}
            >
              <div className="promo-label">Flash Sale</div>
              <div className="promo-title">Accessories</div>
              <div className="promo-emoji">
                <Headphones size={36} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
            <span className="see-all" onClick={() => navigate("/phones")}>
              See all →
            </span>
          </div>
          <div className="categories-row">
            {categories.map((cat) => (
              <div
                key={cat.label}
                className="cat-pill"
                onClick={() => navigate(`/${cat.value}`)}
              >
                {cat.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <span className="see-all" onClick={() => navigate("/phones")}>
              View all →
            </span>
          </div>
          <div className="products-grid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* FLASH DEALS */}
      <section className="flash-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title white">Flash Deals</h2>
            <div className="countdown">{countdown}</div>
          </div>
          <div className="products-grid">
            {deals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* BRANDS */}
      <section className="section">
        <div className="container">
          <h2
            className="section-title"
            style={{ textAlign: "center", marginBottom: "2rem" }}
          >
            Top Brands
          </h2>
          <div className="brands-row">
            {brands.map((b) => (
              <div
                key={b.name}
                className="brand-logo"
                onClick={() => navigate("/phones")}
              >
                {b.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="why-section">
        <div className="container">
          <div className="why-grid">
            {[
              {
                icon: Truck,
                title: "Fast Delivery",
                desc: "Same-day delivery in Lagos. Nationwide in 3–5 days.",
              },
              {
                icon: ShieldCheck,
                title: "Secure Payment",
                desc: "Multiple payment options. 100% safe and encrypted.",
              },
              {
                icon: RotateCcw,
                title: "Easy Returns",
                desc: "15-day hassle-free returns on all products.",
              },
              {
                icon: ShieldCheck,
                title: "Genuine Products",
                desc: "All products 100% authentic and warranty-backed.",
              },
            ].map((w) => (
              <div key={w.title} className="why-card">
                <div className="why-icon">
                  <w.icon size={20} />
                </div>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
