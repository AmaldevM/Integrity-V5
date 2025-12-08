import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getMonthlyTourPlans, getUser } from '../../src/services/mockDatabase';
import { MonthlyTourPlan, TourPlanEntry } from '../../src/types';
import { ChevronLeft } from 'lucide-react-native';

export default function TourPlanDetailScreen() {
    const { id } = useLocalSearchParams();
    const [plan, setPlan] = useState<MonthlyTourPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchPlan = async () => {
        try {
            const user = await getUser('mohdshea@gmail.com', 'password');
            if (user) {
                const plans = await getMonthlyTourPlans(user.uid);
                const found = plans.find(p => p.id === id);
                setPlan(found || null);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlan();
    }, [id]);

    const renderEntry = ({ item }: { item: TourPlanEntry }) => (
        <View className="bg-white p-4 mb-2 rounded-lg border border-slate-100">
            <Text className="font-bold text-slate-800">{new Date(item.date).toLocaleDateString()}</Text>
            <Text className="text-slate-600 mt-1">Route: {item.routeId}</Text>
            {item.notes ? <Text className="text-slate-400 text-xs mt-1">{item.notes}</Text> : null}
        </View>
    );

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#ea580c" />
            </View>
        );
    }

    if (!plan) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text>Plan not found</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">
            <View className="bg-white pt-12 pb-4 px-4 shadow-sm flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ChevronLeft size={24} color="#1e293b" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-xl font-bold text-slate-800">
                            {new Date(plan.year, plan.month).toLocaleString('default', { month: 'long' })}
                        </Text>
                        <Text className="text-xs text-slate-500">{plan.status}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    className="bg-orange-100 p-2 rounded-full"
                    onPress={() => Alert.alert('Info', 'Submit functionality coming soon')}
                >
                    <Text className="text-orange-600 font-bold text-xs px-2">Submit</Text>
                </TouchableOpacity>
            </View>

            <View className="p-4">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-bold text-slate-800">Entries</Text>
                    <TouchableOpacity
                        className="flex-row items-center bg-white border border-slate-200 px-3 py-1.5 rounded-lg"
                        onPress={() => router.push({ pathname: '/tour-plan/add-entry', params: { planId: plan.id } })}
                    >
                        <Text className="text-orange-600 font-medium ml-1">+ Add Day</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={plan.entries}
                    renderItem={renderEntry}
                    keyExtractor={item => item.date}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListEmptyComponent={
                        <Text className="text-center text-slate-400 mt-10">No entries yet</Text>
                    }
                />
            </View>
        </View>
    );
}
