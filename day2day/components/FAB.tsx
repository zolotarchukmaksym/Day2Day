import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, stickerShadow } from '../theme/theme';

type FABProps = {
  onPress: () => void;
  color?: string;
};

export default function FAB({ onPress, color }: FABProps) {
  return (
    <Pressable style={[styles.fab, color ? { backgroundColor: color } : undefined]} onPress={onPress}>
      <Ionicons name="add" size={30} color={colors.textOnDark} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    // Піднімаємо кнопку вище: 20 (відступ від низу) + 72 (висота таббару) + 20 (зазор)
    bottom: 112,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...stickerShadow(4),
    zIndex: 100, // Переконуємося, що вона вище за все
  },
});