const fetch = require('node-fetch');

class MapboxService {
  constructor() {
    this.accessToken = process.env.MAPBOX_ACCESS_TOKEN;
    this.baseUrl = 'https://api.mapbox.com';
  }

  // Get geocode from address
  async geocode(address) {
    try {
      const response = await fetch(
        `${this.baseUrl}/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();
      return data.features.map(feature => ({
        place_name: feature.place_name,
        center: feature.center,
        geometry: feature.geometry,
      }));
    } catch (error) {
      console.error('Geocode error:', error);
      throw error;
    }
  }

  // Reverse geocode (get address from lat/lng)
  async reverseGeocode(lat, lng) {
    try {
      const response = await fetch(
        `${this.baseUrl}/geocoding/v5/mapbox.places/${lng},${lat}.json`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();

      if (data.features.length === 0) {
        return null;
      }

      return {
        place_name: data.features[0].place_name,
        center: data.features[0].center,
        context: data.features[0].context,
      };
    } catch (error) {
      console.error('Reverse geocode error:', error);
      throw error;
    }
  }

  // Get distance between two points
  getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Calculate bounding box for radius search
  getBoundingBox(lat, lng, radiusKm) {
    const latOffset = radiusKm / 111;
    const lngOffset = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

    return {
      minLat: lat - latOffset,
      maxLat: lat + latOffset,
      minLng: lng - lngOffset,
      maxLng: lng + lngOffset,
      latOffset,
      lngOffset,
    };
  }

  // Get isochrone (drive time area)
  async getIsochrone(lat, lng, profile = 'driving', minutes = 10) {
    try {
      const response = await fetch(
        `${this.baseUrl}/isochrone/v1/mapbox/${profile}/${lng},${lat}?contours_minutes=${minutes}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Isochrone request failed');
      }

      const data = await response.json();
      return data.features?.[0]?.geometry || null;
    } catch (error) {
      console.error('Isochrone error:', error);
      throw error;
    }
  }

  // Get directions between two points
  async getDirections(fromLat, fromLng, toLat, toLng, profile = 'driving') {
    try {
      const response = await fetch(
        `${this.baseUrl}/directions/v5/mapbox/${profile}/${fromLng},${fromLat};${toLng},${toLat}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Directions request failed');
      }

      const data = await response.json();
      return {
        distance: data.routes[0]?.distance,
        duration: data.routes[0]?.duration,
        geometry: data.routes[0]?.geometry,
      };
    } catch (error) {
      console.error('Directions error:', error);
      throw error;
    }
  }

  // Get nearby places (POI)
  async getNearbyPlaces(lat, lng, query = '', radius = 1000, limit = 10) {
    try {
      const response = await fetch(
        `${this.baseUrl}/geocoding/v5/mapbox.places/${query}.json`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Nearby places request failed');
      }

      const data = await response.json();

      // Filter by distance
      const nearbyPlaces = data.features.filter(feature => {
        const distance = this.getDistance(
          lat,
          lng,
          feature.center[1],
          feature.center[0]
        );
        return distance <= radius;
      }).slice(0, limit);

      return nearbyPlaces.map(feature => ({
        place_name: feature.place_name,
        center: feature.center,
        distance: this.getDistance(lat, lng, feature.center[1], feature.center[0]),
      }));
    } catch (error) {
      console.error('Nearby places error:', error);
      throw error;
    }
  }
}

module.exports = new MapboxService();