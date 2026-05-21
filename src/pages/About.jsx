// src/pages/About.jsx
import {
  Battery,
  Headphones,
  Laptop,
  Mouse,
  Smartphone,
  CheckCircle,
  Watch,
} from "lucide-react";
import "./About.css";

export default function About() {
  const goals = [
    { icon: Smartphone, text: "Quality Devices" },
    { icon: Battery, text: "Affordable Prices" },
    { icon: CheckCircle, text: "Honest Deals" },
    { icon: Headphones, text: "Fast Response" },
    { icon: Watch, text: "Customer Satisfaction" },
  ];

  const brands = [
    "Apple Inc.",
    "Samsung Electronics",
    "Google",
    "OPPO",
    "Vivo",
  ];

  const stats = [
    { value: "500+", label: "Satisfied Customers" },
    { value: "Multiple", label: "Device Categories" },
    { value: "24/7", label: "Customer Support" },
    { value: "100%", label: "Genuine Products" },
  ];

  return (
    <div className="about-page">
      {/* Hero */}
      <div
        className="page-hero"
        style={{
          background: "linear-gradient(135deg, #064e3b 0%, #16a34a 100%)",
        }}
      >
        <div className="container">
          <h1>About KSI Gadgets</h1>
          <p>Your Trusted Plug for Premium Smartphones & Gadgets in Nigeria</p>
        </div>
      </div>

      <section className="section">
        <div className="container about-container">
          {/* Welcome Section */}
          <div className="about-welcome">
            <h2>Welcome to KSI Gadgets</h2>
            <p>
              Welcome to KSI Gadgets — your trusted plug for premium smartphones, gadgets, and accessories in Nigeria. We specialize in delivering quality devices at competitive prices, helping customers stay connected with the latest tech without stress.
            </p>
          </div>

          {/* What We Offer */}
          <div className="about-what-we-offer">
            <h2>What We Offer</h2>
            <p className="about-intro">
              At KSI Gadgets, we deal in brand-new, UK-used, open-box, and neatly used devices from top brands like:
            </p>
            <div className="brands-list">
              {brands.map((brand) => (
                <span key={brand} className="brand-tag">{brand}</span>
              ))}
            </div>
            <p>
              From iPhones and Samsung Galaxy devices to Google Pixels and other Android flagships, we bring you tested, reliable gadgets you can trust.
            </p>
          </div>

          {/* Our Goals */}
          <div className="about-goals">
            <h2>Our Commitment to You</h2>
            <div className="goals-grid">
              {goals.map((goal) => {
                const IconComponent = goal.icon;
                return (
                  <div key={goal.text} className="goal-card">
                    <div className="goal-icon">
                      <IconComponent size={24} />
                    </div>
                    <p>{goal.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="about-why-choose">
            <h2>Why Choose KSI Gadgets?</h2>
            <p>
              We understand how important your device is to your lifestyle, business, and everyday communication. That's why every gadget sold by KSI Gadgets is carefully checked to ensure excellent performance and value for your money.
            </p>
            <p>
              Whether you're upgrading your phone, buying your first flagship device, or searching for a trusted gadget vendor, KSI Gadgets is here to serve you with professionalism and reliability.
            </p>
          </div>

          {/* Stats */}
          <div className="about-stats">
            {stats.map((s) => (
              <div key={s.label} className="stat-card">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="about-cta">
            <h2>Join Our Community</h2>
            <p>
              Join hundreds of satisfied customers who trust KSI Gadgets for premium tech deals and excellent customer service. Your next device is just one message away.
            </p>
            <a href="/contact" className="cta-button">
              Get in Touch
            </a>
          </div>

          {/* Products Visual */}
          <div className="about-visual">
            <h3>Our Product Categories</h3>
            <div className="about-emoji-grid">
              <span title="Smartphones">
                <Smartphone size={28} />
              </span>
              <span title="Laptops">
                <Laptop size={28} />
              </span>
              <span title="Headphones">
                <Headphones size={28} />
              </span>
              <span title="Smartwatches">
                <Watch size={28} />
              </span>
              <span title="Power Banks">
                <Battery size={28} />
              </span>
              <span title="Accessories">
                <Mouse size={28} />
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
