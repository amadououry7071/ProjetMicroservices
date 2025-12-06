import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Activity, User, Home, Star, Calendar, Filter } from 'lucide-react';
import api from '../../api/axios';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/admin/logs');
      setLogs(response.data.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAction = (action) => {
    const actions = {
      'BAN_USER': { label: 'Utilisateur banni', color: 'text-orange-600', bg: 'bg-orange-100' },
      'UNBAN_USER': { label: 'Utilisateur débanni', color: 'text-green-600', bg: 'bg-green-100' },
      'DELETE_USER': { label: 'Utilisateur supprimé', color: 'text-red-600', bg: 'bg-red-100' },
      'DELETE_PROPERTY': { label: 'Propriété supprimée', color: 'text-red-600', bg: 'bg-red-100' },
      'DELETE_REVIEW': { label: 'Avis supprimé', color: 'text-red-600', bg: 'bg-red-100' },
      'DELETE_RESERVATION': { label: 'Réservation supprimée', color: 'text-red-600', bg: 'bg-red-100' },
      'UPDATE_PASSWORD': { label: 'Mot de passe modifié', color: 'text-blue-600', bg: 'bg-blue-100' }
    };
    return actions[action] || { label: action, color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  const getIcon = (targetType) => {
    const icons = {
      'user': User,
      'property': Home,
      'review': Star,
      'reservation': Calendar,
      'admin': Activity
    };
    return icons[targetType] || Activity;
  };

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.targetType === filter);

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
        <div className="mb-6">
          <Link to="/admin" className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ChevronLeft className="w-5 h-5 mr-1" /> Retour au dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Historique des Actions</h1>
              <p className="text-gray-600 mt-1">{logs.length} actions enregistrées</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600 mr-4">Filtrer par:</span>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'Tout' },
                { value: 'user', label: 'Utilisateurs' },
                { value: 'property', label: 'Propriétés' },
                { value: 'review', label: 'Avis' },
                { value: 'reservation', label: 'Réservations' }
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFilter(item.value)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filter === item.value
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Logs Timeline */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Aucune action enregistrée
            </div>
          ) : (
            <div className="space-y-6">
              {filteredLogs.map((log, index) => {
                const actionInfo = formatAction(log.action);
                const Icon = getIcon(log.targetType);
                
                return (
                  <div key={log._id || index} className="flex items-start space-x-4">
                    <div className={`p-2 rounded-full ${actionInfo.bg}`}>
                      <Icon className={`w-5 h-5 ${actionInfo.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{actionInfo.label}</p>
                        <span className="text-sm text-gray-500">
                          {new Date(log.createdAt).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Par <span className="font-medium">{log.adminName}</span>
                      </p>
                      {log.targetName && (
                        <p className="text-sm text-gray-500">
                          Cible: {log.targetName}
                        </p>
                      )}
                      {log.reason && (
                        <p className="text-sm text-gray-400 mt-1">
                          Raison: {log.reason}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;
