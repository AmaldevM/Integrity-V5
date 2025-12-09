import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export interface GeoLocation {
    lat: number;
    lng: number;
    accuracy: number;
}

export const getCurrentLocation = async (): Promise<GeoLocation> => {
    try {
        // 1. Android/iOS: Explicitly Ask for Permission
        // This is what triggers the "Allow while using app?" popup
        if (Capacitor.isNativePlatform()) {
            const permission = await Geolocation.checkPermissions();

            if (permission.location !== 'granted') {
                const request = await Geolocation.requestPermissions();
                if (request.location !== 'granted') {
                    throw new Error('Location permission denied. Please enable it in Android Settings.');
                }
            }
        }

        // 2. Try High Accuracy First (Optimized for Mobile)
        try {
            const coordinates = await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000, // Wait 10s (Phones need time to find satellites)
                maximumAge: 0   // Do not use old cached data
            });
            return {
                lat: coordinates.coords.latitude,
                lng: coordinates.coords.longitude,
                accuracy: coordinates.coords.accuracy
            };
        } catch (err) {
            console.warn("High accuracy GPS timed out. Switching to network location...");
        }

        // 3. FALLBACK: Low Accuracy (Cell Towers / Wi-Fi)
        // Works if user is indoors or GPS is weak
        const fallbackCoords = await Geolocation.getCurrentPosition({
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 30000 // Accept positions up to 30s old
        });

        return {
            lat: fallbackCoords.coords.latitude,
            lng: fallbackCoords.coords.longitude,
            accuracy: fallbackCoords.coords.accuracy
        };

    } catch (error: any) {
        console.error("GPS Error:", error);

        // Handle Browser Denial
        if (error.message && error.message.includes('User denied')) {
            throw new Error('Location access denied. Please reset permissions in your browser.');
        }

        // Handle Mobile/General Errors
        throw new Error('Could not fetch location. Ensure GPS is turned on.');
    }
};