import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { saveExpenseEntry, getUser } from '../../src/services/mockDatabase';
import { ExpenseCategory } from '../../src/types';
import { ChevronLeft, Calendar } from 'lucide-react-native';

export default function AddEntryScreen() {
    const { sheetId } = useLocalSearchParams<{ sheetId: string }>();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [date, setDate] = useState(new Date());
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.TRAVEL);
    const [description, setDescription] = useState('');

    const categories = Object.values(ExpenseCategory);

    const handleSave = async () => {
        if (!amount || isNaN(Number(amount))) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        setLoading(true);
        try {
            const user = await getUser('mohdshea@gmail.com', 'password');
            if (user) {
                const entry = {
                    id: Date.now().toString(),
                    date: date.toISOString(),
                    category,
                    amount: Number(amount),
                    description,
                    receiptUrl: undefined
                };

                await saveExpenseEntry(user.uid, sheetId, entry);
                Alert.alert('Success', 'Expense added');
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
                <Text className="text-xl font-bold text-slate-800">Add Expense</Text>
            </View>

            <ScrollView className="p-6">
                {/* Amount Input */}
                <View className="bg-white p-6 rounded-2xl mb-6 shadow-sm items-center">
                    <Text className="text-slate-500 mb-2 font-medium">Amount (₹)</Text>
                    <TextInput
                        className="text-4xl font-bold text-slate-800 text-center w-full"
                        placeholder="0"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                        autoFocus
                    />
                </View>

                {/* Category Selection */}
                <View className="mb-6">
                    <Text className="text-slate-700 mb-2 font-bold text-lg">Category</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => setCategory(cat)}
                                className={`px-4 py-2 rounded-full border ${category === cat
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'bg-white border-slate-200'
                                    }`}
                            >
                                <Text className={category === cat ? 'text-white font-medium' : 'text-slate-600'}>
                                    {cat.replace(/_/g, ' ')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Date Selection (Simplified) */}
                <View className="mb-6">
                    <Text className="text-slate-700 mb-2 font-bold text-lg">Date</Text>
                    <View className="bg-white p-4 rounded-xl border border-slate-200 flex-row items-center">
                        <Calendar size={20} color="#64748b" />
                        <Text className="ml-3 text-slate-800 font-medium">
                            {date.toLocaleDateString()}
                        </Text>
                        {/* In a real app, open a DatePicker here */}
                    </View>
                </View>

                {/* Description */}
                <View className="mb-8">
                    <Text className="text-slate-700 mb-2 font-bold text-lg">Description</Text>
                    <TextInput
                        className="bg-white p-4 rounded-xl border border-slate-200 text-slate-800 h-24"
                        placeholder="Add notes (optional)"
                        multiline
                        textAlignVertical="top"
                        value={description}
                        onChangeText={setDescription}
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
                        <Text className="text-white font-bold text-lg">Save Expense</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
