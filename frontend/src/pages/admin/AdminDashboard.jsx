import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Home, Calendar, Star, Activity, TrendingUp } from 'lucide-react';
import api from '../../api/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalReservations: 0,
    totalReviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchLogs();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Erreur stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await api.get('/admin/logs');
      setRecentLogs(response.data.data.slice(0, 5));
    } catch (error) {
      console.error('Erreur logs:', error);
    }
  };

  const statCards = [
    { title: 'Utilisateurs', value: stats.totalUsers, icon: Users, color: 'bg-blue-500', link: '/admin/users' },
    { title: 'Propriétés', value: stats.totalProperties, icon: Home, color: 'bg-green-500', link: '/admin/properties' },
    { title: 'Réservations', value: stats.totalReservations, icon: Calendar, color: 'bg-purple-500', link: '/admin/reservations' },
    { title: 'Avis', value: stats.totalReviews, icon: Star, color: 'bg-yellow-500', link: '/admin/reviews' },
  ];

  const formatAction = (action) => {
    const actions = {
      'BAN_USER': 'Utilisateur banni',
      'UNBAN_USER': 'Utilisateur débanni',
      'DELETE_USER': 'Utilisateur supprimé',
      'DELETE_PROPERTY': 'Propriété supprimée',
      'DELETE_REVIEW': 'Avis supprimé',
      'DELETE_RESERVATION': 'Réservation supprimée'
    };
    return actions[action] || action;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-600 mt-1">Bienvenue dans le panneau d'administration</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <Link
              key={index}
              to={card.link}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{card.title}</p>
                  <p className="text-3xl font-bold mt-1">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              Actions rapides
            </h2>
            <div className="space-y-3">
              <Link to="/admin/users" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-3 text-blue-500" />
                  <span>Gérer les utilisateurs</span>
                </div>
              </Link>
              <Link to="/admin/properties" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <Home className="w-5 h-5 mr-3 text-green-500" />
                  <span>Gérer les propriétés</span>
                </div>
              </Link>
              <Link to="/admin/reviews" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <Star className="w-5 h-5 mr-3 text-yellow-500" />
                  <span>Modérer les avis</span>
                </div>
              </Link>
              <Link to="/admin/reservations" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-3 text-pink-500" />
                  <span>Voir les réservations</span>
                </div>
              </Link>
              <Link to="/admin/logs" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <Activity className="w-5 h-5 mr-3 text-purple-500" />
                  <span>Voir les logs</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary" />
              Activité récente
            </h2>
            {recentLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune activité récente</p>
            ) : (
              <div className="space-y-3">
                {recentLogs.map((log, index) => (
                  <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{formatAction(log.action)}</p>
                      <p className="text-xs text-gray-500">
                        Par {log.adminName} • {new Date(log.createdAt).toLocaleString('fr-FR')}
                      </p>
                      {log.targetName && (
                        <p className="text-xs text-gray-400 mt-1">Cible: {log.targetName}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link to="/admin/logs" className="block text-center text-primary text-sm mt-4 hover:underline">
              Voir tous les logs →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
