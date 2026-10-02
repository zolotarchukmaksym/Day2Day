import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();

    return (
        <View style={styles.container}>
            <View style={styles.avatar}>
                <Ionicons name="person" size={36} color="#fff" />
            </View>
            <Text style={styles.email}>{user?.email}</Text>

            <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', paddingTop: 60, backgroundColor: '#fff' },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#4f46e5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    email: { fontSize: 16, fontWeight: '600', color: '#1a1a1a', marginBottom: 32 },
    signOutButton: {
        borderWidth: 1,
        borderColor: '#ef4444',
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    signOutText: { color: '#ef4444', fontWeight: '600', fontSize: 15 },
});