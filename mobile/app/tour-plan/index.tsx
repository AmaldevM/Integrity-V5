import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { getUser, getMonthlyTourPlans } from '../../src/services/mockDatabase';
import { MonthlyTourPlan, TourPlanStatus } from '../../src/types';
import { Plus, ChevronRight, ChevronLeft } from 'lucide-react-native';

export default function TourPlanListScreen() {
    const [plans, setPlans] = useState<MonthlyTourPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const fetchPlans = async () => {
        try {
            const user = await getUser('mohdshea@gmail.com', 'password');
            if (user) {
                const data = await getMonthlyTourPlans(user.uid);
                setPlans(data);
            }
        } catch (error) {
            console.error('Failed to fetch plans', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPlans();
    };

    const getStatusColor = (status: TourPlanStatus) => {
        switch (status) {
            case TourPlanStatus.DRAFT: return 'bg-gray-100 text-gray-600';
            case TourPlanStatus.SUBMITTED: return 'bg-blue-100 text-blue-600';
            case TourPlanStatus.APPROVED: return 'bg-green-100 text-green-600';
            case TourPlanStatus.REJECTED: return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const renderItem = ({ item }: { item: MonthlyTourPlan }) => (
        <TouchableOpacity
            className="bg-white p-4 mb-3 rounded-xl shadow-sm flex-row items-center justify-between"
            onPress={() => router.push(`/tour-plan/${item.id}`)}
        >
            <View>
                <Text className="text-lg font-bold text-slate-800">
                    {new Date(item.year, item.month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </Text>
                <View className={`self-start px-2 py-1 rounded-md mt-2 ${getStatusColor(item.status).split(' ')[0]}`}>
                    <Text className={`text-xs font-medium ${getStatusColor(item.status).split(' ')[1]}`}>
                        {item.status}
                    </Text>
                </View>
            </View>
            <ChevronRight size={20} color="#94a3b8" />
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-slate-50">
            <View className="bg-white pt-12 pb-4 px-4 shadow-sm flex-row justify-between items-center">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ChevronLeft size={24} color="#1e293b" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-slate-800">Tour Plans</Text>
                </View>
                <TouchableOpacity
                    className="bg-blue-600 p-2 rounded-full"
                    onPress={() => router.push('/tour-plan/new')}
                >
                    <Plus size={24} color="white" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            ) : (
                <FlatList
                    data={plans}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 20 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View className="items-center mt-20">
                            <Text className="text-slate-400">No tour plans found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
