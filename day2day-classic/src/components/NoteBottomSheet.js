import React, { forwardRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

const NoteBottomSheet = forwardRef(({ onCreate }, ref) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSave = () => {
        if (!title.trim()) return;
        onCreate({ title: title.trim(), content: content.trim() });
        setTitle('');
        setContent('');
        ref.current?.close();
    };

    return (
        <BottomSheet ref={ref} index={-1} snapPoints={['50%']} enablePanDownToClose backgroundStyle={styles.sheetBg}>
            <BottomSheetView style={styles.container}>
                <Text style={styles.heading}>New Note</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Title"
                    value={title}
                    onChangeText={setTitle}
                    autoFocus
                />
                <TextInput
                    style={[styles.input, styles.multiline]}
                    placeholder="Write your thoughts..."
                    value={content}
                    onChangeText={setContent}
                    multiline
                />

                <TouchableOpacity style={styles.button} onPress={handleSave}>
                    <Text style={styles.buttonText}>Save Note</Text>
                </TouchableOpacity>
            </BottomSheetView>
        </BottomSheet>
    );
});

export default NoteBottomSheet;

const styles = StyleSheet.create({
    sheetBg: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    container: { flex: 1, paddingHorizontal: 20 },
    heading: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 16 },
    input: {
        backgroundColor: '#f2f2f7',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        marginBottom: 12,
    },
    multiline: { height: 120, textAlignVertical: 'top' },
    button: {
        backgroundColor: '#4f46e5',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 4,
    },
    buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});