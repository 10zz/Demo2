import { StyleSheet, View, ScrollView, Text, TextInput, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import EmojiPicker from 'react-native-emoji-chooser';
import { useMMKVObject } from 'react-native-mmkv';
import { DataItem, DRAFT_KEY, storage } from '../Storage';

const COLORS = [
  '#FF3B30', // Красный
  '#FF9500', // Оранжевый
  '#FFCC00', // Желтый
  '#4CD964', // Зеленый
  '#5AC8FA', // Голубой
  '#007AFF', // Синий
  '#5856D6', // Фиолетовый
  '#FF2D55', // Розовый
  '#8E8E93', // Серый
  '#000000', // Черный
];

export default function CreateScreen() {
    const navigation = useNavigation();

    const [title, setTitle] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
    const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState<boolean>(false);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);


    // Обработчик выбора эмодзи.
    const handleSelectEmoji = (emoji: string) => {
        setSelectedEmoji(emoji);
        setIsEmojiPickerVisible(false); // Скрываем селектор после выбора
    };

    // Функция для отмены выбора
    const handleClearEmoji = () => {
        setSelectedEmoji(null);
        setIsEmojiPickerVisible(false);
    };

    // Функция сохранения
    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert('Ошибка', 'Введите название');
            return;
        }

        // 1. Получаем текущий список из MMKV
        const existingRecordsString = storage.getString(DRAFT_KEY);
        const existingRecords: DataItem[] = existingRecordsString 
        ? JSON.parse(existingRecordsString) 
        : [];

        // 2. Создаем новую запись
        const newRecord: DataItem = {
            id: Date.now().toString(), // Уникальный ID на основе времени
            title: title,
            emoji: selectedEmoji,
            color: selectedColor,
            createdAt: Date.now(),
            completedDates: [],
        };

        // 3. Добавляем в список и сохраняем обратно
        const updatedRecords = [...existingRecords, newRecord];
        storage.set(DRAFT_KEY, JSON.stringify(updatedRecords));

        setTitle('');
        setSelectedEmoji(null);
        setSelectedColor(null);
        navigation.goBack();
    };

  return (
    <SafeAreaView style={styles.container}>
        <TextInput 
          placeholder='Название'
          value={title}
          onChangeText={setTitle}
          style={styles.titleInput}
        />

        {/* Кнопка эмодзи */}
        <View style={styles.emojiContainer}>
          <Pressable 
            style={styles.emojiButton} 
            onPress={() => setIsEmojiPickerVisible(!isEmojiPickerVisible)}>
                {selectedEmoji ? (
                <Text style={styles.emojiDisplay}>{selectedEmoji}</Text>
                ) : (
                <Text style={styles.emojiButtonText}>Выбрать эмодзи</Text>
                )}
          </Pressable>

        {/* Кнопка отмены выбора эмодзи. Появляется только если эмодзи выбран */}
          {selectedEmoji && (
            <Pressable style={styles.clearButton} onPress={handleClearEmoji}>
              <Text style={styles.clearButtonText}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Селектор эмодзи*/}
        {isEmojiPickerVisible && (
          <View style={styles.emojiPickerContainer}>
            <EmojiPicker
              onSelect={handleSelectEmoji}
              mode="light"
              lang="en"
              columnCount={8}
            />
          </View>
        )}


      <View style={styles.colorPickHeader}>
        <Text style={styles.colorPickHeaderText}>Цвет:</Text>
        
        {/* Отображение выбранного цвета и кнопка сброса */}
          {selectedColor ? (
            <>
              <View style={[styles.colorPreview, { backgroundColor: selectedColor }]} />
              <Pressable onPress={() => setSelectedColor(null)} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>✕</Text>
              </Pressable>
            </>
          ) : (
            <Text style={styles.colorClearButtonPlaceholderText}>Не выбран</Text>
          )}
      </View>

      {/* Горизонтальный скролл с цветами */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.colorScroll}
      >
        {COLORS.map((color) => {
          const isSelected = selectedColor === color;
          return (
            <Pressable
              key={color}
              onPress={() => setSelectedColor(color)}
              style={[
                styles.colorItemButton,
                { backgroundColor: color },
                isSelected && styles.colorItemButtonSelectedBorder,
              ]}
            />
          );
        })}
      </ScrollView>

        <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Сохранить запись</Text>
        </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    margin: 10,
  },
  // Стили для секции выбора эмодзи.
  emojiContainer: {
    position: 'relative',
    height: 120,
  },
  emojiButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    margin: 10
  },
  emojiButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  emojiDisplay: {
    fontSize: 48,
  },
  emojiPickerContainer: {
    flex: 1,
    borderWidth: 5,
    borderColor: '#200707',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  // Стили для кнопок отмены выбора.
  clearButton: {
    position: 'absolute',
    right: 0,
    backgroundColor: '#ff3b30',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Стили для секции выбора цвета.
  colorPickHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    justifyContent: 'space-between',
  },
  colorPickHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  colorClearButtonPlaceholderText: {
    color: '#999',
    fontSize: 14,
  },
  colorPreview: {
    width: 124,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  colorScroll: {
    padding: 5,
    gap: 12,
    paddingVertical: 8,
  },
  // Круглые кнопки выбора цвета.
  colorItemButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  // Обводка кнопки кнопки выбора цвета при нажатии.
    colorItemButtonSelectedBorder: {
        borderWidth: 3,
        borderColor: '#007AFF',
        transform: [{ scale: 1.1 }],
    },
    saveButton: { 
        backgroundColor: '#34C759', 
        padding: 16, 
        borderRadius: 12, 
        alignItems: 'center', 
        marginTop: 20 
    },
    saveButtonText: { 
        color: '#fff', 
        fontSize: 16, 
        fontWeight: 'bold' 
    },
});