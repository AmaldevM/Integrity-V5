import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getMonthlyExpenseSheets, getUser } from '../../src/services/mockDatabase';
import { MonthlyExpenseSheet, ExpenseEntry } from '../../src/types';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react-native';

export default function ExpenseDetailScreen() {
    const { id } = useLocalSearchParams();
    const [sheet, setSheet] = useState<MonthlyExpenseSheet | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchSheet = async () => {
        try {
            const user = await getUser('mohdshea@gmail.com', 'password');
            if (user) {
                const sheets = await getMonthlyExpenseSheets(user.uid);
                const found = sheets.find(s => s.id === id);
                setSheet(found || null);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSheet();
    }, [id]);

    const renderEntry = ({ item }: { item: ExpenseEntry }) => (
        <View className="bg-white p-4 mb-2 rounded-lg border border-slate-100 flex-row justify-between items-center">
            <View>
                <Text className="font-bold text-slate-800">{item.category}</Text>
                <Text className="text-slate-500 text-xs">{new Date(item.date).toLocaleDateString()}</Text>
                {item.description ? <Text className="text-slate-400 text-xs mt-1">{item.description}</Text> : null}
            </View>
            <Text className="font-bold text-blue-600">₹{item.amount}</Text>
        </View>
    );

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    if (!sheet) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text>Sheet not found</Text>
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
                            {new Date(sheet.year, sheet.month).toLocaleString('default', { month: 'long' })}
                        </Text>
                        <Text className="text-xs text-slate-500">{sheet.status}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    className="bg-blue-100 p-2 rounded-full"
                    onPress={() => Alert.alert('Info', 'Submit functionality coming soon')}
                >
                    <Text className="text-blue-600 font-bold text-xs px-2">Submit</Text>
                </TouchableOpacity>
            </View>

            <View className="p-4">
                <View className="bg-blue-600 p-6 rounded-2xl mb-6 shadow-md">
                    <Text className="text-blue-100 mb-1">Total Expenses</Text>
                    <Text className="text-4xl font-bold text-white">
                        ₹{sheet.entries.reduce((sum, e) => sum + e.amount, 0)}
                    </Text>
                </View>

                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-bold text-slate-800">Entries</Text>
                    <TouchableOpacity
                        className="flex-row items-center bg-white border border-slate-200 px-3 py-1.5 rounded-lg"
                        onPress={() => router.push({ pathname: '/expenses/add-entry', params: { sheetId: sheet.id } })}
                    >
                        <Plus size={16} color="#2563eb" />
                        <Text className="text-blue-600 font-medium ml-1">Add Entry</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={sheet.entries}
                    renderItem={renderEntry}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListEmptyComponent={
                        <Text className="text-center text-slate-400 mt-10">No entries yet</Text>
                    }
                />
            </View>
        </View>
    );
}
