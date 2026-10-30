import { useNavigation } from '@react-navigation/native';
import { StyleSheet, View, Text, FlatList, Pressable, Alert } from 'react-native';
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

export default function HomeScreen() {
  // Хук для методов навигации между экранами.
  const navigation = useNavigation();
  // Сегодняшняя дата.
  const today = getTodayString();

  const [recordsString, setRecordsString] = useMMKVString(DRAFT_KEY, storage);
  // Обновляем хранилище данных пользователя при каждом вызове setRecordsString.
  const records: DataItem[] = useMemo(() => {
    return recordsString ? JSON.parse(recordsString) : [];
  }, [recordsString]);

  // Обработчики кнопок ---------------------------------------------------------------------------
  // Обработчик кнопки переключения выполнения привычки.
  const handleToggle = (id: string) => {
    const updatedRecords = records.map(record => {
      // Ищем запись по ID в хранилище данных пользователя.
      if (record.id === id) {
        // Проверяем, есть ли уже сегодняшняя дата в списке выполненных.
        const isCompletedToday = record.completedDates?.includes(today);
        
        let newCompletedDates;
        // Если есть — убираем (снимаем отметку).
        // Генерируем новый массив дней с отметками без сегодняшней даты.
        if (isCompletedToday) {
          newCompletedDates = record.completedDates.filter(date => date !== today);
        // Если нет — добавляем (отмечаем выполненным).
        // Генерируем новый или Добавляем в старый массив дней с отметками сегодняшнюю дату.
        } else {
          newCompletedDates = [...(record.completedDates || []), today];
        }
        // После этого, возвращаем единичный элемент данных пользователя с обновлённым свойством 
        // completedDates (из которого исключена или в которое включена сегодняшняя дата).
        return { ...record, completedDates: newCompletedDates };
      }
      // Запись не найдена -> вернять исходную запись хранилища.
      return record;
    });

    // Сохраняем обновленный список обратно в MMKV.
    setRecordsString(JSON.stringify(updatedRecords));
  };

  // Обработчик кнопки "Удалить".
  const handleDelete = (id: string) => {
    Alert.alert(
      'Удалить привычку?',
      'Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', style: 'destructive',
          onPress: () => {
            // Генерируем новое хранилище на основе старого, где ID записей не равны удаляемой.
            const updated = records.filter(r => r.id !== id); 
            // Сохраняем обновленное хранилище обратно в MMKV.
            setRecordsString(JSON.stringify(updated));
          }
        }
      ]
    );
  };

  // TODO: Обработчик кнопки "Редактировать".
  const handleEdit = (id: string) => {};

  // Кнопка фильтрации.
  type FilterType = 'all' | 'completed' | 'uncompleted'; // Список возможных положений фильтра.
  const [filterPosition, setFilterPosition] = useState<FilterType>('all'); // Положение фильтра.

  // Добавляем кнопку в Header справа хуком useLayoutEffect 
  // (позволяет вставить кнопку в Navigation до отрисовки экрана).
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable 
          onPress={() => {
            // Переключаем фильтр по кругу
            setFilterPosition(prev => {
              if (prev === 'all') return 'completed';
              if (prev === 'completed') return 'uncompleted';
              return 'all';
            });
          }}
          style = {styles.filterButton}
        >
          <Text style = {styles.filterButtonText}>
            {filterPosition === 'all' ? '📋 Все' : filterPosition === 'completed' ? '✅ Вып.' : '⭕ Невып.'}
          </Text>
        </Pressable>
      ),
    });
  // Зависимость filterPosition и navigation нужна, чтобы кнопка обновляла свой текст при каждом клике.
  }, [navigation, filterPosition]);

  // Фильтрует каждый элемент хранилища по списку выполненых дат и возвращает отфильтрованное 
  // хранилище в filteredRecords.
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const isCompletedToday = record.completedDates?.includes(today);
      if (filterPosition === 'completed') return isCompletedToday;
      if (filterPosition === 'uncompleted') return !isCompletedToday;
      return true;        // 'all'
    });
  // Триггеры:
  // 1. Изменение хранилища (удаление/добавление привычки);
  // 2. Изменение положения фильтра;
  // 3. Изменение сегодняшней даты (перезапуск приложения?).
  }, [records, filterPosition, today]);

  // Основная разметка ----------------------------------------------------------------------------
  return (
    <View style = {styles.mainContainer}>
      {/* Тот же самый ScrollView, но рендерит только элементы, которые видны на экарне*/}
      <FlatList
        data =         {filteredRecords}  // Откуда брать данные для рендера.
        keyExtractor = {item => item.id}  // Из какого поля извлекать каждый уникальный ключ для каждого элемента массива item.
        renderItem =   {({ item }) => {   // Функция, определяющая, как отображать каждый элемент массива item.
          const isCompletedToday = item.completedDates?.includes(today);
          return (
            <HabitCard 
              item =              {item}
              isCompletedToday =  {isCompletedToday}
              onToggleToday =     {handleToggle}
              onEdit =            {handleEdit}
              onDelete =          {handleDelete}
            />
          );
        }}
        ListEmptyComponent = {            // Что рендерить при пустом item.
          <Text style = {styles.listContainerEmptyText}>Записей пока нет</Text>
        } 
        contentContainerStyle = {styles.listContainer}
      />
    </View>
  );
}

// Стили ------------------------------------------------------------------------------------------
const styles = StyleSheet.create({
  // Самый верхний контейнер.
  mainContainer: { 
    flex: 1, 
    //backgroundColor: '#f9f9f9' 
  },
  // Прокручиваемый контейнер.
  listContainer: { 
    padding: 16 
  },
  // Текст при отсутствии отображаемых элементов.
  listContainerEmptyText: { 
    textAlign: 'center', 
    color: '#999', 
  },
  // Кнопка фильтра.
  filterButton: {
    marginRight: 16, 
    padding: 4
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: 'bold', 
    color: '#007AFF'
  }
});