import * as Location from 'expo-location';

export interface LocationData {
  accuracy: number | null;
  address?: string;
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface GeoTaggedScan {
  barcode: string;
  location: LocationData;
  scanId: string;
  timestamp: number;
}

export class LocationService {
  private static watchPositionSubscription: Location.LocationSubscription | null = null;

  /**
   * Request location permissions
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        console.warn('Foreground location permission not granted');
        return false;
      }

      // For background location (if needed in future)
      // const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  /**
   * Check if location services are enabled
   */
  static async isLocationEnabled(): Promise<boolean> {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      console.error('Error checking location services:', error);
      return false;
    }
  }

  /**
   * Get current location
   */
  static async getCurrentLocation(highAccuracy = true): Promise<LocationData | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('Location permission not granted');
        return null;
      }

      const isEnabled = await this.isLocationEnabled();
      if (!isEnabled) {
        console.warn('Location services not enabled');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: highAccuracy ? Location.Accuracy.High : Location.Accuracy.Balanced,
        maximumAge: 10000, // 10 seconds
        timeout: 15000, // 15 seconds
      });

      return {
        accuracy: location.coords.accuracy,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  /**
   * Get current location with address
   */
  static async getCurrentLocationWithAddress(): Promise<LocationData | null> {
    try {
      const location = await this.getCurrentLocation();
      if (!location) return null;

      const address = await this.reverseGeocode(location.latitude, location.longitude);
      
      return {
        ...location,
        address,
      };
    } catch (error) {
      console.error('Error getting location with address:', error);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  static async reverseGeocode(latitude: number, longitude: number): Promise<string | undefined> {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses.length > 0) {
        const address = addresses[0];
        const parts = [
          address.streetNumber,
          address.street,
          address.city,
          address.region,
          address.postalCode,
          address.country,
        ].filter(Boolean);

        return parts.join(', ');
      }

      return undefined;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return undefined;
    }
  }

  /**
   * Start watching location changes
   */
  static async startLocationTracking(
    callback: (location: LocationData) => void,
    accuracy: Location.Accuracy = Location.Accuracy.Balanced
  ): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return false;

      // Stop existing subscription
      if (this.watchPositionSubscription) {
        this.watchPositionSubscription.remove();
      }

      this.watchPositionSubscription = await Location.watchPositionAsync(
        {
          accuracy,
          distanceInterval: 10, // 10 meters
          timeInterval: 10000, // 10 seconds
        },
        (location) => {
          callback({
            accuracy: location.coords.accuracy,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: location.timestamp,
          });
        }
      );

      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }

  /**
   * Stop location tracking
   */
  static stopLocationTracking(): void {
    if (this.watchPositionSubscription) {
      this.watchPositionSubscription.remove();
      this.watchPositionSubscription = null;
    }
  }

  /**
   * Geo-tag a scan with current location
   */
  static async geoTagScan(scanId: string, barcode: string): Promise<GeoTaggedScan | null> {
    try {
      const location = await this.getCurrentLocationWithAddress();
      if (!location) return null;

      return {
        barcode,
        location,
        scanId,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error geo-tagging scan:', error);
      return null;
    }
  }

  /**
   * Calculate distance between two coordinates (in meters)
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Find nearby scans within a radius
   */
  static findNearbyScans(
    scans: GeoTaggedScan[],
    centerLat: number,
    centerLon: number,
    radiusMeters = 1000
  ): GeoTaggedScan[] {
    return scans.filter((scan) => {
      const distance = this.calculateDistance(
        centerLat,
        centerLon,
        scan.location.latitude,
        scan.location.longitude
      );
      return distance <= radiusMeters;
    });
  }

  /**
   * Get location-based insights
   */
  static async getLocationInsights(scans: GeoTaggedScan[]): Promise<{
    totalLocations: number;
    mostCommonLocation: string | null;
    averageAccuracy: number;
    scansByLocation: Record<string, number>;
  }> {
    try {
      if (scans.length === 0) {
        return {
          averageAccuracy: 0,
          mostCommonLocation: null,
          scansByLocation: {},
          totalLocations: 0,
        };
      }

      const locationCounts: Record<string, number> = {};
      let totalAccuracy = 0;
      let accuracyCount = 0;

      for (const scan of scans) {
        // Group by approximate location (city level)
        const address = scan.location.address;
        if (address) {
          const city = address.split(',')[0] || 'Unknown';
          locationCounts[city] = (locationCounts[city] || 0) + 1;
        }

        // Calculate average accuracy
        if (scan.location.accuracy) {
          totalAccuracy += scan.location.accuracy;
          accuracyCount++;
        }
      }

      const mostCommonLocation = Object.keys(locationCounts).reduce((a, b) =>
        locationCounts[a] > locationCounts[b] ? a : b
      );

      return {
        averageAccuracy: accuracyCount > 0 ? totalAccuracy / accuracyCount : 0,
        mostCommonLocation,
        scansByLocation: locationCounts,
        totalLocations: Object.keys(locationCounts).length,
      };
    } catch (error) {
      console.error('Error getting location insights:', error);
      return {
        averageAccuracy: 0,
        mostCommonLocation: null,
        scansByLocation: {},
        totalLocations: 0,
      };
    }
  }

  /**
   * Export scan locations as KML/GPX for mapping applications
   */
  static exportScanLocations(scans: GeoTaggedScan[], format: 'kml' | 'gpx' = 'kml'): string {
    if (format === 'kml') {
      return this.generateKML(scans);
    } else {
      return this.generateGPX(scans);
    }
  }

  private static generateKML(scans: GeoTaggedScan[]): string {
    const placemarks = scans
      .map(
        (scan) => `
    <Placemark>
      <name>Scan: ${scan.barcode}</name>
      <description>
        <![CDATA[
          Barcode: ${scan.barcode}<br/>
          Time: ${new Date(scan.timestamp).toLocaleString()}<br/>
          ${scan.location.address ? `Address: ${scan.location.address}` : ''}
        ]]>
      </description>
      <Point>
        <coordinates>${scan.location.longitude},${scan.location.latitude},0</coordinates>
      </Point>
    </Placemark>`
      )
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Hedwig Scan Locations</name>
    <description>Barcode scan locations from Hedwig app</description>
    ${placemarks}
  </Document>
</kml>`;
  }

  private static generateGPX(scans: GeoTaggedScan[]): string {
    const waypoints = scans
      .map(
        (scan) => `
    <wpt lat="${scan.location.latitude}" lon="${scan.location.longitude}">
      <name>Scan: ${scan.barcode}</name>
      <desc>${scan.location.address || 'Barcode scan location'}</desc>
      <time>${new Date(scan.timestamp).toISOString()}</time>
    </wpt>`
      )
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Hedwig Barcode Scanner">
  <metadata>
    <name>Hedwig Scan Locations</name>
    <desc>Barcode scan locations from Hedwig app</desc>
    <time>${new Date().toISOString()}</time>
  </metadata>
  ${waypoints}
</gpx>`;
  }
}