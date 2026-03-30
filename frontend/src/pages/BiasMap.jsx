import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getSpectrumData, getCategoryFilters, getBiasMapStats } from '../utils/biasMapData';
import { Sparkles, Filter } from 'lucide-react';

const BiasMap = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const categoryFilters = getCategoryFilters();
  const stats = getBiasMapStats();

  const spectrumData = useMemo(() => {
    return getSpectrumData(activeCategory);
  }, [activeCategory]);

  // Get reliability bar color based on score
  const getBarColor = (score) => {
    if (score >= 80) return 'var(--primary)';
    if (score >= 60) return '#555';
    return '#999';
  };

  // Get bias-specific accent for column header decorations
  const getColumnAccent = (key) => {
    switch (key) {
      case 'left': return '#dc3545';
      case 'right': return '#2563eb';
      case 'center': return '#f0c238';
      case 'unbiased': return '#22c55e';
      case 'unknown': return '#9ca3af';
      default: return '#666';
    }
  };

  return (
    <div className="app-container">
      <Header totalSources={stats.totalSources} totalStories={stats.totalArticles} />

      <main className="bias-map">
        {/* Hero Section */}
        <section className="bias-map__hero">
          <div className="container">
            <div className="bias-map__hero-badge">
              <Sparkles size={16} strokeWidth={2} />
              <span>INTERACTIVE TOOL</span>
            </div>
            <h1 className="bias-map__hero-title">Media Bias Map</h1>
            <p className="bias-map__hero-desc">
              A comprehensive visualization of how {stats.totalSources} news sources distribute across the
              political spectrum. Explore reliability ratings, ownership structures, and topic-level bias
              patterns.
            </p>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="bias-map__filters">
          <div className="container">
            <div className="bias-map__filter-row">
              <div className="bias-map__filter-icon">
                <Filter size={16} strokeWidth={2} />
              </div>
              {categoryFilters.map((filter) => (
                <button
                  key={filter.key}
                  className={`bias-map__filter-btn ${activeCategory === filter.key ? 'active' : ''}`}
                  onClick={() => setActiveCategory(filter.key)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Spectrum Grid */}
        <section className="bias-map__spectrum">
          <div className="container">
            <div className="bias-map__grid">
              {spectrumData.map((column) => (
                <div key={column.key} className="bias-map__column">
                  {/* Column Header */}
                  <div className="bias-map__column-header">
                    <span
                      className="bias-map__column-label"
                      style={{ color: getColumnAccent(column.key) }}
                    >
                      {column.label}
                    </span>
                  </div>

                  {/* Source Count */}
                  <div className="bias-map__column-count">
                    <span className="bias-map__count-number">{column.count}</span>
                    <span className="bias-map__count-label">SOURCES</span>
                  </div>

                  {/* Source Cards */}
                  <div className="bias-map__cards">
                    {column.sources.map((source) => (
                      <div key={source.domain} className="bias-map__card">
                        <div className="bias-map__card-top">
                          <div
                            className="bias-map__card-icon"
                            style={{
                              backgroundColor: getColumnAccent(column.key),
                              color: '#fff',
                            }}
                          >
                            {source.initial}
                          </div>
                          <span className="bias-map__card-name">{source.name}</span>
                        </div>
                        <div className="bias-map__card-bar-row">
                          <div className="bias-map__card-bar">
                            <div
                              className="bias-map__card-bar-fill"
                              style={{
                                width: `${source.reliability}%`,
                                backgroundColor: getBarColor(source.reliability),
                              }}
                            />
                          </div>
                          <span className="bias-map__card-score">{source.reliability}</span>
                        </div>
                      </div>
                    ))}

                    {column.sources.length === 0 && (
                      <div className="bias-map__empty">
                        No sources match this filter
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BiasMap;
