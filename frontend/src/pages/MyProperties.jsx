import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Maximize, DoorOpen, Edit, Trash2, Eye } from 'lucide-react';
import api from '../api/axios';

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      // Utilise /properties/my pour récupérer SEULEMENT les propriétés du propriétaire connecté
      const response = await api.get('/properties/my');
      setProperties(response.data.data || []);
    } catch (err) {
      setError('Impossible de charger vos propriétés');
    } finally {
      setLoading(false);
    }
  };

  const deleteProperty = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette propriété ?')) return;
    
    try {
      await api.delete(`/properties/${id}`);
      setProperties(properties.filter(p => p._id !== id));
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const defaultImages = [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes propriétés</h1>
            <p className="text-gray-600">Gérez vos biens immobiliers</p>
          </div>
          <Link to="/create-property" className="btn-primary flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Ajouter un bien</span>
          </Link>
        </div>

        {error ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-xl font-semibold mb-2">{error}</h3>
            <button onClick={fetchProperties} className="btn-primary mt-4">Réessayer</button>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune propriété</h3>
            <p className="text-gray-500 mb-6">Commencez par ajouter votre premier bien</p>
            <Link to="/create-property" className="btn-primary inline-flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Ajouter un bien</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property, index) => (
              <div key={property._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-[4/3]">
                  <img
                    src={property.images?.[0] || defaultImages[index % defaultImages.length]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      property.status === 'available' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {property.status === 'available' ? 'Disponible' : 'Loué'}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">{property.title}</h3>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="line-clamp-1">{property.address?.city}</span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Maximize className="w-4 h-4 mr-1" />
                      <span>{property.surface} m²</span>
                    </div>
                    <div className="flex items-center">
                      <DoorOpen className="w-4 h-4 mr-1" />
                      <span>{property.rooms} pièces</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-xl font-bold text-gray-900">{property.price?.toLocaleString('fr-CA')} $<span className="text-sm font-normal text-gray-500">/nuit</span></span>
                    
                    <div className="flex items-center space-x-2">
                      <Link to={`/properties/${property._id}`} className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="w-5 h-5" />
                      </Link>
                      <Link to={`/edit-property/${property._id}`} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button onClick={() => deleteProperty(property._id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProperties;
