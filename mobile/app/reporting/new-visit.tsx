import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getUser, saveVisit } from '../../src/services/mockDatabase';
import { ChevronLeft, MapPin } from 'lucide-react-native';
import * as Location from 'expo-location';

export default function NewVisitScreen() {
    const { type } = useLocalSearchParams<{ type: string }>();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [customerName, setCustomerName] = useState('');
    const [notes, setNotes] = useState('');
    const [location, setLocation] = useState<Location.LocationObject | null>(null);

    const handleSave = async () => {
        if (!customerName) {
            Alert.alert('Error', 'Please enter customer name');
            return;
        }

        setLoading(true);
        try {
            // Get location
            let { status } = await Location.requestForegroundPermissionsAsync();
            let loc = null;
            if (status === 'granted') {
                loc = await Location.getCurrentPositionAsync({});
                setLocation(loc);
            }

            const user = await getUser('mohdshea@gmail.com', 'password');
            if (user) {
                const visit = {
                    id: Date.now().toString(),
                    userId: user.uid,
                    date: new Date().toISOString(),
                    customerType: type as any,
                    customerName,
                    notes,
                    latitude: loc?.coords.latitude,
                    longitude: loc?.coords.longitude
                };

                await saveVisit(visit);
                Alert.alert('Success', 'Visit recorded successfully');
                router.back();
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to save visit');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-slate-50">
            <View className="bg-white pt-12 pb-4 px-4 shadow-sm flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ChevronLeft size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-800">New {type?.toLowerCase().replace(/^\w/, c => c.toUpperCase())} Visit</Text>
            </View>

            <ScrollView className="p-6">
                <View className="mb-6">
                    <Text className="text-slate-700 mb-2 font-bold text-lg">Customer Name</Text>
                    <TextInput
                        className="bg-white p-4 rounded-xl border border-slate-200 text-slate-800"
                        placeholder={`Enter ${type?.toLowerCase()} name`}
                        value={customerName}
                        onChangeText={setCustomerName}
                    />
                </View>

                <View className="mb-6">
                    <Text className="text-slate-700 mb-2 font-bold text-lg">Location</Text>
                    <View className="bg-blue-50 p-4 rounded-xl flex-row items-center border border-blue-100">
                        <MapPin size={20} color="#2563eb" />
                        <Text className="ml-2 text-blue-700 font-medium">
                            {location ? 'Location Captured' : 'Will be captured on save'}
                        </Text>
                    </View>
                </View>

                <View className="mb-8">
                    <Text className="text-slate-700 mb-2 font-bold text-lg">Notes / Discussion</Text>
                    <TextInput
                        className="bg-white p-4 rounded-xl border border-slate-200 text-slate-800 h-32"
                        placeholder="Enter discussion points, orders, etc."
                        multiline
                        textAlignVertical="top"
                        value={notes}
                        onChangeText={setNotes}
                    />
                </View>

                <TouchableOpacity
                    className="bg-blue-600 py-4 rounded-xl items-center mb-10"
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Complete Visit</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
