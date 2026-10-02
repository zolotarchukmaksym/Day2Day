import React, { forwardRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

// Ref-controlled bottom sheet. Parent calls ref.current.expand() / .close()
const TaskBottomSheet = forwardRef(({ selectedDate, onCreate }, ref) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSave = () => {
        if (!title.trim()) return;
        onCreate({ title: title.trim(), description: description.trim() });
        setTitle('');
        setDescription('');
        ref.current?.close();
    };

    return (
        <BottomSheet ref={ref} index={-1} snapPoints={['45%']} enablePanDownToClose backgroundStyle={styles.sheetBg}>
            <BottomSheetView style={styles.container}>
                <Text style={styles.heading}>New Task</Text>
                <Text style={styles.subheading}>{selectedDate}</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Title"
                    value={title}
                    onChangeText={setTitle}
                    autoFocus
                />
                <TextInput
                    style={[styles.input, styles.multiline]}
                    placeholder="Description (optional)"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />

                <TouchableOpacity style={styles.button} onPress={handleSave}>
                    <Text style={styles.buttonText}>Save Task</Text>
                </TouchableOpacity>
            </BottomSheetView>
        </BottomSheet>
    );
});

export default TaskBottomSheet;

const styles = StyleSheet.create({
    sheetBg: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    container: { flex: 1, paddingHorizontal: 20 },
    heading: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
    subheading: { fontSize: 13, color: '#8e8e93', marginBottom: 16 },
    input: {
        backgroundColor: '#f2f2f7',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        marginBottom: 12,
    },
    multiline: { height: 80, textAlignVertical: 'top' },
    button: {
        backgroundColor: '#4f46e5',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 4,
    },
    buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});