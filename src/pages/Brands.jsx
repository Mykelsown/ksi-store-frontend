// src/pages/Brands.jsx
import { useNavigate } from 'react-router-dom';
import { brands } from '../data/products';
import './Brands.css';

export default function Brands() {
  const navigate = useNavigate();
  return (
    <div className="section">
      <div className="container">
        <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Our Brands</h1>
        <p style={{ color: 'var(--text-2)', marginBottom: '2rem' }}>
          We partner with the world's leading technology brands.
        </p>
        <div className="brands-cards-grid">
          {brands.map(b => (
            <div key={b.name} className="brand-card" onClick={() => navigate(`/${b.category}`)}>
              <div className="brand-big">{b.emoji}</div>
              <h3>{b.name}</h3>
              <p>{b.desc}</p>
              <span className="brand-shop">Shop now →</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
