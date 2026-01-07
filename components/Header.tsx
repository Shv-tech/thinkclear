'use client';

import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';
import UserProfile from './UserProfile';
import { useActiveSection } from './hook/useActiveSection';

export default function Header({
  onSignIn,
}: {
  onSignIn: () => void;
}) {
  const active = useActiveSection(['think', 'about', 'pricing']);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setIsAuthenticated(!!data?.authenticated))
      .catch(() => setIsAuthenticated(false));
  }, []);

  return (
    <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-inner">
        <div className="logo">THINKCLEAR</div>

        <nav className="nav">
          <a href="#think" className={active === 'think' ? 'active' : ''}>Think</a>
          <a href="#about" className={active === 'about' ? 'active' : ''}>About</a>
          <a href="#pricing" className={active === 'pricing' ? 'active' : ''}>Pricing</a>
        </nav>

        <div className="header-actions">
          <ThemeToggle />
          {isAuthenticated ? (
            <UserProfile />
          ) : (
            <button className="signin-btn" onClick={onSignIn}>
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
