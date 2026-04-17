// src/pages/Contact.jsx
import { useState } from "react";
import { Clock3, Mail, MapPin, Phone, Send } from "lucide-react";
import { useApp } from "../context/useApp";
import { faqs } from "../data/products";
import { submitContactMessage } from "../api/support";
import "./Contact.css";

export default function Contact() {
  const { showToast } = useApp();
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "Order / Tracking Issue",
    message: "",
  });

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      showToast("Please fill in all required fields");
      return;
    }

    try {
      await submitContactMessage({
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
      });
      showToast("Message sent. We'll reply within 24 hours.");
      setForm({
        name: "",
        email: "",
        subject: "Order / Tracking Issue",
        message: "",
      });
    } catch (error) {
      const message =
        error?.response?.data?.message || "Could not send message right now";
      showToast(message);
    }
  };

  const infoCards = [
    {
      icon: MapPin,
      title: "Visit Us",
      lines: ["12 Broad Street, Lagos Island", "Lagos, Nigeria"],
    },
    {
      icon: Phone,
      title: "Call Us",
      lines: ["+234 800 KSI GADGET", "Mon–Sat, 8am–8pm"],
    },
    {
      icon: Mail,
      title: "Email Us",
      lines: ["support@ksigadget.ng", "sales@ksigadget.ng"],
    },
    {
      icon: Clock3,
      title: "Response Time",
      lines: ["AI Chat: Instant 24/7", "Email: Within 24 hours"],
    },
  ];

  return (
    <div className="contact-page">
      {/* Hero */}
      <div
        className="page-hero"
        style={{
          background: "linear-gradient(135deg, #064e3b 0%, #16a34a 100%)",
        }}
      >
        <div className="container">
          <h1>
            <Mail size={28} /> Contact Us
          </h1>
          <p>We're always here to help. Reach out anytime!</p>
        </div>
      </div>

      <section className="section">
        <div className="container contact-container">
          <div className="contact-grid">
            {/* FORM */}
            <div className="contact-form-card">
              <h2>Send Us a Message</h2>
              <p className="contact-sub">
                Fill out the form and our team will get back to you within 24
                hours.
              </p>

              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Emeka Obi"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Subject</label>
                <select
                  className="form-input"
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                >
                  <option>Order / Tracking Issue</option>
                  <option>Product Inquiry</option>
                  <option>Returns & Refunds</option>
                  <option>Technical Support</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  className="form-input"
                  rows={5}
                  placeholder="Describe your issue or question…"
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                />
              </div>

              <button
                className="btn-primary"
                style={{ width: "100%", padding: "1rem", fontSize: "1rem" }}
                onClick={handleSubmit}
              >
                <Send size={16} /> Send Message
              </button>
            </div>

            {/* INFO */}
            <div className="contact-info">
              {infoCards.map((card) => (
                <div key={card.title} className="info-card">
                  <div className="info-icon">
                    <card.icon size={18} />
                  </div>
                  <div>
                    <h3>{card.title}</h3>
                    {card.lines.map((l, i) => (
                      <p key={i}>{l}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-list">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className={`faq-item ${openFaq === i ? "open" : ""}`}
                >
                  <button
                    className="faq-q"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span>{faq.q}</span>
                    <span className="faq-arrow">▾</span>
                  </button>
                  <div className="faq-a">{faq.a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
