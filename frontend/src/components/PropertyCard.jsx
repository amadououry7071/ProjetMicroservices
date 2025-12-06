import { Link } from 'react-router-dom';
import { MapPin, Maximize, DoorOpen, Heart } from 'lucide-react';
import { useState } from 'react';

const PropertyCard = ({ property }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);

  const defaultImage = `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80`;
  
  const propertyImages = [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
  ];

  const getRandomImage = () => {
    const hash = property._id?.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0) || 0;
    return propertyImages[Math.abs(hash) % propertyImages.length];
  };

  const imageUrl = property.images?.[0] || getRandomImage();

  return (
    <Link to={`/properties/${property._id}`} className="block">
      <div className="property-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={imageError ? defaultImage : imageUrl}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={() => setImageError(true)}
          />
          
          {/* Like button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsLiked(!isLiked);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${isLiked ? 'fill-primary text-primary' : 'text-gray-600'}`}
            />
          </button>

          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                property.status === 'available'
                  ? 'bg-green-500 text-white'
                  : property.status === 'rented'
                  ? 'bg-red-500 text-white'
                  : 'bg-yellow-500 text-white'
              }`}
            >
              {property.status === 'available' ? 'Disponible' : property.status === 'rented' ? 'Loué' : 'En cours'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
              {property.title}
            </h3>
          </div>

          <div className="flex items-center text-gray-500 text-sm mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="line-clamp-1">
              {property.address?.city}, {property.address?.country || 'France'}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <Maximize className="w-4 h-4 mr-1" />
              <span>{property.surface} m²</span>
            </div>
            <div className="flex items-center">
              <DoorOpen className="w-4 h-4 mr-1" />
              <span>{property.rooms} pièce{property.rooms > 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="flex items-baseline">
            <span className="text-xl font-bold text-gray-900">
              {property.price?.toLocaleString('fr-CA')} $
            </span>
            <span className="text-gray-500 text-sm ml-1">/ nuit</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
