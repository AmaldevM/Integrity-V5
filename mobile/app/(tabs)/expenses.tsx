import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { getUser, getMonthlyExpenseSheets } from '../../src/services/mockDatabase';
import { MonthlyExpenseSheet, ExpenseStatus } from '../../src/types';
import { Plus, ChevronRight } from 'lucide-react-native';

export default function ExpensesScreen() {
    const [sheets, setSheets] = useState<MonthlyExpenseSheet[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const fetchSheets = async () => {
        try {
            // In a real app, we'd get the current user from context/auth
            // For now, we'll fetch a mock user to get the ID
            const user = await getUser('mohdshea@gmail.com', 'password'); // Hardcoded for dev
            if (user) {
                const data = await getMonthlyExpenseSheets(user.uid);
                setSheets(data);
            }
        } catch (error) {
            console.error('Failed to fetch sheets', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSheets();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchSheets();
    };

    const getStatusColor = (status: ExpenseStatus) => {
        switch (status) {
            case ExpenseStatus.DRAFT: return 'bg-gray-100 text-gray-600';
            case ExpenseStatus.SUBMITTED: return 'bg-blue-100 text-blue-600';
            case ExpenseStatus.APPROVED_BY_ASM: return 'bg-purple-100 text-purple-600';
            case ExpenseStatus.APPROVED_BY_ADMIN: return 'bg-green-100 text-green-600';
            case ExpenseStatus.REJECTED: return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const renderItem = ({ item }: { item: MonthlyExpenseSheet }) => (
        <TouchableOpacity
            className="bg-white p-4 mb-3 rounded-xl shadow-sm flex-row items-center justify-between"
            onPress={() => router.push(`/expenses/${item.id}`)}
        >
            <View>
                <Text className="text-lg font-bold text-slate-800">
                    {new Date(item.year, item.month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </Text>
                <View className={`self-start px-2 py-1 rounded-md mt-2 ${getStatusColor(item.status).split(' ')[0]}`}>
                    <Text className={`text-xs font-medium ${getStatusColor(item.status).split(' ')[1]}`}>
                        {item.status.replace(/_/g, ' ')}
                    </Text>
                </View>
            </View>
            <View className="flex-row items-center">
                <Text className="text-slate-500 mr-2 font-medium">
                    ₹{item.entries.reduce((sum, e) => sum + e.amount, 0)}
                </Text>
                <ChevronRight size={20} color="#94a3b8" />
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-slate-50">
            <View className="bg-white pt-12 pb-4 px-6 shadow-sm flex-row justify-between items-center">
                <Text className="text-2xl font-bold text-slate-800">Expenses</Text>
                <TouchableOpacity
                    className="bg-blue-600 p-2 rounded-full"
                    onPress={() => router.push('/expenses/new')}
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
                    data={sheets}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 20 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View className="items-center mt-20">
                            <Text className="text-slate-400">No expense sheets found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
