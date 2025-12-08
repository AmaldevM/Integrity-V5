import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { getDailyAttendance, saveDailyAttendance, getUser } from '../../src/services/mockDatabase';
import { DailyAttendance, PunchRecord } from '../../src/types';
import { v4 as uuidv4 } from 'uuid';

export default function AttendanceScreen() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [todayAttendance, setTodayAttendance] = useState<DailyAttendance | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);

            const u = await getUser();
            setUser(u);
            if (u) {
                const dateStr = new Date().toISOString().split('T')[0];
                const att = await getDailyAttendance(u.uid, dateStr);
                setTodayAttendance(att);
            }
        })();
    }, []);

    const handlePunch = async (type: 'IN' | 'OUT') => {
        if (!location || !user) {
            Alert.alert("Wait", "Fetching location or user info...");
            return;
        }
        setLoading(true);
        try {
            const dateStr = new Date().toISOString().split('T')[0];
            let att = todayAttendance;
            if (!att || att.date !== dateStr) {
                att = {
                    id: `${user.uid}_${dateStr}`,
                    userId: user.uid,
                    date: dateStr,
                    punchIn: null,
                    punchOuts: [],
                    isSyncedToSheets: false
                };
            }

            const record: PunchRecord = {
                id: uuidv4(),
                type,
                timestamp: new Date().toISOString(),
                location: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    accuracy: location.coords.accuracy || 0,
                    timestamp: location.timestamp
                }
            };

            if (type === 'IN') {
                if (att.punchIn) {
                    Alert.alert("Error", "Already punched in!");
                    setLoading(false);
                    return;
                }
                att.punchIn = record;
            } else {
                att.punchOuts.push(record);
            }

            await saveDailyAttendance(att);
            setTodayAttendance({ ...att });
            Alert.alert("Success", `Punched ${type} Successfully!`);
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to save attendance");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50 p-6">
            <Text className="text-2xl font-bold mb-2">Attendance</Text>
            <Text className="text-slate-500 mb-8">{new Date().toDateString()}</Text>

            {errorMsg ? <Text className="text-red-500">{errorMsg}</Text> : null}

            <View className="bg-white p-6 rounded-xl shadow-sm items-center">
                <View className="mb-6 items-center">
                    <Text className="text-slate-600 mb-1">Current Location</Text>
                    {location ? (
                        <Text className="font-mono text-xs text-slate-400">
                            {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
                        </Text>
                    ) : (
                        <ActivityIndicator size="small" />
                    )}
                </View>

                <View className="flex-row gap-4 w-full">
                    <TouchableOpacity
                        className={`flex-1 py-4 rounded-xl items-center ${todayAttendance?.punchIn ? 'bg-slate-200' : 'bg-green-600'}`}
                        disabled={!!todayAttendance?.punchIn || loading}
                        onPress={() => handlePunch('IN')}
                    >
                        <Text className={`font-bold text-lg ${todayAttendance?.punchIn ? 'text-slate-400' : 'text-white'}`}>Punch In</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-1 bg-red-600 py-4 rounded-xl items-center"
                        disabled={loading}
                        onPress={() => handlePunch('OUT')}
                    >
                        <Text className="text-white font-bold text-lg">Punch Out</Text>
                    </TouchableOpacity>
                </View>

                {todayAttendance?.punchIn && (
                    <View className="mt-6 w-full bg-green-50 p-4 rounded-lg border border-green-100">
                        <Text className="text-green-800 font-medium">Punched In at:</Text>
                        <Text className="text-green-700">{new Date(todayAttendance.punchIn.timestamp).toLocaleTimeString()}</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}
