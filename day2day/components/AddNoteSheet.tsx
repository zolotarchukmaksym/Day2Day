import React, { forwardRef, useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Note } from '../types';
import { useNoteStore } from '../store/noteStore';
import { colors, fonts, fontSizes, radii, spacing, stickerShadow } from '../theme/theme';

type Props = {
  editingNote: Note | null;
  onClose: () => void;
};

const AddNoteSheet = forwardRef<BottomSheet, Props>(({ editingNote, onClose }, ref) => {
  const [isReady, setIsReady] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [focusedInput, setFocusedInput] = useState<'title' | 'content' | null>(null);

  const addNote = useNoteStore((s) => s.addNote);
  const updateNote = useNoteStore((s) => s.updateNote);
  const deleteNote = useNoteStore((s) => s.deleteNote);

  const snapPoints = useMemo(() => ['70%'], []);

  useEffect(() => {
    setIsReady(true);
    setTitle(editingNote?.title ?? '');
    setContent(editingNote?.content ?? '');
  }, [editingNote]);

  const onSave = async () => {
    if (!title.trim()) return;
    try {
      if (editingNote) {
        await updateNote(editingNote.id, { title: title.trim(), content: content.trim() });
      } else {
        await addNote({ title: title.trim(), content: content.trim() });
      }
      onClose();
    } catch (e) { }
  };

  const onDelete = async () => {
    if (!editingNote) return;
    await deleteNote(editingNote.id);
    onClose();
  };

  // Мемоїзуємо бекдроп, щоб клавіатура не ховалася
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
    ),
    []
  );

  // Чекаємо готовності нативних модулів
  if (!isReady) return null;

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      keyboardBehavior="interactive"
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: radii.lg }}
      style={{ elevation: 100, zIndex: 100 }} // Робимо поверх інших елементів
    >
      <BottomSheetView style={styles.content}>
        <Text style={styles.heading}>{editingNote ? 'Edit note' : 'New note'}</Text>

        <View style={[styles.inputWrapper, focusedInput === 'title' && styles.inputWrapperFocused]}>
          <Ionicons name="bookmark-outline" size={20} color={focusedInput === 'title' ? colors.primary : colors.textMuted} style={styles.inputIcon} />
          <BottomSheetTextInput
            style={styles.input}
            placeholder="Title"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            onFocus={() => setFocusedInput('title')}
            onBlur={() => setFocusedInput(null)}
          />
        </View>

        <View style={[styles.inputWrapper, styles.textAreaWrapper, focusedInput === 'content' && styles.inputWrapperFocused]}>
          <Ionicons name="pencil-outline" size={20} color={focusedInput === 'content' ? colors.primary : colors.textMuted} style={styles.inputIcon} />
          <BottomSheetTextInput
            style={[styles.input, styles.textArea]}
            placeholder="Write your thought…"
            placeholderTextColor={colors.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            onFocus={() => setFocusedInput('content')}
            onBlur={() => setFocusedInput(null)}
          />
        </View>

        <View style={styles.buttonRow}>
          {editingNote && (
            <Pressable style={styles.secondaryButton} onPress={onDelete}>
              <Ionicons name="trash-outline" size={20} color={colors.coral} />
            </Pressable>
          )}
          <Pressable style={[styles.primaryButton, { flex: 1 }]} onPress={onSave}>
            <Text style={styles.primaryButtonText}>{editingNote ? 'Save changes' : 'Add note'}</Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default AddNoteSheet;

const styles = StyleSheet.create({
  content: { flex: 1, padding: spacing.xl, paddingBottom: 80 },
  heading: { fontFamily: fonts.displayBold, fontSize: fontSizes.xl, color: colors.ink, marginBottom: spacing.lg },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  inputWrapperFocused: { backgroundColor: colors.surface, borderColor: colors.border },
  inputIcon: { marginRight: spacing.sm },
  input: { flex: 1, paddingVertical: spacing.md, fontFamily: fonts.body, fontSize: fontSizes.md, color: colors.textPrimary },
  textAreaWrapper: { alignItems: 'flex-start', paddingTop: spacing.md },
  textArea: { minHeight: 150, textAlignVertical: 'top', paddingTop: 0 },

  buttonRow: { flexDirection: 'row', gap: spacing.md, marginTop: 'auto' },
  primaryButton: { backgroundColor: colors.primary, borderRadius: radii.pill, paddingVertical: 18, alignItems: 'center', ...stickerShadow(3) },
  primaryButtonText: { fontFamily: fonts.displayBold, fontSize: fontSizes.md, color: colors.textOnDark },
  secondaryButton: { backgroundColor: 'rgba(251, 113, 133, 0.1)', borderRadius: radii.pill, width: 56, alignItems: 'center', justifyContent: 'center' },
});