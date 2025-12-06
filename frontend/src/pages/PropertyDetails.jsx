import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Maximize, DoorOpen, Wifi, Car, Wind, Flame, Tv, ChevronLeft, Calendar, Share, Heart, Check, X } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ReviewSection from '../components/ReviewSection';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  const [reservationLoading, setReservationLoading] = useState(false);
  const [reservationError, setReservationError] = useState('');
  const [reservationSuccess, setReservationSuccess] = useState(false);

  const images = [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
  ];

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/properties/${id}`);
      setProperty(response.data.data);
    } catch (err) {
      setError('Impossible de charger cette propriété');
    } finally {
      setLoading(false);
    }
  };

  const calculateNights = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const calculateTotal = () => {
    return calculateNights() * (property?.price || 0);
  };

  const handleReservation = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'tenant') {
      setReservationError('Seuls les locataires peuvent faire une réservation');
      return;
    }

    setReservationLoading(true);
    setReservationError('');

    try {
      await api.post('/reservations', {
        propertyId: id,
        startDate,
        endDate,
      });
      setReservationSuccess(true);
    } catch (err) {
      setReservationError(err.response?.data?.message || 'Erreur lors de la réservation');
    } finally {
      setReservationLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold mb-2">{error || 'Propriété non trouvée'}</h2>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">Retour à l'accueil</button>
      </div>
    );
  }

  const features = [
    { key: 'hasWifi', icon: Wifi, label: 'WiFi' },
    { key: 'hasParking', icon: Car, label: 'Parking' },
    { key: 'hasAirConditioning', icon: Wind, label: 'Climatisation' },
    { key: 'hasHeating', icon: Flame, label: 'Chauffage' },
    { key: 'hasInternet', icon: Tv, label: 'Internet' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ChevronLeft className="w-5 h-5 mr-1" /> Retour
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{property.address?.street}, {property.address?.city} {property.address?.postalCode}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100">
              <Share className="w-5 h-5" /> <span>Partager</span>
            </button>
            <button onClick={() => setIsLiked(!isLiked)} className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100">
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-primary text-primary' : ''}`} /> <span>Sauvegarder</span>
            </button>
          </div>
        </div>
      </div>

      {/* Images Grid */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[500px]">
          <div className="col-span-2 row-span-2">
            <img src={property.images?.[0] || images[0]} alt={property.title} className="w-full h-full object-cover" />
          </div>
          {images.slice(1).map((img, i) => (
            <div key={i} className="relative">
              <img src={img} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-6 py-6 border-b">
              <div className="flex items-center"><Maximize className="w-5 h-5 mr-2 text-gray-500" /><span>{property.surface} m²</span></div>
              <div className="flex items-center"><DoorOpen className="w-5 h-5 mr-2 text-gray-500" /><span>{property.rooms} pièces</span></div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${property.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {property.status === 'available' ? 'Disponible' : 'Indisponible'}
              </span>
            </div>

            <div className="py-8 border-b">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </div>

            <div className="py-8 border-b">
              <h2 className="text-xl font-semibold mb-4">Équipements</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {features.map(({ key, icon: Icon, label }) => (
                  <div key={key} className={`flex items-center space-x-3 p-3 rounded-lg ${property.features?.[key] ? 'bg-green-50' : 'bg-gray-50'}`}>
                    {property.features?.[key] ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-gray-400" />}
                    <Icon className={`w-5 h-5 ${property.features?.[key] ? 'text-gray-700' : 'text-gray-400'}`} />
                    <span className={property.features?.[key] ? 'text-gray-700' : 'text-gray-400'}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section des avis */}
            <ReviewSection propertyId={id} />
          </div>

          {/* Right Column - Reservation Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white border border-gray-200 rounded-xl shadow-lg p-6">
              <div className="flex items-baseline mb-6">
                <span className="text-3xl font-bold">{property.price?.toLocaleString('fr-CA')} $</span>
                <span className="text-gray-500 ml-2">/ nuit</span>
              </div>

              {reservationSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Réservation confirmée !</h3>
                  <p className="text-gray-600 mb-4">Votre demande a été envoyée au propriétaire.</p>
                  <button onClick={() => navigate('/reservations')} className="btn-primary w-full">Voir mes réservations</button>
                </div>
              ) : (
                <>
                  <div className="border border-gray-300 rounded-xl mb-4">
                    <div className="grid grid-cols-2">
                      <div className="p-3 border-r border-b border-gray-300">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">ARRIVÉE</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full outline-none text-sm" />
                      </div>
                      <div className="p-3 border-b border-gray-300">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">DÉPART</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full outline-none text-sm" />
                      </div>
                    </div>
                  </div>

                  {reservationError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{reservationError}</div>
                  )}

                  {/* Afficher le bouton seulement pour les locataires */}
                  {user?.role === 'owner' ? (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4 text-sm text-center">
                      En tant que propriétaire, vous ne pouvez pas réserver
                    </div>
                  ) : (
                    <button onClick={handleReservation} disabled={reservationLoading || property.status !== 'available'} className="btn-primary w-full mb-4 disabled:opacity-50">
                      {reservationLoading ? 'Réservation en cours...' : isAuthenticated ? 'Réserver' : 'Connectez-vous pour réserver'}
                    </button>
                  )}

                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{property.price?.toLocaleString('fr-CA')} $ x {calculateNights()} nuits</span>
                      <span>{calculateTotal().toLocaleString('fr-CA')} $</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frais de service</span>
                      <span>{Math.round(calculateTotal() * 0.1).toLocaleString('fr-CA')} $</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-3 border-t">
                      <span>Total</span>
                      <span>{Math.round(calculateTotal() * 1.1).toLocaleString('fr-CA')} $</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
