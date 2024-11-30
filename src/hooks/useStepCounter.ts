import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyData, StepHistory } from '../types';

// Sabit değerler
const THRESHOLD = 1.2;
const MIN_TIME_BETWEEN_STEPS = 400;
const CALORIES_PER_STEP = 0.04;
const HISTORY_KEY = 'stepHistory';

export const useStepCounter = () => {
  // State tanımlamaları
  const [steps, setSteps] = useState<number>(0);
  const [calories, setCalories] = useState<number>(0);
  const [lastY, setLastY] = useState<number>(0);
  const [lastStepTime, setLastStepTime] = useState<number>(0);
  const [history, setHistory] = useState<StepHistory>([]);

  // Kalori hesaplama
  const calculateCalories = useCallback((stepCount: number) => {
    setCalories(Number((stepCount * CALORIES_PER_STEP).toFixed(1)));
  }, []);

  // Geçmiş verileri yükleme
  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem(HISTORY_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.log('Geçmiş yükleme hatası:', error);
    }
  };

  // Günlük veriyi geçmişe kaydetme
  const saveToHistory = async () => {
    try {
      const today = new Date().toDateString();
      const newHistory = history.filter(item => item.date !== today);
      
      newHistory.push({
        date: today,
        steps,
        calories
      });

      // Son 30 günü tut
      const last30Days = newHistory.slice(-30);
      
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(last30Days));
      setHistory(last30Days);
    } catch (error) {
      console.log('Geçmiş kaydetme hatası:', error);
    }
  };

  // Verileri yükleme effect'i
  useEffect(() => {
    loadHistory();
  }, []);

  // Verileri kaydetme effect'i
  useEffect(() => {
    if (steps > 0) {
      saveToHistory();
    }
  }, [steps, calories]);

  // Sensör işlemleri
  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const startAccelerometer = async () => {
      try {
        if (Platform.OS === 'web') {
          Alert.alert('Uyarı', 'Bu özellik sadece mobil cihazlarda çalışır');
          return;
        }

        await Accelerometer.setUpdateInterval(100);
        
        subscription = Accelerometer.addListener(accelerometerData => {
          const currentY = accelerometerData.y;
          const now = Date.now();
          
          // Hareket algılama
          const magnitudeY = Math.abs(currentY - lastY);
          const magnitudeTotal = Math.sqrt(
            Math.pow(accelerometerData.x, 2) + 
            Math.pow(accelerometerData.y, 2) + 
            Math.pow(accelerometerData.z, 2)
          );
          
          if (magnitudeY > THRESHOLD && 
              magnitudeTotal > THRESHOLD * 1.3 && 
              (now - lastStepTime) > MIN_TIME_BETWEEN_STEPS) {
            
            setSteps(prevSteps => {
              const newSteps = prevSteps + 1;
              calculateCalories(newSteps);
              return newSteps;
            });
            
            setLastStepTime(now);
          }
          setLastY(currentY);
        });
      } catch (error) {
        console.log('Sensör hatası:', error);
      }
    };

    startAccelerometer();
    return () => subscription?.remove();
  }, [lastY, steps, lastStepTime, calculateCalories]);

  return {
    steps,
    calories,
    history
  };
};