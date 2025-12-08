import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { logoutUser } from '../../src/services/mockDatabase';

export default function Profile() {
    const router = useRouter();

    const handleLogout = async () => {
        await logoutUser();
        router.replace('/');
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50 p-4">
            <Text className="text-2xl font-bold mb-6">Profile</Text>

            <TouchableOpacity
                className="bg-red-50 p-4 rounded-xl flex-row items-center justify-center"
                onPress={handleLogout}
            >
                <Text className="text-red-600 font-bold">Logout</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
