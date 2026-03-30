import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import './App.css';
import { Analytics } from "@vercel/analytics/react"

import Home from './pages/Home';
import Explore from './pages/Explore';
import Article from './pages/Article';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/article/:id" element={<Article />} />
        <Analytics />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
