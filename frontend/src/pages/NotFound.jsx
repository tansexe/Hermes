import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const NotFound = () => {
  return (
    <div className="app-container">
      <Header />
      <main className="explore-empty" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 className="explore-empty-title" style={{ fontSize: '4rem', fontWeight: 900, fontFamily: "'Playfair Display', serif", color: 'var(--primary)', marginBottom: '1rem' }}>404</h1>
        <h2 className="explore-empty-title">Page Not Found</h2>
        <p className="explore-empty-sub">The story you're looking for doesn't exist or is still unfolding.</p>
        <Link to="/" style={{ marginTop: '2rem', padding: '0.75rem 1.5rem', backgroundColor: 'var(--primary)', color: 'var(--background)', fontWeight: 700, borderRadius: '4px', textDecoration: 'none' }}>
          Return to Home
        </Link>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
