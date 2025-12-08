import { Tabs } from 'expo-router';
import { Home, Calendar, FileText, User, Banknote } from 'lucide-react-native';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: '#2563eb',
            tabBarStyle: { paddingBottom: 5, height: 60 },
            tabBarLabelStyle: { fontSize: 12, marginBottom: 5 },
            headerShown: false
        }}>
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="attendance"
                options={{
                    title: 'Attendance',
                    tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="expenses"
                options={{
                    title: 'Expenses',
                    tabBarIcon: ({ color, size }) => <Banknote size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="reporting"
                options={{
                    title: 'Reporting',
                    tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
