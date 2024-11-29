import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SensorData, DailyData } from '../types';

// Sabit değerler
const THRESHOLD = 1.2;                    // Hassasiyeti azalttık
const MIN_TIME_BETWEEN_STEPS = 400;       // Süreyi arttırdık
const CALORIES_PER_STEP = 0.04;

export const useStepCounter = () => {
  // State tanımlamaları
  const [steps, setSteps] = useState<number>(0);
  const [calories, setCalories] = useState<number>(0);
  const [{ x, y, z }, setData] = useState<SensorData>({ x: 0, y: 0, z: 0 });
  const [lastY, setLastY] = useState<number>(0);
  const [lastStepTime, setLastStepTime] = useState<number>(0);

  // Kalori hesaplama fonksiyonunu useCallback ile sarmalıyoruz
  const calculateCalories = useCallback((stepCount: number) => {
    setCalories(Number((stepCount * CALORIES_PER_STEP).toFixed(1)));
  }, []);

  // Verileri yükleme
  const loadDailyData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('dailyData');
      if (savedData) {
        const data: DailyData = JSON.parse(savedData);
        const today = new Date().toDateString();
        
        if (data.date === today) {
          setSteps(data.steps);
          setCalories(data.calories);
        }
      }
    } catch (error) {
      console.log('Veri yükleme hatası:', error);
    }
  };

  // Verileri kaydetme
  const saveDailyData = async () => {
    try {
      const dailyData: DailyData = {
        steps,
        calories,
        date: new Date().toDateString()
      };
      await AsyncStorage.setItem('dailyData', JSON.stringify(dailyData));
    } catch (error) {
      console.log('Veri kaydetme hatası:', error);
    }
  };

  // Verileri yükleme effect'i
  useEffect(() => {
    loadDailyData();
  }, []);

  // Verileri kaydetme effect'i
  useEffect(() => {
    saveDailyData();
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

        await Accelerometer.setUpdateInterval(100);  // Güncelleme süresini arttırdık
        
        subscription = Accelerometer.addListener(accelerometerData => {
          setData(accelerometerData);
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
              magnitudeTotal > THRESHOLD * 1.3 &&    // Eşiği arttırdık
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
  }, [lastY, steps, lastStepTime, calculateCalories]);  // calculateCalories'i dependency'e ekledik

  return {
    steps,
    calories,
    sensorData: { x, y, z }
  };
};