import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { isAuthenticated } from "~/utils/auth";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();

  // Обновляем состояние авторизации при изменении маршрута и при монтировании
  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-800">Silver Car</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Главная
            </Link>
            <Link
              to="/cars"
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Автомобили
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              О нас
            </Link>
            {authenticated ? (
              <Link
                to="/admin"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Админ
              </Link>
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
            className="md:hidden text-gray-700 hover:text-blue-600 transition-colors"
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
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4 pt-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium py-2"
                onClick={closeMenu}
              >
                Главная
              </Link>
              <Link
                to="/cars"
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium py-2"
                onClick={closeMenu}
              >
                Автомобили
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium py-2"
                onClick={closeMenu}
              >
                О нас
              </Link>
              {authenticated ? (
                <Link
                  to="/admin"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-center"
                  onClick={closeMenu}
                >
                  Админ
                </Link>
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

