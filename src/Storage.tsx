import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV();
export const DRAFT_KEY  = "user_draft_data";

export type DataItem = {
    id: string;        // Уникальный ID (например, время создания)
    title: string;
    emoji: string | null;
    color: string | null;
    createdAt: number;
    completedDates: string[];
};