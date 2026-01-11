import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-content">
          <p className="footer-copyright">
            © {currentYear} Sigga P. Boelslund. All rights reserved.
          </p>
          <nav className="footer-links" aria-label="Footer navigation">
            <Link to="/privacy" className="footer-link">Privacy Policy</Link>
            <Link to="/terms" className="footer-link">Terms of Service</Link>
            <Link to="/support" className="footer-link">Contact Us</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}