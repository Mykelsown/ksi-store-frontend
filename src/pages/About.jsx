// src/pages/About.jsx
import './About.css';

export default function About() {
  const stats = [
    { value: '50,000+', label: 'Happy Customers' },
    { value: '2,000+', label: 'Products' },
    { value: '36', label: 'States Covered' },
    { value: '5★', label: 'Average Rating' },
  ];

  const team = [
    { name: 'Kola Adekunle', role: 'Founder & CEO', emoji: '👨‍💼' },
    { name: 'Simi Okafor', role: 'Head of Operations', emoji: '👩‍💼' },
    { name: 'Emeka Nwosu', role: 'Head of Technology', emoji: '👨‍💻' },
    { name: 'Yemi Adeyemi', role: 'Customer Experience Lead', emoji: '👩‍💻' },
  ];

  return (
    <div className="about-page">
      {/* Hero */}
      <div className="page-hero" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #16a34a 100%)' }}>
        <div className="container">
          <h1>About KSI Gadget</h1>
          <p>Nigeria's most trusted online gadget store since 2018.</p>
        </div>
      </div>

      <section className="section">
        <div className="container about-container">
          <p className="about-intro">
            We believe everyone in Nigeria deserves access to top-quality, genuine technology at fair prices.
            From Lagos to Kano, we deliver the world's best gadgets to your doorstep.
          </p>

          {/* Stats */}
          <div className="about-stats">
            {stats.map(s => (
              <div key={s.label} className="stat-card">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Story */}
          <div className="about-story">
            <div>
              <h2>Our Story</h2>
              <p>
                KSI Gadget was founded in 2018 with a simple mission: make authentic, top-quality gadgets
                accessible to every Nigerian. We started as a small shop on Lagos Island, and today we serve
                customers across all 36 states with fast, reliable delivery.
              </p>
              <p>
                We source directly from manufacturers and authorized distributors, ensuring every product
                is 100% genuine and comes with full manufacturer warranty. Our team of gadget enthusiasts
                is here to help you find exactly what you need.
              </p>
            </div>
            <div className="about-visual">
              <div className="about-emoji-grid">
                <span>📱</span><span>💻</span><span>🎧</span>
                <span>⌚</span><span>🔋</span><span>🖱️</span>
              </div>
            </div>
          </div>

          {/* Team */}
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.5rem', marginBottom: '1.5rem', marginTop: '2.5rem' }}>
            Meet the Team
          </h2>
          <div className="team-grid">
            {team.map(m => (
              <div key={m.name} className="team-card">
                <div className="team-avatar">{m.emoji}</div>
                <h3>{m.name}</h3>
                <p>{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
