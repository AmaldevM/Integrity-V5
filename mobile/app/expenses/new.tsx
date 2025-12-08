import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getUser, createMonthlyExpenseSheet } from '../../src/services/mockDatabase';
import { ChevronLeft } from 'lucide-react-native';

export default function NewExpenseSheetScreen() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Default to current month
    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const handleCreate = async () => {
        setLoading(true);
        try {
            const user = await getUser('mohdshea@gmail.com', 'password');
            if (user) {
                await createMonthlyExpenseSheet(user.uid, selectedMonth, selectedYear);
                Alert.alert('Success', 'Expense sheet created!');
                router.back();
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to create sheet (it might already exist)');
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
                <Text className="text-xl font-bold text-slate-800">New Expense Sheet</Text>
            </View>

            <View className="p-6">
                <Text className="text-slate-600 mb-4">Select Month and Year for the new sheet.</Text>

                <View className="bg-white rounded-xl p-4 mb-6">
                    <Text className="text-slate-500 mb-2 font-medium">Month</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {months.map((m, index) => (
                            <TouchableOpacity
                                key={m}
                                onPress={() => setSelectedMonth(index)}
                                className={`px-3 py-2 rounded-lg border ${selectedMonth === index
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'bg-slate-50 border-slate-200'
                                    }`}
                            >
                                <Text className={selectedMonth === index ? 'text-white' : 'text-slate-600'}>
                                    {m.slice(0, 3)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View className="bg-white rounded-xl p-4 mb-8">
                    <Text className="text-slate-500 mb-2 font-medium">Year</Text>
                    <View className="flex-row gap-4">
                        {[selectedYear - 1, selectedYear, selectedYear + 1].map(y => (
                            <TouchableOpacity
                                key={y}
                                onPress={() => setSelectedYear(y)}
                                className={`px-4 py-2 rounded-lg border ${selectedYear === y
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'bg-slate-50 border-slate-200'
                                    }`}
                            >
                                <Text className={selectedYear === y ? 'text-white' : 'text-slate-600'}>
                                    {y}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    className="bg-blue-600 py-4 rounded-xl items-center"
                    onPress={handleCreate}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Create Sheet</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
