import { useState, useEffect } from 'react';
import { Star, User, Send, Trash2, Edit3, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ReviewSection = ({ propertyId }) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Edit mode
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');

  useEffect(() => {
    fetchReviews();
    fetchAverageRating();
  }, [propertyId]);

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/property/${propertyId}`);
      setReviews(response.data.data);
    } catch (err) {
      console.error('Erreur lors du chargement des avis:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAverageRating = async () => {
    try {
      const response = await api.get(`/reviews/property/${propertyId}/average`);
      setAverageRating(response.data.data.averageRating);
      setTotalReviews(response.data.data.totalReviews);
    } catch (err) {
      console.error('Erreur lors du chargement de la note moyenne:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Veuillez sélectionner une note');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/reviews', {
        propertyId,
        rating,
        comment
      });
      setSuccess('Votre avis a été publié !');
      setRating(0);
      setComment('');
      fetchReviews();
      fetchAverageRating();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la publication de l\'avis');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      fetchReviews();
      fetchAverageRating();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const startEdit = (review) => {
    setEditingReview(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment || '');
  };

  const cancelEdit = () => {
    setEditingReview(null);
    setEditRating(0);
    setEditComment('');
  };

  const handleUpdate = async (reviewId) => {
    try {
      await api.put(`/reviews/${reviewId}`, {
        rating: editRating,
        comment: editComment
      });
      cancelEdit();
      fetchReviews();
      fetchAverageRating();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  const renderStars = (count, interactive = false, onSelect = null, onHover = null, hoverValue = 0) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={() => interactive && onSelect && onSelect(star)}
            onMouseEnter={() => interactive && onHover && onHover(star)}
            onMouseLeave={() => interactive && onHover && onHover(0)}
            className={interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${
                star <= (hoverValue || count)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  // Check if user already has a review
  const userHasReview = reviews.some(review => review.userId === user?._id);

  return (
    <div className="py-8 border-t">
      {/* Header with average rating */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Avis des locataires</h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="ml-1 font-semibold">{averageRating.toFixed(1)}</span>
          </div>
          <span className="text-gray-500">({totalReviews} avis)</span>
        </div>
      </div>

      {/* Add review form - only if authenticated and hasn't reviewed yet */}
      {isAuthenticated && !userHasReview && (
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="font-semibold mb-4">Laisser un avis</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Votre note</label>
              {renderStars(rating, true, setRating, setHoverRating, hoverRating)}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Votre commentaire (optionnel)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Partagez votre expérience..."
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg mb-4 text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Publication...' : 'Publier mon avis'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Message if user already reviewed */}
      {isAuthenticated && userHasReview && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6 text-sm">
          Vous avez déjà laissé un avis sur cette propriété.
        </div>
      )}

      {/* Login prompt if not authenticated */}
      {!isAuthenticated && (
        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-center">
          <p className="text-gray-600 mb-2">Connectez-vous pour laisser un avis</p>
          <a href="/login" className="text-primary font-medium hover:underline">Se connecter</a>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Aucun avis pour le moment.</p>
          <p className="text-sm mt-1">Soyez le premier à donner votre avis !</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0">
              {editingReview === review._id ? (
                // Edit mode
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Modifier votre avis</span>
                    <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mb-3">
                    {renderStars(editRating, true, setEditRating)}
                  </div>
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 text-sm"
                  />
                  <button
                    onClick={() => handleUpdate(review._id)}
                    className="btn-primary text-sm py-2"
                  >
                    Enregistrer
                  </button>
                </div>
              ) : (
                // Display mode
                <>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium">{review.userName}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(review.createdAt), 'd MMMM yyyy', { locale: fr })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderStars(review.rating)}
                      {/* Actions if user owns this review */}
                      {user?._id === review.userId && (
                        <div className="flex items-center space-x-1 ml-4">
                          <button
                            onClick={() => startEdit(review)}
                            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                            title="Modifier"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(review._id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="mt-3 text-gray-600">{review.comment}</p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
