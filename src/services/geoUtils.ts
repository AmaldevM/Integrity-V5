import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export interface GeoLocation {
    lat: number;
    lng: number;
    accuracy: number;
}

export const getCurrentLocation = async (): Promise<GeoLocation> => {
    try {
        // --- MOBILE PERMISSION LOGIC ---
        // This part triggers the "Allow while using app?" popup on Android
        if (Capacitor.isNativePlatform()) {
            const status = await Geolocation.checkPermissions();

            // If not granted, we MUST ask for it
            if (status.location !== 'granted') {
                const request = await Geolocation.requestPermissions();
                if (request.location !== 'granted') {
                    throw new Error('Location permission was denied. Please enable it in Android Settings.');
                }
            }
        }

        // --- ATTEMPT 1: High Accuracy (GPS Satellites) ---
        // Best for field work. We give it 10 seconds to lock on.
        try {
            const coordinates = await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000, // 10 seconds (Phones need time outdoors)
                maximumAge: 0   // Force fresh data
            });
            return {
                lat: coordinates.coords.latitude,
                lng: coordinates.coords.longitude,
                accuracy: coordinates.coords.accuracy
            };
        } catch (err) {
            console.warn("GPS Satellites timed out. Switching to network location...");
        }

        // --- ATTEMPT 2: Low Accuracy (Cell Towers / Wi-Fi) ---
        // Fallback if inside a building or GPS is blocked
        const fallback = await Geolocation.getCurrentPosition({
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 30000 // Accept position from 30s ago
        });

        return {
            lat: fallback.coords.latitude,
            lng: fallback.coords.longitude,
            accuracy: fallback.coords.accuracy
        };

    } catch (error: any) {
        console.error("GPS Error:", error);
        if (error.message && error.message.includes('User denied')) {
            throw new Error('Location denied. Please enable GPS.');
        }
        throw new Error('Could not fetch location. Ensure GPS is on.');
    }
};