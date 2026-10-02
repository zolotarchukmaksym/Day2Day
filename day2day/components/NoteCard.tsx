import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Note } from '../types';
import { colors, fonts, fontSizes, radii, spacing, cardBorder, stickerShadow } from '../theme/theme';

const ACCENTS = [colors.yellow, colors.sky, colors.coral, colors.lime];

function accentFor(id: string) {
  const sum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return ACCENTS[sum % ACCENTS.length];
}

export default function NoteCard({ note, onPress }: { note: Note; onPress: (note: Note) => void }) {
  const date = new Date(note.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Pressable
      onPress={() => onPress(note)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.accentBar, { backgroundColor: accentFor(note.id) }]} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{note.title}</Text>
        {!!note.content && (
          <Text style={styles.body} numberOfLines={2}>{note.content}</Text>
        )}
        <Text style={styles.date}>{date}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...cardBorder,
    ...stickerShadow(3),
  },
  pressed: { transform: [{ translateY: 2 }], shadowOffset: { width: 0, height: 1 } },
  accentBar: { width: 8 },
  content: { flex: 1, padding: spacing.md },
  title: { fontFamily: fonts.bodySemiBold, fontSize: fontSizes.md, color: colors.textPrimary },
  body: { fontFamily: fonts.body, fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 4 },
  date: { fontFamily: fonts.bodyMedium, fontSize: fontSizes.xs, color: colors.textMuted, marginTop: spacing.sm },
});
