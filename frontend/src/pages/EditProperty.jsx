import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Home, MapPin, Save, Plus, X, Image, Upload } from 'lucide-react';
import api from '../api/axios';

const EditProperty = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    surface: '',
    rooms: '',
    price: '',
    status: 'available',
    address: { street: '', city: '', postalCode: '', country: 'Canada' },
    features: {
      hasElevator: false,
      hasParking: false,
      hasBalcony: false,
      isFurnished: false,
      hasAirConditioning: false,
      hasHeating: false,
      hasInternet: false,
    },
    images: [],
  });

  const [imageUrl, setImageUrl] = useState('');

  const addImage = () => {
    if (imageUrl.trim() && !formData.images.includes(imageUrl.trim())) {
      setFormData({ ...formData, images: [...formData.images, imageUrl.trim()] });
      setImageUrl('');
    }
  };

  const removeImage = (index) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
  };

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await api.get(`/properties/${id}`);
      const property = response.data.data;
      setFormData({
        title: property.title || '',
        description: property.description || '',
        surface: property.surface || '',
        rooms: property.rooms || '',
        price: property.price || '',
        status: property.status || 'available',
        address: property.address || { street: '', city: '', postalCode: '', country: 'Canada' },
        features: property.features || {},
        images: property.images || [],
      });
    } catch (err) {
      setError('Impossible de charger la propriété');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData({ ...formData, address: { ...formData.address, [field]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFeatureToggle = (feature) => {
    setFormData({
      ...formData,
      features: { ...formData.features, [feature]: !formData.features[feature] },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const data = {
        ...formData,
        surface: Number(formData.surface),
        rooms: Number(formData.rooms),
        price: Number(formData.price),
      };
      await api.put(`/properties/${id}`, data);
      navigate('/my-properties');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setSaving(false);
    }
  };

  const features = [
    { key: 'hasElevator', label: 'Ascenseur', icon: '🛗' },
    { key: 'hasParking', label: 'Parking', icon: '🚗' },
    { key: 'hasBalcony', label: 'Balcon', icon: '🌅' },
    { key: 'isFurnished', label: 'Meublé', icon: '🛋️' },
    { key: 'hasAirConditioning', label: 'Climatisation', icon: '❄️' },
    { key: 'hasHeating', label: 'Chauffage', icon: '🔥' },
    { key: 'hasInternet', label: 'Internet', icon: '📶' },
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
      <div className="max-w-3xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ChevronLeft className="w-5 h-5 mr-1" /> Retour
        </button>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Modifier la propriété</h1>
          <p className="text-gray-600 mb-8">Mettez à jour les informations de votre bien</p>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations générales */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Home className="w-5 h-5 mr-2 text-primary" /> Informations générales
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="input-field" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className="input-field h-32 resize-none" required />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Surface (m²)</label>
                  <input type="number" name="surface" value={formData.surface} onChange={handleChange} className="input-field" min="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pièces</label>
                  <input type="number" name="rooms" value={formData.rooms} onChange={handleChange} className="input-field" min="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prix/nuit (CAD)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} className="input-field" min="1" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select name="status" value={formData.status} onChange={handleChange} className="input-field">
                  <option value="available">Disponible</option>
                  <option value="rented">Loué</option>
                </select>
              </div>
            </div>

            {/* Adresse */}
            <div className="space-y-4 pt-6 border-t">
              <h2 className="text-lg font-semibold flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary" /> Adresse
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rue</label>
                <input type="text" name="address.street" value={formData.address.street} onChange={handleChange} className="input-field" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                  <input type="text" name="address.city" value={formData.address.city} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Code postal</label>
                  <input type="text" name="address.postalCode" value={formData.address.postalCode} onChange={handleChange} className="input-field" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
                <input type="text" name="address.country" value={formData.address.country} onChange={handleChange} className="input-field" />
              </div>
            </div>

            {/* Photos */}
            <div className="space-y-4 pt-6 border-t">
              <h2 className="text-lg font-semibold flex items-center">
                <Upload className="w-5 h-5 mr-2 text-primary" /> Photos de la propriété
              </h2>
              
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="input-field flex-1"
                  placeholder="https://exemple.com/image.jpg"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                />
                <button type="button" onClick={addImage} className="btn-primary px-4">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              {formData.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border">
                      <img src={img} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                          Photo principale
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500">
                  <Image className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Ajoutez des URLs d'images</p>
                </div>
              )}
            </div>

            {/* Équipements */}
            <div className="space-y-4 pt-6 border-t">
              <h2 className="text-lg font-semibold">Équipements</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {features.map(({ key, label, icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleFeatureToggle(key)}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${formData.features[key] ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <span className="text-2xl mb-2 block">{icon}</span>
                    <span className={`font-medium ${formData.features[key] ? 'text-primary' : 'text-gray-700'}`}>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6 border-t">
              <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center space-x-2">
                <Save className="w-5 h-5" />
                <span>{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProperty;
