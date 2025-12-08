import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Stethoscope, Pill, Store, Plus } from 'lucide-react-native';

export default function ReportingScreen() {
    const router = useRouter();

    const actions = [
        {
            title: 'Doctor Visit',
            icon: <Stethoscope size={32} color="#2563eb" />,
            color: 'bg-blue-100',
            type: 'DOCTOR'
        },
        {
            title: 'Chemist Visit',
            icon: <Pill size={32} color="#9333ea" />,
            color: 'bg-purple-100',
            type: 'CHEMIST'
        },
        {
            title: 'Stockist Visit',
            icon: <Store size={32} color="#ea580c" />,
            color: 'bg-orange-100',
            type: 'STOCKIST'
        },
    ];

    return (
        <View className="flex-1 bg-slate-50">
            <View className="bg-white pt-12 pb-4 px-6 shadow-sm">
                <Text className="text-2xl font-bold text-slate-800">Field Reporting</Text>
            </View>

            <ScrollView className="p-6">
                <Text className="text-slate-600 mb-4 font-medium">Select Visit Type</Text>

                <View className="flex-row flex-wrap gap-4">
                    {actions.map((action) => (
                        <TouchableOpacity
                            key={action.title}
                            className="bg-white p-6 rounded-2xl shadow-sm w-[47%] items-center justify-center aspect-square"
                            onPress={() => router.push({ pathname: '/reporting/new-visit', params: { type: action.type } })}
                        >
                            <View className={`${action.color} p-4 rounded-full mb-3`}>
                                {action.icon}
                            </View>
                            <Text className="font-bold text-slate-700 text-center">{action.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View className="mt-8">
                    <Text className="text-lg font-bold text-slate-800 mb-4">Recent Visits</Text>
                    <View className="bg-white p-8 rounded-xl items-center justify-center border border-dashed border-slate-300">
                        <Text className="text-slate-400">No recent visits found</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
