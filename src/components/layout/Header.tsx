import { useNavigate } from "react-router-dom";
import { getAuthInstance } from '../../firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from "../../contexts/AuthContext";
import { Navigation } from "./Navigation";
import { useMenu } from "../../hooks/useMenu";
import './Header.css';

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    isOpen: isUserMenuOpen,
    toggle: toggleUserMenu,
    close: closeUserMenu,
    menuRef,
    handleKeyDown
  } = useMenu();

  const logOut = async () => {
    closeUserMenu();
    try {
      // Navigate first, then sign out to avoid ProtectedRoute redirect
      navigate('/');
      await signOut(getAuthInstance());
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getInitial = () => {
    return user?.displayName?.charAt(0).toUpperCase() ||
      user?.email?.charAt(0).toUpperCase() ||
      '?';
  };

  return (
    <header className="header" role="banner">
      <div className="header-container">
        <h1 className="header-title">Boelslund PlanWell Finance</h1>

        <Navigation />

        {user ? (
          <div className="header-user-section" ref={menuRef}>
            <span className="header-user-name">
              {user.displayName || user.email}
            </span>
            <button
              className="header-user-button"
              onClick={toggleUserMenu}
              onKeyDown={handleKeyDown}
              aria-label="User menu"
              aria-haspopup="true"
              aria-expanded={isUserMenuOpen}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="User avatar"
                  className="header-avatar"
                />
              ) : (
                <div
                  className="header-avatar-placeholder"
                  role="img"
                  aria-label="User avatar"
                >
                  {getInitial()}
                </div>
              )}
            </button>

            {isUserMenuOpen && (
              <div className="header-dropdown" role="menu">
                <button
                  className="header-menu-item"
                  role="menuitem"
                  onClick={logOut}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
          </div>
        )}
      </div>
    </header>
  );
}