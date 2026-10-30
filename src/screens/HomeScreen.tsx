import { useNavigation } from '@react-navigation/native';
import { StyleSheet, View, ScrollView, Text, FlatList, Pressable, Alert } from 'react-native';
import { DataItem, DRAFT_KEY, storage } from '../Storage';
import { useMMKVString } from 'react-native-mmkv';
import { useLayoutEffect, useMemo, useState } from 'react';
import { HabitCard } from '../components/HabitCard';

// Вспомогательная функция для получения сегодняшней даты в формате YYYY-MM-DD
const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

type FilterType = 'all' | 'completed' | 'uncompleted';

export default function HomeScreen() {
  const navigation = useNavigation();

  const [recordsString, setRecordsString] = useMMKVString(DRAFT_KEY, storage);



    const toggleToday = (id: string) => {
    const today = getTodayString();
    
    const updatedRecords = records.map(record => {
      if (record.id === id) {
        // Проверяем, есть ли уже сегодняшняя дата в списке выполненных
        const isCompletedToday = record.completedDates?.includes(today);
        
        let newCompletedDates;
        if (isCompletedToday) {
          // Если есть — убираем (снимаем отметку)
          newCompletedDates = record.completedDates.filter(date => date !== today);
        } else {
          // Если нет — добавляем (отмечаем выполненным)
          // Если массив undefined (старые записи), создаем новый
          newCompletedDates = [...(record.completedDates || []), today];
        }

        return { ...record, completedDates: newCompletedDates };
      }
      return record;
    });

    // Сохраняем обновленный список обратно в MMKV
    setRecordsString(JSON.stringify(updatedRecords));
  };

    const handleDelete = (id: string) => {
    Alert.alert(
      'Удалить привычку?',
      'Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: () => {
            const updated = records.filter(r => r.id !== id);
            setRecordsString(JSON.stringify(updated));
          }
        }
      ]
    );
  };

  const handleEdit = (id: string) => {

  };

  const today = getTodayString();

  const [filter, setFilter] = useState<FilterType>('all'); // Состояние фильтра
    // 1. Устанавливаем кнопку в Header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable 
          onPress={() => {
            // Переключаем фильтр по кругу
            setFilter(prev => {
              if (prev === 'all') return 'completed';
              if (prev === 'completed') return 'uncompleted';
              return 'all';
            });
          }}
          style={{ marginRight: 16, padding: 4 }}
        >
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#007AFF' }}>
            {filter === 'all' ? '📋 Все' : filter === 'completed' ? '✅ Вып.' : '⭕ Невып.'}
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, filter]);

  const records: DataItem[] = useMemo(() => {
    return recordsString ? JSON.parse(recordsString) : [];
  }, [recordsString]);

  // 2. Фильтруем записи перед отображением
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const isCompletedToday = record.completedDates?.includes(today);
      if (filter === 'completed') return isCompletedToday;
      if (filter === 'uncompleted') return !isCompletedToday;
      return true; // 'all'
    });
  }, [records, filter, today]);

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          // Проверяем, выполнена ли привычка сегодня
          const isCompletedToday = item.completedDates?.includes(today);

          return (
                        <HabitCard 
              item={item}
              isCompletedToday={isCompletedToday}
              onToggleToday={toggleToday}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>Записей пока нет</Text>}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  listContainer: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  // ... (остальные стили цвета, эмодзи и кнопки)
  checkButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  cardEmoji: { fontSize: 24, marginRight: 12 },
  cardTitle: { fontSize: 16, fontWeight: '500', flexShrink: 1 },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  // Стили для кнопки выполнения
  checkButtonActive: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  checkButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  empty: { textAlign: 'center', color: '#999', marginTop: 50 },
    actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Расстояние между кнопками
  },
  iconButton: {
    padding: 4,
  },
  iconText: {
    fontSize: 18,
  },
});