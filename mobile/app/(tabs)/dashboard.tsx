import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth } from 'firebase/auth';
import { getUser } from '../../src/services/mockDatabase';
import { UserProfile } from '../../src/types';
import { useRouter } from 'expo-router';
import { Map, FileText } from 'lucide-react-native';

export default function Dashboard() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const auth = getAuth();
            const currentUser = auth.currentUser;
            if (currentUser) {
                const u = await getUser(currentUser.email || '');
                setUser(u);
            } else {
                // Fallback for dev/mock
                const u = await getUser();
                setUser(u);
            }
        };
        fetchUser();
    }, []);

    if (!user) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
                <Text>Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <ScrollView className="p-4">
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-2xl font-bold text-slate-800">Hello, {user.displayName.split(' ')[0]}</Text>
                        <Text className="text-slate-500">{user.role} - {user.hqLocation}</Text>
                    </View>
                    <View className="bg-blue-100 p-2 rounded-full">
                        <Text className="text-blue-600 font-bold">{user.displayName[0]}</Text>
                    </View>
                </View>

                <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
                    <Text className="text-lg font-semibold mb-2">Quick Actions</Text>
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            className="bg-purple-100 p-4 rounded-xl items-center flex-1"
                            onPress={() => router.push('/(tabs)/reporting')}
                        >
                            <FileText size={24} color="#9333ea" />
                            <Text className="text-purple-700 font-bold mt-2">New Visit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-orange-100 p-4 rounded-xl items-center flex-1"
                            onPress={() => router.push('/tour-plan')}
                        >
                            <Map size={24} color="#ea580c" />
                            <Text className="text-orange-700 font-bold mt-2">Tour Plan</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
                    <Text className="text-lg font-semibold mb-2">Today's Stats</Text>
                    <View className="flex-row justify-between">
                        <View className="items-center">
                            <Text className="text-2xl font-bold text-slate-800">0</Text>
                            <Text className="text-xs text-slate-500">Visits</Text>
                        </View>
                        <View className="items-center">
                            <Text className="text-2xl font-bold text-slate-800">0</Text>
                            <Text className="text-xs text-slate-500">Orders</Text>
                        </View>
                        <View className="items-center">
                            <Text className="text-2xl font-bold text-slate-800">0km</Text>
                            <Text className="text-xs text-slate-500">Travel</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
