import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Home, MapPin, Image, Check, Plus, X, Upload } from 'lucide-react';
import api from '../api/axios';

const CreateProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    surface: '',
    rooms: '',
    price: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = {
        ...formData,
        surface: Number(formData.surface),
        rooms: Number(formData.rooms),
        price: Number(formData.price),
      };
      await api.post('/properties', data);
      navigate('/my-properties');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ChevronLeft className="w-5 h-5 mr-1" /> Retour
        </button>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ajouter une propriété</h1>
          <p className="text-gray-600 mb-8">Remplissez les informations de votre bien</p>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= s ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 3 && <div className={`w-24 h-1 mx-2 ${step > s ? 'bg-primary' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-lg font-semibold flex items-center"><Home className="w-5 h-5 mr-2 text-primary" /> Informations générales</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Titre de l'annonce *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} className="input-field" placeholder="Bel appartement au cœur de Montréal" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} className="input-field h-32 resize-none" placeholder="Décrivez votre bien..." required />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Surface (m²) *</label>
                    <input type="number" name="surface" value={formData.surface} onChange={handleChange} className="input-field" placeholder="50" required min="1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pièces *</label>
                    <input type="number" name="rooms" value={formData.rooms} onChange={handleChange} className="input-field" placeholder="3" required min="1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prix/nuit (CAD) *</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} className="input-field" placeholder="100" required min="1" />
                  </div>
                </div>

                <button type="button" onClick={() => setStep(2)} className="btn-primary w-full">Continuer</button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-lg font-semibold flex items-center"><MapPin className="w-5 h-5 mr-2 text-primary" /> Adresse</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rue *</label>
                  <input type="text" name="address.street" value={formData.address.street} onChange={handleChange} className="input-field" placeholder="123 Rue Sainte-Catherine" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ville *</label>
                    <input type="text" name="address.city" value={formData.address.city} onChange={handleChange} className="input-field" placeholder="Montréal" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Code postal *</label>
                    <input type="text" name="address.postalCode" value={formData.address.postalCode} onChange={handleChange} className="input-field" placeholder="H2X 1Y6" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
                  <input type="text" name="address.country" value={formData.address.country} onChange={handleChange} className="input-field" />
                </div>

                <div className="flex space-x-4">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">Retour</button>
                  <button type="button" onClick={() => setStep(3)} className="btn-primary flex-1">Continuer</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                {/* Section Images */}
                <div>
                  <h2 className="text-lg font-semibold flex items-center mb-4">
                    <Upload className="w-5 h-5 mr-2 text-primary" /> Photos de la propriété
                  </h2>
                  
                  <div className="space-y-4">
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
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500">
                        <Image className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>Ajoutez des URLs d'images pour votre propriété</p>
                        <p className="text-sm mt-1">La première image sera la photo principale</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section Équipements */}
                <div className="pt-6 border-t">
                  <h2 className="text-lg font-semibold flex items-center mb-4">Équipements</h2>
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

                <div className="flex space-x-4 pt-4">
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">Retour</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? 'Création...' : 'Créer le bien'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProperty;
