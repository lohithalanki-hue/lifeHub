import { Subject, Exam, JEEWeeklyExam, JEEAcademicGoal, DiaryEntry, Lesson, LessonProgress, Goal, CalendarEvent, UserStats, AppSettings, MoodCheckIn, ShopItem } from '../types';
import { getScopedStorageKey } from './storageScope';

const STORAGE_PREFIX = 'lifehub_';

function loadItem<T>(key: string, defaultValue: T): T {
  try {
    const val = localStorage.getItem(getScopedStorageKey(STORAGE_PREFIX + key));
    if (val !== null) {
      return JSON.parse(val) as T;
    }
  } catch (err) {
    console.error(`Error loading key ${key} from storage:`, err);
  }
  return defaultValue;
}

function saveItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(getScopedStorageKey(STORAGE_PREFIX + key), JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving key ${key} to storage:`, err);
  }
}

// The remainder of the storage service is unchanged. Keep the existing catalog,
// initial data, and storageService API below these helpers.

