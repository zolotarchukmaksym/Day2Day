import React, { forwardRef, useState, useMemo, useCallback, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types';
import { useTaskStore } from '../store/taskStore';
import { colors, fonts, fontSizes, radii, spacing, stickerShadow, cardBorder } from '../theme/theme';
import { scheduleTaskReminder } from '../lib/notifications';

type Props = {
  targetDate: string;
  editingTask: Task | null;
  onClose: () => void;
};

const REMINDER_OPTIONS = [
  { label: 'At time', value: 0 },
  { label: '10 min', value: 10 },
  { label: '1 hour', value: 60 },
];

type RepeatMode = 'none' | 'daily' | 'weekly' | 'custom';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

/**
 * Generate future dates based on repeat mode.
 * - daily: next 30 days
 * - weekly: same weekday for next 12 weeks
 * - custom: selected weekdays for next 4 weeks
 */
function generateRepeatDates(
  startDate: Date,
  mode: RepeatMode,
  selectedDays: boolean[]
): string[] {
  const dates: string[] = [];
  const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  if (mode === 'daily') {
    for (let i = 1; i <= 30; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      dates.push(toIso(d));
    }
  } else if (mode === 'weekly') {
    for (let i = 1; i <= 12; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i * 7);
      dates.push(toIso(d));
    }
  } else if (mode === 'custom') {
    // selectedDays: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
    // JS getDay(): 0=Sun, 1=Mon, ... 6=Sat
    // Map our index to JS day: 0->1, 1->2, ..., 5->6, 6->0
    const jsDay = (idx: number) => (idx + 1) % 7;
    for (let week = 0; week < 4; week++) {
      for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
        if (!selectedDays[dayIdx]) continue;
        const target = jsDay(dayIdx);
        const d = new Date(startDate);
        // Find the next occurrence of this weekday in the given week offset
        const currentDay = d.getDay();
        let diff = target - currentDay;
        if (diff <= 0) diff += 7; // always push forward
        d.setDate(d.getDate() + diff + week * 7);
        dates.push(toIso(d));
      }
    }
  }

  // Remove duplicates and sort
  return [...new Set(dates)].sort();
}

