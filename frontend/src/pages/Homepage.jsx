import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { siteContent } from "../siteContent.js";

export default function Homepage() {
  const [slideIndex, setSlideIndex] = useState(0);
  const slides = siteContent.hero.slides;

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  function prevSlide() {
    setSlideIndex((i) => (i - 1 + slides.length) % slides.length);
  }
  function nextSlide() {
    setSlideIndex((i) => (i + 1) % slides.length);
  }

  return (
    <div className="site-page">
      {/* Nav */}
      <nav className="site-nav">
        <Link to="/" className="site-nav-brand">
          {siteContent.schoolName}
          <span className="placeholder-mark"></span>
        </Link>
        <div className="site-nav-links">
          {siteContent.nav.links.map((link) => (
            <a key={link} href="#">{link}</a>
          ))}
          <Link to="/login" className="site-enroll-btn">{siteContent.hero.ctaText}</Link>
        </div>
      </nav>

      {/* Hero carousel */}
      <section className="site-hero">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`site-hero-slide ${i === slideIndex ? "active" : ""}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        ))}
        <div className="site-hero-overlay" />
        <div className="site-hero-content">
          <h1>{slides[slideIndex].headline}</h1>
          <p>{slides[slideIndex].subtext}</p>
          <Link to="/login" className="site-hero-cta">{siteContent.hero.ctaText}</Link>
        </div>

        <button className="site-hero-arrow prev" onClick={prevSlide} aria-label="Previous slide">‹</button>
        <button className="site-hero-arrow next" onClick={nextSlide} aria-label="Next slide">›</button>

        <div className="site-hero-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`site-hero-dot ${i === slideIndex ? "active" : ""}`}
              onClick={() => setSlideIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Programs */}
      <section className="site-section">
        <div className="site-section-header">
          <h2>Our Programs</h2>
          <p>Explore the academic paths we offer, designed to prepare you for what's next.</p>
        </div>
        <div className="site-program-grid">
          {siteContent.programs.map((program) => (
            <div className="site-program-card" key={program.title}>
              <div className="site-program-icon">{program.icon}</div>
              <h3>{program.title}</h3>
              <p>{program.description}</p>
              <a className="site-program-link" href={program.link}>Learn more →</a>
            </div>
          ))}
        </div>
      </section>

      {/* Campuses */}
      <section className="site-section site-campus-section">
        <div className="site-section-header">
          <h2>Our Campuses</h2>
          <p>Choose the campus that fits your journey.</p>
        </div>
        <div className="site-campus-grid">
          {siteContent.campuses.map((campus) => (
            <div className="site-campus-card" key={campus.name}>
              <div className="site-campus-image" style={{ backgroundImage: `url(${campus.image})` }} />
              <div className="site-campus-card-body">
                <h4>{campus.name}</h4>
                <a href={campus.link}>View details →</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="site-cta">
        <h2>{siteContent.cta.headline}</h2>
        <p>{siteContent.cta.subtext}</p>
        <Link to="/login" className="site-cta-btn">{siteContent.cta.buttonText}</Link>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="site-footer-grid">
          <div>
            <h4>{siteContent.schoolName}</h4>
            <p>{siteContent.footer.address}</p>
          </div>
          <div>
            <h4>Contact</h4>
            <p>{siteContent.footer.phone}</p>
            <p>{siteContent.footer.email}</p>
          </div>
          <div>
            <h4>Follow Us</h4>
            <div className="site-footer-social">
              {siteContent.footer.socials.map((s) => (
                <a key={s} href="#" aria-label={s}>{s[0]}</a>
              ))}
            </div>
          </div>
        </div>
        <div className="site-footer-bottom">
          © {new Date().getFullYear()} {siteContent.schoolName}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}