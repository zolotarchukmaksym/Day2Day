import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useTaskStore } from '../../store/taskStore';
import { useNoteStore } from '../../store/noteStore';
import { colors, fonts, fontSizes, radii, spacing, cardBorder, stickerShadow } from '../../theme/theme';

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const tasksToday = useTaskStore((s) => s.tasksForSelectedDate);
  const notes = useNoteStore((s) => s.notes);

  const initial = (user?.email ?? '?').charAt(0).toUpperCase();
  const doneToday = tasksToday.filter((t) => t.is_completed).length;
  const totalToday = tasksToday.length;

  // МАКЕТ ДАНИХ (Mock Data) для тижневого графіка. 
  // Останній день (Sun) бере реальні дані за сьогодні.
  const weeklyStats = [
    { day: 'Mon', done: 3, total: 4 },
    { day: 'Tue', done: 5, total: 5 },
    { day: 'Wed', done: 2, total: 6 },
    { day: 'Thu', done: 4, total: 4 },
    { day: 'Fri', done: 1, total: 3 },
    { day: 'Sat', done: 0, total: 0 },
    { day: 'Sun', done: doneToday, total: totalToday },
  ];

  // Знаходимо максимальну кількість завдань, щоб правильно масштабувати стовпці
  const maxTasks = Math.max(...weeklyStats.map((s) => s.total), 1);
  const totalDoneWeek = weeklyStats.reduce((sum, s) => sum + s.done, 0);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Хедер профілю */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Блок статистики */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.yellow }]}>
            <Text style={styles.statValue}>{doneToday}</Text>
            <Text style={styles.statLabel}>Done today</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.sky }]}>
            <Text style={styles.statValue}>{notes.length}</Text>
            <Text style={styles.statLabel}>Notes saved</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
            <Text style={[styles.statValue, { color: colors.textOnDark }]}>{totalDoneWeek}</Text>
            <Text style={[styles.statLabel, { color: colors.textOnDark }]}>Weekly tasks</Text>
          </View>
        </View>

        {/* Графік активності */}
        <Text style={styles.sectionTitle}>Weekly Progress</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartRow}>
            {weeklyStats.map((stat, i) => {
              // Вираховуємо висоту стовпця відносно максимального значення
              const heightPct = (stat.total / maxTasks) * 100;
              // Вираховуємо заповненість стовпця (виконані завдання)
              const fillPct = stat.total > 0 ? (stat.done / stat.total) * 100 : 0;

              return (
                <View key={i} style={styles.barColumn}>
                  <View style={styles.barTrack}>
                    <View style={[styles.barTotal, { height: `${heightPct}%` }]}>
                      {/* Стовпець виконаних завдань, який росте знизу вгору */}
                      <View style={[styles.barDone, { height: `${fillPct}%` }]} />
                    </View>
                  </View>
                  <Text style={styles.barLabel}>{stat.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Кнопка виходу */}
        <Pressable style={styles.signOutButton} onPress={signOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 100, // Відступ знизу для нижнього меню (Tab Bar)
  },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...cardBorder,
    ...stickerShadow(4),
  },
  avatarText: { fontFamily: fonts.displayBold, fontSize: fontSizes.xxl, color: colors.textOnDark },
  email: { fontFamily: fonts.bodySemiBold, fontSize: fontSizes.md, color: colors.textPrimary },

  sectionTitle: {
    fontFamily: fonts.displayBold,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },

  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: '30%', // Щоб картки гарно переносилися
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...cardBorder,
    ...stickerShadow(3),
  },
  statValue: { fontFamily: fonts.displayBold, fontSize: fontSizes.xl, color: colors.ink },
  statLabel: { fontFamily: fonts.bodyMedium, fontSize: fontSizes.sm, color: colors.ink, marginTop: 4, textAlign: 'center' },

  // Стилі для графіка
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    ...cardBorder,
    ...stickerShadow(4),
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160, // Загальна висота графіка
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
  },
  barTrack: {
    flex: 1,
    width: 24,
    justifyContent: 'flex-end', // Щоб стовпці росли знизу
    marginBottom: spacing.sm,
  },
  barTotal: {
    width: '100%',
    backgroundColor: colors.bg, // Фон для невиконаних завдань
    borderRadius: radii.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    ...cardBorder,
  },
  barDone: {
    width: '100%',
    backgroundColor: colors.coral, // Колір виконаних завдань
  },
  barLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textSecondary,
  },

  signOutButton: {
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...cardBorder,
    ...stickerShadow(3),
    marginBottom: spacing.xl,
  },
  signOutText: { fontFamily: fonts.display, fontSize: fontSizes.md, color: colors.coral },
});