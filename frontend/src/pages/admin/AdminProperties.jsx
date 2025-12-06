import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Search, Trash2, MapPin, Eye } from 'lucide-react';
import api from '../../api/axios';

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await api.get('/admin/properties');
      setProperties(response.data.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (propertyId, title) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${title}" ?`)) return;
    
    setActionLoading(propertyId);
    try {
      await api.delete(`/admin/properties/${propertyId}`, { data: { reason: 'Supprimé par admin' } });
      fetchProperties();
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredProperties = properties.filter(property => 
    property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address?.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Propriétés</h1>
            <p className="text-gray-600 mt-1">{properties.length} propriétés au total</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par titre ou ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div key={property._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="h-48 bg-gray-200 relative">
                <img
                  src={property.images?.[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                  property.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {property.status === 'available' ? 'Disponible' : 'Indisponible'}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 line-clamp-1">{property.title}</h3>
                <div className="flex items-center text-gray-500 text-sm mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{property.address?.city}, {property.address?.country}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-primary font-bold">{property.price?.toLocaleString('fr-CA')} $/nuit</span>
                  <span className="text-sm text-gray-500">{property.surface} m² • {property.rooms} pièces</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <Link 
                    to={`/properties/${property._id}`}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Eye className="w-4 h-4 mr-1" /> Voir
                  </Link>
                  <button
                    onClick={() => handleDelete(property._id, property.title)}
                    disabled={actionLoading === property._id}
                    className="flex items-center text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl">
            Aucune propriété trouvée
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProperties;
