import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { saveTourPlanEntry, getUser } from '../../src/services/mockDatabase';
import { ChevronLeft, Calendar } from 'lucide-react-native';

export default function AddTourEntryScreen() {
    const { planId } = useLocalSearchParams<{ planId: string }>();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [date, setDate] = useState(new Date());
    const [routeId, setRouteId] = useState('');
    const [notes, setNotes] = useState('');

    // Mock routes for now
    const routes = ['Route A (City Center)', 'Route B (North)', 'Route C (South)', 'Route D (West)'];

    const handleSave = async () => {
        if (!routeId) {
            Alert.alert('Error', 'Please select a route');
            return;
        }

        setLoading(true);
        try {
            const user = await getUser('mohdshea@gmail.com', 'password');
            if (user) {
                const entry = {
                    date: date.toISOString(),
                    routeId,
                    notes
                };

                await saveTourPlanEntry(user.uid, planId, entry);
                Alert.alert('Success', 'Tour entry added');
                router.back();
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to save entry');
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
                <Text className="text-xl font-bold text-slate-800">Add Tour Entry</Text>
            </View>

            <ScrollView className="p-6">
                {/* Date Selection */}
                <View className="mb-6">
                    <Text className="text-slate-700 mb-2 font-bold text-lg">Date</Text>
                    <View className="bg-white p-4 rounded-xl border border-slate-200 flex-row items-center">
                        <Calendar size={20} color="#64748b" />
                        <Text className="ml-3 text-slate-800 font-medium">
                            {date.toLocaleDateString()}
                        </Text>
                    </View>
                </View>

                {/* Route Selection */}
                <View className="mb-6">
                    <Text className="text-slate-700 mb-2 font-bold text-lg">Select Route</Text>
                    <View className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        {routes.map((r, index) => (
                            <TouchableOpacity
                                key={r}
                                onPress={() => setRouteId(r)}
                                className={`p-4 border-b border-slate-100 ${routeId === r ? 'bg-blue-50' : ''}`}
                            >
                                <Text className={routeId === r ? 'text-blue-700 font-bold' : 'text-slate-700'}>
                                    {r}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Notes */}
                <View className="mb-8">
                    <Text className="text-slate-700 mb-2 font-bold text-lg">Notes</Text>
                    <TextInput
                        className="bg-white p-4 rounded-xl border border-slate-200 text-slate-800 h-24"
                        placeholder="Add notes (optional)"
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
                        <Text className="text-white font-bold text-lg">Save Entry</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
