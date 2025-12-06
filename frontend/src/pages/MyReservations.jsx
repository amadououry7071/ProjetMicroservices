import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, CheckCircle, XCircle, AlertCircle, ChevronRight, Trash2, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const MyReservations = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  
  // Modal de refus
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reservations');
      setReservations(response.data.data || []);
    } catch (err) {
      setError('Impossible de charger vos réservations');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, reason = null) => {
    try {
      const payload = { status };
      if (reason) payload.reason = reason;
      await api.patch(`/reservations/${id}/status`, payload);
      fetchReservations();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const openRejectModal = (id) => {
    setRejectingId(id);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (rejectingId) {
      await updateStatus(rejectingId, 'rejected', rejectReason);
      setShowRejectModal(false);
      setRejectingId(null);
      setRejectReason('');
    }
  };

  const cancelReservation = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return;
    try {
      await api.patch(`/reservations/${id}/cancel`);
      fetchReservations();
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      alert(err.response?.data?.message || 'Erreur lors de l\'annulation');
    }
  };

  const deleteReservation = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer définitivement cette réservation ?')) return;
    try {
      await api.delete(`/reservations/${id}`);
      fetchReservations();
    } catch (err) {
      console.error('Error deleting reservation:', err);
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'confirmed':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Confirmée' };
      case 'cancelled':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Annulée' };
      case 'rejected':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Refusée' };
      default:
        return { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'En attente' };
    }
  };

  const filteredReservations = reservations.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const filters = [
    { key: 'all', label: 'Toutes' },
    { key: 'pending', label: 'En attente' },
    { key: 'confirmed', label: 'Confirmées' },
    { key: 'cancelled', label: 'Annulées' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes réservations</h1>
        <p className="text-gray-600 mb-8">
          {user?.role === 'owner' ? 'Gérez les demandes de réservation pour vos propriétés' : 'Consultez et gérez vos réservations'}
        </p>

        {/* Filters */}
        <div className="flex items-center space-x-2 mb-8 overflow-x-auto pb-2">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${
                filter === f.key ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-xl font-semibold mb-2">{error}</h3>
            <button onClick={fetchReservations} className="btn-primary mt-4">Réessayer</button>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune réservation</h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' ? "Vous n'avez pas encore de réservation" : `Aucune réservation ${filters.find(f => f.key === filter)?.label.toLowerCase()}`}
            </p>
            <Link to="/" className="btn-primary inline-block">Explorer les logements</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map(reservation => {
              const statusConfig = getStatusConfig(reservation.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div key={reservation._id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span>{statusConfig.label}</span>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Dates</p>
                            <p className="font-medium text-gray-900">
                              {format(new Date(reservation.startDate), 'dd MMM', { locale: fr })} - {format(new Date(reservation.endDate), 'dd MMM yyyy', { locale: fr })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-5 h-5 mr-2 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Durée</p>
                            <p className="font-medium text-gray-900">
                              {Math.ceil((new Date(reservation.endDate) - new Date(reservation.startDate)) / (1000 * 60 * 60 * 24))} nuits
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="text-xl font-bold text-gray-900">{reservation.totalPrice?.toLocaleString('fr-CA')} $</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions for owner - pending */}
                    {user?.role === 'owner' && reservation.status === 'pending' && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateStatus(reservation._id, 'confirmed')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => openRejectModal(reservation._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Refuser
                        </button>
                      </div>
                    )}

                    {/* Actions for owner - confirmed (can cancel or delete) */}
                    {user?.role === 'owner' && reservation.status === 'confirmed' && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => cancelReservation(reservation._id)}
                          className="flex items-center space-x-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                          title="Annuler la réservation"
                        >
                          <Ban className="w-4 h-4" />
                          <span>Annuler</span>
                        </button>
                      </div>
                    )}

                    {/* Owner can delete cancelled/rejected reservations */}
                    {user?.role === 'owner' && (reservation.status === 'cancelled' || reservation.status === 'rejected') && (
                      <button
                        onClick={() => deleteReservation(reservation._id)}
                        className="flex items-center space-x-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        title="Supprimer définitivement"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Supprimer</span>
                      </button>
                    )}

                    {/* Actions for tenant - can cancel pending or confirmed */}
                    {user?.role === 'tenant' && (reservation.status === 'pending' || reservation.status === 'confirmed') && (
                      <button
                        onClick={() => cancelReservation(reservation._id)}
                        className="flex items-center space-x-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                        title="Annuler ma réservation"
                      >
                        <Ban className="w-4 h-4" />
                        <span>Annuler</span>
                      </button>
                    )}

                    <Link to={`/properties/${reservation.propertyId}`} className="flex items-center text-primary hover:text-primary-dark font-medium">
                      Voir le logement <ChevronRight className="w-5 h-5 ml-1" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de refus */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Refuser la réservation</h3>
              
              <p className="text-gray-600 mb-4">
                Veuillez indiquer la raison du refus. Cette information sera envoyée au locataire.
              </p>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="input-field h-32 resize-none mb-4"
                placeholder="Ex: Le logement est en rénovation durant cette période..."
              />

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectingId(null);
                    setRejectReason('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Annuler
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Confirmer le refus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReservations;
