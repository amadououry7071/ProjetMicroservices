import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Search, Trash2, Star, User } from 'lucide-react';
import api from '../../api/axios';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get('/admin/reviews');
      setReviews(response.data.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) return;
    
    setActionLoading(reviewId);
    try {
      await api.delete(`/admin/reviews/${reviewId}`, { data: { reason: 'Supprimé par admin' } });
      fetchReviews();
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReviews = reviews.filter(review => 
    review.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
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
        <div className="mb-6">
          <Link to="/admin" className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ChevronLeft className="w-5 h-5 mr-1" /> Retour au dashboard
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Modération des Avis</h1>
            <p className="text-gray-600 mt-1">{reviews.length} avis au total</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par auteur ou contenu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review._id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="font-semibold">{review.userName}</h3>
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    {review.comment ? (
                      <p className="text-gray-700">{review.comment}</p>
                    ) : (
                      <p className="text-gray-400 italic">Aucun commentaire</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      ID Propriété: {review.propertyId}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(review._id)}
                  disabled={actionLoading === review._id}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Supprimer cet avis"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl">
            Aucun avis trouvé
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;