const AddTaskSheet = forwardRef<BottomSheet, Props>(({ targetDate, editingTask, onClose }, ref) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskDate, setTaskDate] = useState<Date>(new Date());
  const [taskTime, setTaskTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reminderOffset, setReminderOffset] = useState<number>(0);
  const [focusedInput, setFocusedInput] = useState<'title' | 'desc' | null>(null);

  // Repeat state
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [customDays, setCustomDays] = useState<boolean[]>([false, false, false, false, false, false, false]);

  const isSavingRef = useRef(false);

  const addTask = useTaskStore((s) => s.addTask);
  const addBatchTasks = useTaskStore((s) => s.addBatchTasks);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  const snapPoints = useMemo(() => ['85%'], []);

  // Track previous index to detect sheet opening
  const prevIndexRef = useRef(-1);

  const handleSheetChange = useCallback((index: number) => {
    // Sheet is opening (from closed to open)
    if (prevIndexRef.current === -1 && index >= 0) {
      // Reset form state only when the sheet first opens
      setTitle(editingTask?.title ?? '');
      setDescription(editingTask?.description ?? '');
      setTaskTime(null);
      setReminderOffset(0);
      setRepeatMode('none');
      setCustomDays([false, false, false, false, false, false, false]);
      if (targetDate) setTaskDate(new Date(targetDate + 'T00:00:00'));
    }
    prevIndexRef.current = index;
  }, [editingTask, targetDate]);

  const onSave = async () => {
    if (isSavingRef.current) return;
    if (!title.trim()) { Alert.alert('Missing title', 'Please add a title.'); return; }
    isSavingRef.current = true;
    const formattedDateString = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, '0')}-${String(taskDate.getDate()).padStart(2, '0')}`;
    try {
      if (editingTask) {
        await updateTask(editingTask.id, { title: title.trim(), description: description.trim() });
        if (taskTime) {
          scheduleTaskReminder(title.trim(), formattedDateString, taskTime, reminderOffset);
        }
      } else {
        // Create the primary task
        await addTask({ title: title.trim(), description: description.trim(), target_date: formattedDateString });
        if (taskTime) {
          scheduleTaskReminder(title.trim(), formattedDateString, taskTime, reminderOffset);
        }

        // Create repeated tasks if applicable
        if (repeatMode !== 'none') {
          const futureDates = generateRepeatDates(taskDate, repeatMode, customDays);
          if (futureDates.length > 0) {
            const batchInputs = futureDates.map((date) => ({
              title: title.trim(),
              description: description.trim(),
              target_date: date,
            }));
            await addBatchTasks(batchInputs);
            // Optional: Schedule reminders for repeated tasks
            if (taskTime) {
              futureDates.forEach(date => {
                scheduleTaskReminder(title.trim(), date, taskTime, reminderOffset);
              });
            }
          }
        }
      }
      onClose();
    } catch (e: any) { Alert.alert('Error', e.message); } finally {
      isSavingRef.current = false;
    }
  };

  const toggleCustomDay = (index: number) => {
    setCustomDays((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
      />
    ),
    []
  );

  const repeatInfo = useMemo(() => {
    switch (repeatMode) {
      case 'daily': return 'Creates tasks for the next 30 days';
      case 'weekly': return 'Creates tasks for the next 12 weeks';
      case 'custom':
        const selected = WEEKDAYS.filter((_, i) => customDays[i]);
        return selected.length > 0
          ? `Every ${selected.join(', ')} for 4 weeks`
          : 'Select at least one day';
      default: return '';
    }
  }, [repeatMode, customDays]);

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      onChange={handleSheetChange}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: radii.lg }}
      style={{ elevation: 100, zIndex: 100 }}
    >
      <BottomSheetView style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <Text style={styles.heading}>{editingTask ? 'Edit task' : 'New task'}</Text>
          </View>

          <View style={styles.inputGroup}>
            <View style={[styles.inputWrapper, focusedInput === 'title' && styles.inputWrapperFocused]}>
              <Ionicons name="radio-button-off" size={20} color={focusedInput === 'title' ? colors.primary : colors.textMuted} style={styles.inputIcon} />
              <BottomSheetTextInput
                style={styles.input}
                placeholder="What needs to be done?"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
                onFocus={() => setFocusedInput('title')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            <View style={[styles.inputWrapper, styles.textAreaWrapper, focusedInput === 'desc' && styles.inputWrapperFocused]}>
              <Ionicons name="document-text-outline" size={20} color={focusedInput === 'desc' ? colors.primary : colors.textMuted} style={styles.inputIcon} />
              <BottomSheetTextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add notes or details..."
                placeholderTextColor={colors.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                onFocus={() => setFocusedInput('desc')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          </View>

          <Text style={styles.sectionLabel}>Schedule</Text>
          <View style={styles.scheduleRow}>
            <Pressable style={styles.scheduleCard} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <View>
                <Text style={styles.scheduleLabel}>Date</Text>
                <Text style={styles.scheduleValue}>{taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
              </View>
            </Pressable>

            <Pressable style={styles.scheduleCard} onPress={() => setShowTimePicker(true)}>
              <Ionicons name="time-outline" size={20} color={colors.yellow} />
              <View>
                <Text style={styles.scheduleLabel}>Time</Text>
                <Text style={styles.scheduleValue}>{taskTime ? taskTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'None'}</Text>
              </View>
            </Pressable>
          </View>

          {showDatePicker && <DateTimePicker value={taskDate} mode="date" display="default" onChange={(e, d) => { setShowDatePicker(false); if (d) setTaskDate(d); }} />}
          {showTimePicker && <DateTimePicker value={taskTime || new Date()} mode="time" is24Hour={true} display="default" onChange={(e, t) => { setShowTimePicker(false); if (t) setTaskTime(t); }} />}

          {taskTime && (
            <>
              <Text style={styles.sectionLabel}>Reminder</Text>
              <View style={styles.repeatRow}>
                {REMINDER_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[styles.repeatChip, reminderOffset === opt.value && styles.repeatChipActive]}
                    onPress={() => setReminderOffset(opt.value)}
                  >
                    <Text style={[styles.repeatChipText, reminderOffset === opt.value && styles.repeatChipTextActive]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* Repeat Section — only show when creating a new task */}
          {!editingTask && (
            <>
              <Text style={styles.sectionLabel}>Repeat</Text>

              <View style={styles.repeatRow}>
                {(['none', 'daily', 'weekly', 'custom'] as RepeatMode[]).map((mode) => (
                  <Pressable
                    key={mode}
                    style={[styles.repeatChip, repeatMode === mode && styles.repeatChipActive]}
                    onPress={() => setRepeatMode(mode)}
                  >
                    <Text style={[styles.repeatChipText, repeatMode === mode && styles.repeatChipTextActive]}>
                      {mode === 'none' ? 'None' : mode === 'daily' ? 'Daily' : mode === 'weekly' ? 'Weekly' : 'Custom'}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {repeatMode === 'custom' && (
                <View style={styles.weekdayRow}>
                  {WEEKDAYS.map((day, i) => (
                    <Pressable
                      key={day}
                      style={[styles.weekdayChip, customDays[i] && styles.weekdayChipActive]}
                      onPress={() => toggleCustomDay(i)}
                    >
                      <Text style={[styles.weekdayChipText, customDays[i] && styles.weekdayChipTextActive]}>
                        {day}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {repeatMode !== 'none' && (
                <View style={styles.repeatInfoBox}>
                  <Ionicons name="repeat-outline" size={16} color={colors.primary} />
                  <Text style={styles.repeatInfoText}>{repeatInfo}</Text>
                </View>
              )}
            </>
          )}

          <View style={styles.buttonRow}>
            <Pressable style={[styles.primaryButton, { flex: 1 }]} onPress={onSave}>
              <Text style={styles.primaryButtonText}>{editingTask ? 'Save Changes' : 'Create Task'}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default AddTaskSheet;

const styles = StyleSheet.create({
  content: { flex: 1, padding: spacing.xl, paddingBottom: 100 },
  headerRow: { marginBottom: spacing.lg },
  heading: { fontFamily: fonts.displayBold, fontSize: fontSizes.xl, color: colors.ink },
  inputGroup: { gap: spacing.sm, marginBottom: spacing.xl },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg, borderRadius: radii.md, borderWidth: 1.5, borderColor: 'transparent', paddingHorizontal: spacing.md },
  textAreaWrapper: { alignItems: 'flex-start', paddingTop: spacing.md },
  inputWrapperFocused: { backgroundColor: colors.surface, borderColor: colors.border },
  inputIcon: { marginRight: spacing.sm },
  input: { flex: 1, paddingVertical: spacing.md, fontFamily: fonts.body, fontSize: fontSizes.md, color: colors.textPrimary },
  textArea: { minHeight: 80, textAlignVertical: 'top', paddingTop: 0 },
  sectionLabel: { fontFamily: fonts.displayBold, fontSize: fontSizes.sm, color: colors.ink, marginBottom: spacing.sm },
  scheduleRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  scheduleCard: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg, padding: spacing.md, borderRadius: radii.md, gap: spacing.sm },
  scheduleLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.textSecondary, textTransform: 'uppercase' },
  scheduleValue: { fontFamily: fonts.displayBold, fontSize: fontSizes.md, color: colors.ink, marginTop: 2 },

  // Repeat section
  repeatRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  repeatChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.bg,
    ...cardBorder,
  },
  repeatChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  repeatChipText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  repeatChipTextActive: {
    color: colors.textOnDark,
  },

  weekdayRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
    justifyContent: 'space-between',
  },
  weekdayChip: {
    width: 42,
    height: 42,
    borderRadius: radii.sm,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    ...cardBorder,
  },
  weekdayChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  weekdayChipText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  weekdayChipTextActive: {
    color: colors.textOnDark,
  },

  repeatInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(0, 98, 255, 0.06)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    marginBottom: spacing.xl,
  },
  repeatInfoText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.primary,
    flex: 1,
  },

  buttonRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg, marginBottom: spacing.xxl },
  primaryButton: { backgroundColor: colors.primary, borderRadius: radii.pill, paddingVertical: 18, alignItems: 'center', ...stickerShadow(3) },
  primaryButtonText: { fontFamily: fonts.displayBold, fontSize: fontSizes.md, color: colors.textOnDark },
});