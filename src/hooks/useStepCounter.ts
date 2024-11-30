import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform, NativeModules, NativeEventEmitter } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  DailyData, 
  StepHistory, 
  StepCounterHook, 
  AccelerometerData,
  StepCounterError 
} from '../types';

const { StepCounterModule } = NativeModules;

// Sabit değerler
const CONSTANTS = {
  THRESHOLD: 1.2,
  MIN_TIME_BETWEEN_STEPS: 400,
  CALORIES_PER_STEP: 0.04,
  STORAGE_KEYS: {
    HISTORY: 'stepHistory',
    DAILY_DATA: 'dailyData'
  },
  ACCELEROMETER_INTERVAL: 100,
  MAX_HISTORY_DAYS: 30
} as const;

export const useStepCounter = (): StepCounterHook => {
  // State tanımlamaları
  const [steps, setSteps] = useState<number>(0);
  const [calories, setCalories] = useState<number>(0);
  const [lastY, setLastY] = useState<number>(0);
  const [lastStepTime, setLastStepTime] = useState<number>(0);
  const [history, setHistory] = useState<StepHistory>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Hata yönetimi
  const handleError = useCallback((error: unknown, context: string) => {
    const stepError: StepCounterError = {
      code: 'STEP_COUNTER_ERROR',
      message: error instanceof Error ? error.message : 'Bilinmeyen hata',
      details: { context, error }
    };
    console.error(stepError);
    return stepError;
  }, []);

  // Widget güncelleme
  const updateWidget = useCallback(async (data: DailyData) => {
    if (Platform.OS === 'android') {
      try {
        await Promise.all([
          AsyncStorage.setItem(CONSTANTS.STORAGE_KEYS.DAILY_DATA, JSON.stringify(data)),
          StepCounterModule.updateWidget(data.steps, data.calories)
        ]);
      } catch (error) {
        handleError(error, 'updateWidget');
      }
    }
  }, [handleError]);

  // Kalori hesaplama
  const calculateCalories = useCallback((stepCount: number) => {
    const newCalories = Number((stepCount * CONSTANTS.CALORIES_PER_STEP).toFixed(1));
    setCalories(newCalories);
    return newCalories;
  }, []);

  // Adım sayısı güncelleme
  const updateStepCount = useCallback((newSteps: number) => {
    setSteps(newSteps);
    const newCalories = calculateCalories(newSteps);
    
    const dailyData: DailyData = {
      date: new Date().toDateString(),
      steps: newSteps,
      calories: newCalories
    };
    
    updateWidget(dailyData);
  }, [calculateCalories, updateWidget]);

  // Geçmiş verileri yükleme
  const loadHistory = useCallback(async () => {
    try {
      const [savedHistory, savedDailyData] = await Promise.all([
        AsyncStorage.getItem(CONSTANTS.STORAGE_KEYS.HISTORY),
        AsyncStorage.getItem(CONSTANTS.STORAGE_KEYS.DAILY_DATA)
      ]);

      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }

      if (savedDailyData) {
        const data: DailyData = JSON.parse(savedDailyData);
        const today = new Date().toDateString();
        
        if (data.date === today) {
          updateStepCount(data.steps);
        }
      }

      setIsInitialized(true);
    } catch (error) {
      handleError(error, 'loadHistory');
    }
  }, [updateStepCount, handleError]);

  // Geçmişe kaydetme
  const saveToHistory = useCallback(async () => {
    try {
      const today = new Date().toDateString();
      const newHistory = history.filter(item => item.date !== today);
      
      const dailyData: DailyData = {
        date: today,
        steps,
        calories
      };

      newHistory.push(dailyData);
      const last30Days = newHistory.slice(-CONSTANTS.MAX_HISTORY_DAYS);
      
      await AsyncStorage.setItem(CONSTANTS.STORAGE_KEYS.HISTORY, JSON.stringify(last30Days));
      setHistory(last30Days);
    } catch (error) {
      handleError(error, 'saveToHistory');
    }
  }, [history, steps, calories, handleError]);

  // Hareket algılama
  const detectMotion = useCallback((accelerometerData: AccelerometerData) => {
    const currentY = accelerometerData.y;
    const now = Date.now();
    
    const magnitudeY = Math.abs(currentY - lastY);
    const magnitudeTotal = Math.sqrt(
      Math.pow(accelerometerData.x, 2) + 
      Math.pow(accelerometerData.y, 2) + 
      Math.pow(accelerometerData.z, 2)
    );
    
    if (magnitudeY > CONSTANTS.THRESHOLD && 
        magnitudeTotal > CONSTANTS.THRESHOLD * 1.3 && 
        (now - lastStepTime) > CONSTANTS.MIN_TIME_BETWEEN_STEPS) {
      
      updateStepCount(steps + 1);
      setLastStepTime(now);
    }
    setLastY(currentY);
  }, [lastY, steps, lastStepTime, updateStepCount]);

  // Native modül event listener'ı
  useEffect(() => {
    if (Platform.OS === 'android') {
      const eventEmitter = new NativeEventEmitter(StepCounterModule);
      const subscription = eventEmitter.addListener(
        'onStepCountUpdate',
        (data: { steps: number, calories: number }) => {
          updateStepCount(data.steps);
        }
      );

      return () => subscription.remove();
    }
  }, [updateStepCount]);

  // İlk yükleme
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Veri kaydetme
  useEffect(() => {
    if (isInitialized && steps > 0) {
      saveToHistory();
    }
  }, [isInitialized, steps, saveToHistory]);

  // Sensör işlemleri
  useEffect(() => {
    if (Platform.OS === 'web') {
      Alert.alert('Uyarı', 'Bu özellik sadece mobil cihazlarda çalışır');
      return;
    }

    let subscription: { remove: () => void } | null = null;

    const startAccelerometer = async () => {
      try {
        await Accelerometer.setUpdateInterval(CONSTANTS.ACCELEROMETER_INTERVAL);
        subscription = Accelerometer.addListener(detectMotion);
      } catch (error) {
        handleError(error, 'startAccelerometer');
      }
    };

    startAccelerometer();
    return () => subscription?.remove();
  }, [detectMotion, handleError]);

  return {
    steps,
    calories,
    history
  };
};