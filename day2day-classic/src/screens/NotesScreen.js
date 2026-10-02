import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { fetchNotes, createNote, deleteNote } from '../services/notes';
import NoteBottomSheet from '../components/NoteBottomSheet';

export default function NotesScreen() {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const sheetRef = useRef(null);

    const load = useCallback(async () => {
        try {
            setNotes(await fetchNotes());
        } catch (e) {
            console.warn('Failed to load notes:', e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleCreate = async ({ title, content }) => {
        try {
            const newNote = await createNote({ user_id: user.id, title, content });
            setNotes((prev) => [newNote, ...prev]);
        } catch (e) {
            console.warn('Create note failed:', e.message);
        }
    };

    const handleDelete = async (id) => {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        try {
            await deleteNote(id);
        } catch (e) {
            load();
        }
    };

    const renderNote = ({ item }) => (
        <View style={styles.noteCard}>
            <View style={{ flex: 1 }}>
                <Text style={styles.noteTitle}>{item.title}</Text>
                {!!item.content && (
                    <Text style={styles.noteContent} numberOfLines={3}>
                        {item.content}
                    </Text>
                )}
                <Text style={styles.noteDate}>
                    {new Date(item.created_at).toLocaleDateString()}
                </Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={20} color="#c7c7cc" />
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4f46e5" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Notes</Text>
                <TouchableOpacity onPress={() => sheetRef.current?.expand()} style={styles.addButton}>
                    <Ionicons name="add" size={22} color="#fff" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={notes}
                keyExtractor={(item) => item.id}
                renderItem={renderNote}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
                ListEmptyComponent={<Text style={styles.emptyText}>No notes yet. Tap + to write one.</Text>}
            />

            <NoteBottomSheet ref={sheetRef} onCreate={handleCreate} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    headerText: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
    addButton: {
        backgroundColor: '#4f46e5',
        borderRadius: 20,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noteCard: {
        flexDirection: 'row',
        backgroundColor: '#f9f9fb',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
    },
    noteTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
    noteContent: { fontSize: 13, color: '#6b6b70', marginTop: 4 },
    noteDate: { fontSize: 11, color: '#a1a1aa', marginTop: 6 },
    emptyText: { textAlign: 'center', color: '#a1a1aa', marginTop: 30, fontSize: 14 },
});