import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { fetchAllTasks, createTask, toggleTaskStatus, deleteTask } from '../services/tasks';
import TaskBottomSheet from '../components/TaskBottomSheet';

const todayString = () => new Date().toISOString().split('T')[0];

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const sheetRef = useRef(null);

  const loadTasks = useCallback(async () => {
    try {
      const data = await fetchAllTasks();
      setAllTasks(data);
    } catch (e) {
      console.warn('Failed to load tasks:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Build calendar dot markers from all tasks (grouped by date)
  const markedDates = useMemo(() => {
    const marks = {};
    allTasks.forEach((t) => {
      marks[t.target_date] = { marked: true, dotColor: '#4f46e5' };
    });
    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: '#4f46e5',
    };
    return marks;
  }, [allTasks, selectedDate]);

  // Tasks for the currently selected day — instant, no extra fetch needed
  const dayTasks = useMemo(
    () => allTasks.filter((t) => t.target_date === selectedDate),
    [allTasks, selectedDate]
  );

  const handleCreateTask = async ({ title, description }) => {
    try {
      const newTask = await createTask({
        user_id: user.id,
        title,
        description,
        target_date: selectedDate,
      });
      setAllTasks((prev) => [...prev, newTask]);
    } catch (e) {
      console.warn('Create task failed:', e.message);
    }
  };

  const handleToggle = async (task) => {
    setAllTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t
      )
    );
    try {
      await toggleTaskStatus(task.id, task.status);
    } catch (e) {
      loadTasks(); // revert on failure
    }
  };

  const handleDelete = async (id) => {
    setAllTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTask(id);
    } catch (e) {
      loadTasks();
    }
  };

  const renderTask = ({ item }) => (
    <View style={styles.taskRow}>
      <TouchableOpacity onPress={() => handleToggle(item)} style={styles.checkbox}>
        <Ionicons
          name={item.status === 'completed' ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={item.status === 'completed' ? '#4f46e5' : '#c7c7cc'}
        />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={[styles.taskTitle, item.status === 'completed' && styles.taskDone]}>
          {item.title}
        </Text>
        {!!item.description && <Text style={styles.taskDesc}>{item.description}</Text>}
      </View>
      <TouchableOpacity onPress={() => handleDelete(item.id)}>
        <Ionicons name="trash-outline" size={20} color="#c7c7cc" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Calendar
        current={selectedDate}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        theme={{
          todayTextColor: '#4f46e5',
          arrowColor: '#4f46e5',
          selectedDayBackgroundColor: '#4f46e5',
          dotColor: '#4f46e5',
        }}
      />

      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>Tasks — {selectedDate}</Text>
        <TouchableOpacity onPress={() => sheetRef.current?.expand()} style={styles.addButton}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={dayTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tasks for this day. Tap + to add one.</Text>
        }
      />

      <TaskBottomSheet ref={sheetRef} selectedDate={selectedDate} onCreate={handleCreateTask} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listHeaderText: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  addButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9fb',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  checkbox: { marginRight: 10 },
  taskTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  taskDone: { textDecorationLine: 'line-through', color: '#a1a1aa' },
  taskDesc: { fontSize: 13, color: '#8e8e93', marginTop: 2 },
  emptyText: { textAlign: 'center', color: '#a1a1aa', marginTop: 30, fontSize: 14 },
});