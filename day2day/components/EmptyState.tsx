import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes, spacing } from '../theme/theme';

export default function EmptyState({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl },
  emoji: { fontSize: 44, marginBottom: spacing.sm },
  title: { fontFamily: fonts.display, fontSize: fontSizes.lg, color: colors.textPrimary },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
