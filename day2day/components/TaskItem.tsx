import { useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types';
import { colors, fonts, fontSizes, radii, spacing, cardBorder, stickerShadow } from '../theme/theme';

type Props = {
  task: Task;
  onToggle: (id: string) => void;
  onPress: (task: Task) => void;
  onDelete: (id: string) => void;
};

export default function TaskItem({ task, onToggle, onPress, onDelete }: Props) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <Pressable
        style={styles.deleteAction}
        onPress={() => {
          swipeableRef.current?.close();
          onDelete(task.id);
        }}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash-outline" size={22} color="#fff" />
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
      rightThreshold={40}
    >
      <Pressable
        onPress={() => onPress(task)}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <Pressable
          onPress={() => onToggle(task.id)}
          hitSlop={10}
          style={[
            styles.checkbox,
            { backgroundColor: task.is_completed ? colors.lime : colors.surface },
          ]}
        >
          {task.is_completed && <Ionicons name="checkmark" size={16} color={colors.ink} />}
        </Pressable>

        <View style={styles.textWrap}>
          <Text
            style={[styles.title, task.is_completed && styles.titleDone]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          {!!task.description && (
            <Text style={styles.description} numberOfLines={1}>
              {task.description}
            </Text>
          )}
        </View>

        <View
          style={[
            styles.statusPill,
            { backgroundColor: task.is_completed ? colors.lime : colors.coral },
          ]}
        >
          <Text style={styles.statusText}>{task.is_completed ? 'Done' : 'Pending'}</Text>
        </View>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...cardBorder,
    ...stickerShadow(3),
  },
  pressed: { transform: [{ translateY: 2 }], shadowOffset: { width: 0, height: 1 } },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: radii.sm - 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    ...cardBorder,
    borderWidth: 2,
  },
  textWrap: { flex: 1 },
  title: { fontFamily: fonts.bodySemiBold, fontSize: fontSizes.md, color: colors.textPrimary },
  titleDone: { textDecorationLine: 'line-through', color: colors.textMuted },
  description: { fontFamily: fonts.body, fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  statusPill: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginLeft: spacing.sm,
  },
  statusText: { fontFamily: fonts.bodySemiBold, fontSize: 11, color: colors.ink },
  deleteAction: {
    backgroundColor: colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    marginLeft: spacing.sm,
  },
});
