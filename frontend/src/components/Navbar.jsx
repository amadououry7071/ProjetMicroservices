import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Home, Calendar, Building, User, LogOut, Plus, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-primary">LocaHome</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {user?.role === 'owner' && (
                  <Link
                    to="/create-property"
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Ajouter un bien</span>
                  </Link>
                )}
                
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 border border-gray-300 rounded-full p-2 hover:shadow-md transition-shadow"
                  >
                    <Menu className="w-5 h-5 text-gray-500" />
                    <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 animate-fadeIn">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                          {user?.role === 'owner' ? 'Propriétaire' : user?.role === 'admin' ? 'Admin' : 'Locataire'}
                        </span>
                      </div>
                      
                      <Link
                        to="/reservations"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <span>Mes réservations</span>
                      </Link>
                      
                      {user?.role === 'owner' && (
                        <Link
                          to="/my-properties"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <Building className="w-5 h-5 text-gray-500" />
                          <span>Mes propriétés</span>
                        </Link>
                      )}
                      
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-5 h-5 text-gray-500" />
                        <span>Mon profil</span>
                      </Link>
                      
                      {user?.role === 'admin' && (
                        <>
                          <hr className="my-2" />
                          <Link
                            to="/admin"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-red-600"
                          >
                            <Shield className="w-5 h-5" />
                            <span>Administration</span>
                          </Link>
                        </>
                      )}
                      
                      <hr className="my-2" />
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors w-full text-left text-red-600"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors font-medium"
                >
                  Connexion
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors font-medium"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 animate-fadeIn">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-4 py-2 bg-gray-50 rounded-lg mb-4">
                  <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                
                <Link
                  to="/reservations"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
                >
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span>Mes réservations</span>
                </Link>
                
                {user?.role === 'owner' && (
                  <>
                    <Link
                      to="/my-properties"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
                    >
                      <Building className="w-5 h-5 text-gray-500" />
                      <span>Mes propriétés</span>
                    </Link>
                    <Link
                      to="/create-property"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
                    >
                      <Plus className="w-5 h-5 text-gray-500" />
                      <span>Ajouter un bien</span>
                    </Link>
                  </>
                )}
                
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
                >
                  <User className="w-5 h-5 text-gray-500" />
                  <span>Mon profil</span>
                </Link>
                
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg text-red-600"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Administration</span>
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg w-full text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Déconnexion</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 hover:bg-gray-50 rounded-lg font-medium"
                >
                  Connexion
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 bg-primary text-white rounded-lg text-center font-medium"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
