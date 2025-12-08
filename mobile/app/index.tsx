import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { getUser } from '../src/services/mockDatabase';
import { UserRole } from '../src/types';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        setLoading(true);
        try {
            const user = await getUser(email, password);
            if (user) {
                if (user.role === UserRole.ADMIN) {
                    Alert.alert('Access Denied', 'Admin access is not allowed in the mobile app.');
                    setLoading(false);
                    return;
                }
                // Navigate to dashboard
                router.replace('/(tabs)/dashboard');
            } else {
                Alert.alert('Error', 'Invalid credentials');
            }
        } catch (error) {
            Alert.alert('Error', 'Login failed');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', padding: 24 }}>
            <View style={{ backgroundColor: 'white', padding: 32, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 2 }}>
                <View style={{ alignItems: 'center', marginBottom: 32 }}>
                    <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#1e293b' }}>Tertius</Text>
                    <Text style={{ color: '#64748b', marginTop: 8 }}>Field Force Automation</Text>
                </View>

                <View style={{ gap: 16 }}>
                    <View>
                        <Text style={{ color: '#334155', marginBottom: 4, fontWeight: '500' }}>Email / User ID</Text>
                        <TextInput
                            style={{ width: '100%', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, color: '#1e293b' }}
                            placeholder="Enter your email or ID"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                        />
                    </View>

                    <View>
                        <Text style={{ color: '#334155', marginBottom: 4, fontWeight: '500' }}>Password</Text>
                        <TextInput
                            style={{ width: '100%', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, color: '#1e293b' }}
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={{ backgroundColor: '#2563eb', paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 }}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Sign In</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
            <Text style={{ textAlign: 'center', color: '#94a3b8', marginTop: 32 }}>v1.0.0 Native</Text>
        </View>
    );
}
