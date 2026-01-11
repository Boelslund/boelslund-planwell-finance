import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useMenu } from "../../hooks/useMenu";
import './Navigation.css';

export function Navigation() {
  const { user } = useAuth();
  const {
    isOpen: isNavMenuOpen,
    toggle: toggleNavMenu,
    menuRef,
    handleKeyDown
  } = useMenu();

  return (
    <nav
      className="navigation"
      role="navigation"
      aria-label="Navigation"
      ref={menuRef}
    >
      <button
        className="navigation-menu-toggle"
        aria-label="Toggle navigation menu"
        aria-haspopup="true"
        aria-expanded={isNavMenuOpen}
        onClick={toggleNavMenu}
        onKeyDown={handleKeyDown}
      >
        ☰
      </button>

      <ul className={`navigation-menu ${isNavMenuOpen ? 'open' : ''}`}>
        <li className="navigation-item">
          <NavLink to="/" end className="navigation-link">Home</NavLink>
        </li>
        {user ? (
          <>
            <li className="navigation-item">
              <NavLink to="/dashboard" className="navigation-link">Dashboard</NavLink>
            </li>
          </>
        ) : (
          <>
            <li className="navigation-item">
              <NavLink to="/signin" className="navigation-link">Sign In</NavLink>
            </li>
            <li className="navigation-item">
              <NavLink to="/signup" className="navigation-link">Sign Up</NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  )
}