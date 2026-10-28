import { useNavigation } from '@react-navigation/native';
import { StyleSheet, View, ScrollView, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DataItem, DRAFT_KEY, storage } from '../Storage';
import { useMMKVString } from 'react-native-mmkv';
import { useMemo } from 'react';

// Вспомогательная функция для получения сегодняшней даты в формате YYYY-MM-DD
const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function HomeScreen() {
  const navigation = useNavigation();

  const [recordsString, setRecordsString] = useMMKVString(DRAFT_KEY, storage);

  const records: DataItem[] = useMemo(() => {
    return recordsString ? JSON.parse(recordsString) : [];
  }, [recordsString]);

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

  const today = getTodayString();

  return (
    <View style={styles.container}>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          // Проверяем, выполнена ли привычка сегодня
          const isCompletedToday = item.completedDates?.includes(today);

          return (
            <View style={styles.card}>
              {/* Левая часть: цвет, эмодзи, название */}
              <View style={styles.cardInfo}>
                <View style={[styles.colorDot, { backgroundColor: item.color || '#ccc' }]} />
                <Text style={styles.cardEmoji}>{item.emoji || '📝'}</Text>
                <Text style={[styles.cardTitle, isCompletedToday && styles.completedTitle]}>
                  {item.title}
                </Text>
              </View>

              {/* Правая часть: кнопка-чекбокс */}
              <Pressable 
                onPress={() => toggleToday(item.id)}
                style={[
                  styles.checkButton,
                  isCompletedToday && styles.checkButtonActive
                ]}
              >
                <Text style={styles.checkButtonText}>
                  {isCompletedToday ? '✓' : ''}
                </Text>
              </Pressable>
            </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Раздвигаем инфо и кнопку
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
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Занимает все доступное место
  },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  cardEmoji: { fontSize: 24, marginRight: 12 },
  cardTitle: { fontSize: 16, fontWeight: '500', flexShrink: 1 },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  // Стили для кнопки выполнения
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
});