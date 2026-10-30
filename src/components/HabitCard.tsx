import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { DataItem } from '../storage';
import { HabitMonthCalendar } from './HabitMonthCalendar';

interface HabitCardProps {
  item: DataItem;
  isCompletedToday: boolean;
  onToggleToday: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const HabitCard = ({ 
    item, 
    isCompletedToday, 
    onToggleToday, onEdit, 
    onDelete }: HabitCardProps) => {
        // Локальное состояние для скрытия/раскрытия календаря
        const [isExpanded, setIsExpanded] = useState(false);

        return (
            <View style={styles.card}>
              {/* Левая часть: цвет, эмодзи, название */}
              <View style={styles.cardTopRow}>
                <View style={styles.cardInfo}>
                  <View style={[styles.colorDot, { backgroundColor: item.color || '#ccc' }]} />
                  <Text style={styles.cardEmoji}>{item.emoji || '📝'}</Text>
                  <Text style={[styles.cardTitle, isCompletedToday && styles.completedTitle]}>
                    {item.title}
                  </Text>
                </View>

                {/* Блок с кнопками действий */}
                <View style={styles.actionButtons}>
                  <Pressable onPress={() => onDelete(item.id)} style={styles.iconButton}>
                    <Text style={styles.iconText}>🗑️</Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => onToggleToday(item.id)}
                    style={[
                      styles.checkButton,
                      isCompletedToday && { backgroundColor: item.color || '#34C759', borderColor: item.color || '#34C759' }
                    ]}
                  >
                    <Text style={styles.checkButtonText}>{isCompletedToday ? '✓' : ''}</Text>
                  </Pressable>
                </View>
              </View>

              {/* Кнопка для скрытия/раскрытия календаря */}
      <Pressable 
        style={styles.expandButton} 
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.expandButtonText}>
          {isExpanded ? 'Скрыть календарь ▲' : 'Показать календарь ▼'}
        </Text>
      </Pressable>

      {/* Сам календарь, который рендерится только если isExpanded === true */}
      {isExpanded && (
        <HabitMonthCalendar completedDates={item.completedDates || []} color={item.color} />
      )}
      </View>
        );
    };

const styles = StyleSheet.create({
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
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  cardEmoji: { fontSize: 24, marginRight: 12 },
  cardTitle: { fontSize: 16, fontWeight: '500', flexShrink: 1 },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: { padding: 4 },
  iconText: { fontSize: 18 },
  checkButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  checkButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  
  // Стили для кнопки раскрытия
  expandButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  expandButtonText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
});