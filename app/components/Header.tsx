import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { isAuthenticated, isAdmin, isManager, clearAuth } from "~/utils/auth";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [userIsManager, setUserIsManager] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Обновляем состояние авторизации при изменении маршрута и при монтировании
  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setUserIsAdmin(isAdmin());
    setUserIsManager(isManager());
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    clearAuth();
    setAuthenticated(false);
    setUserIsAdmin(false);
    setUserIsManager(false);
    navigate("/");
    closeMenu();
  };

  return (
    <header className="bg-[#302E2F] shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
            <img 
              src="/logo.png" 
              alt="Silver Car Logo" 
              className=""
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-white hover:text-blue-400 transition-colors duration-200 font-medium"
            >
              Главная
            </Link>
            <Link
              to="/cars"
              className="text-white hover:text-blue-400 transition-colors duration-200 font-medium"
            >
              Автомобили
            </Link>
            <Link
              to="/aboutus"
              className="text-white hover:text-blue-400 transition-colors duration-200 font-medium"
            >
              О нас
            </Link>
            {authenticated ? (
              <>
                {userIsAdmin ? (
                  <Link
                    to="/admin"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                  >
                    Админ
                  </Link>
                ) : userIsManager ? (
                  <Link
                    to="/manager"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                  >
                    Manager
                  </Link>
                ) : (
                  <Link
                    to="/profile"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                  >
                    Личный кабинет
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                >
                  Выход
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Войти
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white hover:text-blue-400 transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-600">
            <div className="flex flex-col space-y-4 pt-4">
              <Link
                to="/"
                className="text-white hover:text-blue-400 transition-colors duration-200 font-medium py-2"
                onClick={closeMenu}
              >
                Главная
              </Link>
              <Link
                to="/cars"
                className="text-white hover:text-blue-400 transition-colors duration-200 font-medium py-2"
                onClick={closeMenu}
              >
                Автомобили
              </Link>
              <Link
                to="/about"
                className="text-white hover:text-blue-400 transition-colors duration-200 font-medium py-2"
                onClick={closeMenu}
              >
                О нас
              </Link>
              {authenticated ? (
                <>
                  {userIsAdmin ? (
                    <Link
                      to="/admin"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-center"
                      onClick={closeMenu}
                    >
                      Админ
                    </Link>
                  ) : userIsManager ? (
                    <Link
                      to="/manager"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-center"
                      onClick={closeMenu}
                    >
                      Manager
                    </Link>
                  ) : (
                    <Link
                      to="/profile"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-center"
                      onClick={closeMenu}
                    >
                      Личный кабинет
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium text-center w-full"
                  >
                    Выход
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-center"
                  onClick={closeMenu}
                >
                  Войти
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

