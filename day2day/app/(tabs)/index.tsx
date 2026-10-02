import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, SectionList, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import BottomSheet from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTaskStore } from '../../store/taskStore';
import { Task } from '../../types';
import TaskItem from '../../components/TaskItem';
import AddTaskSheet from '../../components/AddTaskSheet';
import FAB from '../../components/FAB';
import EmptyState from '../../components/EmptyState';
import { colors, fonts, fontSizes, radii, spacing, cardBorder, stickerShadow } from '../../theme/theme';

export default function PlannerScreen() {
  const selectedDate = useTaskStore((s) => s.selectedDate);
  const tasks = useTaskStore((s) => s.tasksForSelectedDate);
  const markedDates = useTaskStore((s) => s.markedDates);
  const setSelectedDate = useTaskStore((s) => s.setSelectedDate);
  const fetchTasksForSelectedDate = useTaskStore((s) => s.fetchTasksForSelectedDate);
  const fetchMonthMarkers = useTaskStore((s) => s.fetchMonthMarkers);
  const toggleTaskCompleted = useTaskStore((s) => s.toggleTaskCompleted);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  const allTasks = useTaskStore((s) => s.allTasks);
  const fetchAllTasks = useTaskStore((s) => s.fetchAllTasks);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'all'>('calendar');
  const sheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    fetchTasksForSelectedDate();
    fetchAllTasks();
    const now = new Date();
    fetchMonthMarkers(now.getFullYear(), now.getMonth() + 1);
  }, []);

  const onDayPress = useCallback((day: DateData) => setSelectedDate(day.dateString), []);
  const onMonthChange = useCallback((month: DateData) => fetchMonthMarkers(month.year, month.month), []);

  const openCreate = () => { setEditingTask(null); sheetRef.current?.expand(); };
  const openEdit = (task: Task) => { setEditingTask(task); sheetRef.current?.expand(); };

  const doneCount = tasks.filter((t) => t.is_completed).length;
  const isAllDone = tasks.length > 0 && doneCount === tasks.length;

  const cleanedMarkedDates = Object.keys(markedDates).reduce((acc, dateKey) => {
    const { selected, ...otherProps } = markedDates[dateKey];
    acc[dateKey] = otherProps;
    return acc;
  }, {} as Record<string, any>);

  const calendarMarkedDates = {
    ...cleanedMarkedDates,
    [selectedDate]: {
      ...cleanedMarkedDates[selectedDate],
      selected: true,
      selectedColor: colors.primary,
    },
  };

  const todoTasks = tasks.filter((t) => !t.is_completed);
  const doneTasks = tasks.filter((t) => t.is_completed);

  const d = new Date(selectedDate + 'T00:00:00');
  const weekdayStr = d.toLocaleDateString('en-US', { weekday: 'long' });
  const monthStr = d.toLocaleDateString('en-US', { month: 'long' });
  const dayNum = d.getDate();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>

      {/* Toggle Mode */}
      <View style={styles.headerToggle}>
        <View style={styles.toggleContainer}>
          <Pressable style={[styles.toggleBtn, viewMode === 'calendar' && styles.toggleBtnActive]} onPress={() => setViewMode('calendar')}>
            <Text style={[styles.toggleText, viewMode === 'calendar' && styles.toggleTextActive]}>Calendar</Text>
          </Pressable>
          <Pressable style={[styles.toggleBtn, viewMode === 'all' && styles.toggleBtnActive]} onPress={() => setViewMode('all')}>
            <Text style={[styles.toggleText, viewMode === 'all' && styles.toggleTextActive]}>All Tasks</Text>
          </Pressable>
        </View>
      </View>

      {viewMode === 'calendar' ? (
        <>
          <View style={styles.calendarCard}>
            <Calendar
              onDayPress={onDayPress}
              onMonthChange={onMonthChange}
              markedDates={calendarMarkedDates}
              hideExtraDays={true}
              style={{ paddingBottom: 10, borderRadius: 16 }}
              theme={{
                backgroundColor: colors.surface,
                calendarBackground: colors.surface,
                textSectionTitleColor: colors.textSecondary,
                selectedDayTextColor: colors.textOnDark,
                todayTextColor: colors.coral,
                dayTextColor: colors.textPrimary,
                dotColor: colors.coral,
                arrowColor: colors.primary,
                monthTextColor: colors.textPrimary,
                textDayFontFamily: fonts.bodyMedium,
                textMonthFontFamily: fonts.displayBold,
                textDayHeaderFontFamily: fonts.bodySemiBold,
                textDayFontSize: 14,
                textMonthFontSize: fontSizes.lg,
                'stylesheet.day.basic': {
                  text: {
                    marginTop: 4,
                    fontFamily: fonts.bodyMedium,
                    fontSize: 14,
                    color: colors.textPrimary,
                    backgroundColor: 'transparent',
                    includeFontPadding: false,
                    textAlign: 'center',
                    minWidth: 24,
                  }
                }
              }}
            />
          </View>

          <View style={styles.listHeader}>
            <View style={styles.dateGroup}>
              <Text style={styles.dateNumber}>{dayNum}</Text>
              <View style={styles.dateTextGroup}>
                <Text style={styles.weekdayName}>{weekdayStr}</Text>
                <Text style={styles.monthName}>{monthStr}</Text>
              </View>
            </View>

            <View style={[styles.progressPill, isAllDone && styles.progressPillSuccess]}>
              <Text style={[styles.progressPillText, isAllDone && styles.progressPillTextSuccess]}>
                {tasks.length === 0 ? 'Free day' : isAllDone ? 'All Done! 🎉' : `${doneCount}/${tasks.length} Tasks`}
              </Text>
            </View>
          </View>

          <FlatList
            data={tasks}
            keyExtractor={(t) => t.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => <TaskItem task={item} onToggle={toggleTaskCompleted} onPress={openEdit} onDelete={deleteTask} />}
            ListEmptyComponent={<EmptyState emoji="☕️" title="A clean slate" subtitle="Tap the + button to add a new task." />}
          />
        </>
      ) : (
        <View style={styles.allTasksContainer}>
          <SectionList
            sections={Object.entries(
              allTasks.reduce((acc, task) => {
                const date = task.target_date;
                if (!acc[date]) acc[date] = [];
                acc[date].push(task);
                return acc;
              }, {} as Record<string, Task[]>)
            ).map(([title, data]) => ({ title, data })).sort((a, b) => a.title.localeCompare(b.title))}
            keyExtractor={(t) => t.id}
            contentContainerStyle={styles.listContent}
            renderSectionHeader={({ section: { title } }) => {
              const d = new Date(title + 'T00:00:00');
              const displayDate = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
              return (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>{displayDate}</Text>
                </View>
              );
            }}
            renderItem={({ item }) => <TaskItem task={item} onToggle={toggleTaskCompleted} onPress={openEdit} onDelete={deleteTask} />}
            ListEmptyComponent={<EmptyState emoji="🎉" title="All caught up!" subtitle="No upcoming tasks." />}
          />
        </View>
      )}

      <FAB onPress={openCreate} />

      <AddTaskSheet
        ref={sheetRef}
        targetDate={selectedDate}
        editingTask={editingTask}
        onClose={() => sheetRef.current?.close()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  headerToggle: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm, alignItems: 'center' },
  toggleContainer: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radii.pill, padding: 4, ...cardBorder },
  toggleBtn: { paddingVertical: 8, paddingHorizontal: 24, borderRadius: radii.pill },
  toggleBtnActive: { backgroundColor: colors.primary },
  toggleText: { fontFamily: fonts.bodySemiBold, fontSize: fontSizes.sm, color: colors.textSecondary },
  toggleTextActive: { color: colors.textOnDark },

  calendarCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    ...cardBorder,
    ...stickerShadow(4),
    paddingBottom: 8 // Місце для останнього тижня
  },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: 160 },

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  dateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dateNumber: {
    fontFamily: fonts.displayBold,
    fontSize: 42,
    color: colors.primary,
    lineHeight: 50,
    includeFontPadding: false,
    minWidth: 65,
    textAlign: 'center',
  },
  dateTextGroup: {
    justifyContent: 'center',
  },
  weekdayName: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.ink,
  },
  monthName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 2,
  },

  progressPill: {
    backgroundColor: 'rgba(0, 98, 255, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(0, 98, 255, 0.15)',
  },
  progressPillText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.sm,
    color: colors.primaryDark,
  },
  progressPillSuccess: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  progressPillTextSuccess: {
    color: '#059669',
  },

  allTasksContainer: { flex: 1, marginTop: spacing.md },
  sectionHeader: { 
    backgroundColor: colors.bg, 
    paddingVertical: spacing.sm, 
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  sectionHeaderText: { 
    fontFamily: fonts.displayBold, 
    fontSize: fontSizes.lg, 
    color: colors.ink 
  },
});