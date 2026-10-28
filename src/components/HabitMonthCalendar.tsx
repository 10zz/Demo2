import { View, Text, StyleSheet } from 'react-native';

interface HabitMonthCalendarProps {
  completedDates: string[];
  color: string | null;
}

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const HabitMonthCalendar = ({ completedDates = [], color }: HabitMonthCalendarProps) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-11

  // 1. Получаем первый день месяца и узнаем, какой это день недели (0 - Вс, 1 - Пн...)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  let startingDayOfWeek = firstDayOfMonth.getDay();
  // В России неделя начинается с понедельника, поэтому корректируем (0 - Вс становится 6)
  startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

  // 2. Узнаем количество дней в месяце
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // 3. Формируем массив ячеек календаря
  const calendarCells = [];
  
  // Добавляем пустые ячейки для выравнивания первого дня
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarCells.push({ type: 'empty', id: `empty-${i}` });
  }

  // Добавляем сами дни
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    calendarCells.push({
      type: 'day',
      dayNumber: day,
      id: dateString,
      isCompleted: completedDates.includes(dateString),
      isToday: day === today.getDate(),
    });
  }

  const activeColor = color || '#34C759';
  const monthName = today.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

  return (
    <View style={styles.container}>
      <Text style={styles.monthTitle}>{monthName}</Text>
      
      {/* Заголовки дней недели */}
      <View style={styles.weekHeader}>
        {WEEK_DAYS.map(day => (
          <Text key={day} style={styles.weekDayText}>{day}</Text>
        ))}
      </View>

      {/* Сетка дней */}
      <View style={styles.grid}>
        {calendarCells.map((cell) => {
          if (cell.type === 'empty') {
            return <View key={cell.id} style={styles.cell} />;
          }

          return (
            <View key={cell.id} style={styles.cell}>
              <View 
                style={[
                  styles.dayCircle,
                  cell.isCompleted && { backgroundColor: activeColor, borderColor: activeColor },
                  cell.isToday && !cell.isCompleted && styles.todayBorder
                ]}
              >
                <Text 
                  style={[
                    styles.dayText, 
                    cell.isCompleted && styles.completedDayText,
                    cell.isToday && !cell.isCompleted && styles.todayText
                  ]}
                >
                  {cell.dayNumber}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  monthTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.28%', // 100% / 7 дней
    aspectRatio: 1, // Квадратные ячейки
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  todayBorder: {
    borderColor: '#007AFF',
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  todayText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  completedDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});