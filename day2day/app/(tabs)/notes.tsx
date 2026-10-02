import { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNoteStore } from '../../store/noteStore';
import { Note } from '../../types';
import NoteCard from '../../components/NoteCard';
import AddNoteSheet from '../../components/AddNoteSheet';
import FAB from '../../components/FAB';
import EmptyState from '../../components/EmptyState';
import { colors, fonts, fontSizes, spacing } from '../../theme/theme';

export default function NotesScreen() {
  const notes = useNoteStore((s) => s.notes);
  const fetchNotes = useNoteStore((s) => s.fetchNotes);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const sheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const openCreate = () => {
    setEditingNote(null);
    sheetRef.current?.expand();
  };

  const openEdit = (note: Note) => {
    setEditingNote(note);
    sheetRef.current?.expand();
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Notes</Text>
        <Text style={styles.subtitle}>Ideas and thoughts, all in one place</Text>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <NoteCard note={item} onPress={openEdit} />}
        ListEmptyComponent={
          <EmptyState
            emoji="💡"
            title="No notes yet"
            subtitle="Tap the + button to capture your first idea."
          />
        }
      />

      <FAB onPress={openCreate} color={colors.sky} />

      <AddNoteSheet
        ref={sheetRef}
        editingNote={editingNote}
        onClose={() => sheetRef.current?.close()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg },
  title: { fontFamily: fonts.displayBold, fontSize: fontSizes.xxl, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.body, fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: 160 },
});
