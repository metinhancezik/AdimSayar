import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { Accelerometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyData } from '../types';

const BACKGROUND_TASK_NAME = 'STEP_COUNTER_TASK';
const DAILY_DATA_KEY = 'dailyData';
const THRESHOLD = 1.2;
const MIN_TIME_BETWEEN_STEPS = 400;
const CALORIES_PER_STEP = 0.04;

let lastY = 0;
let lastStepTime = 0;
let currentSteps = 0;

// Background task tanımlama
TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
    // Mevcut verileri yükle
    const savedData = await AsyncStorage.getItem(DAILY_DATA_KEY);
    let currentData: DailyData = savedData ? JSON.parse(savedData) : {
      date: new Date().toDateString(),
      steps: 0,
      calories: 0
    };

    // Bugünün verisi değilse sıfırla
    const today = new Date().toDateString();
    if (currentData.date !== today) {
      currentData = {
        date: today,
        steps: 0,
        calories: 0
      };
      currentSteps = 0;
    }

    // Sensör dinlemeyi başlat
    await Accelerometer.setUpdateInterval(100);
    
    Accelerometer.addListener(accelerometerData => {
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
        
        currentSteps++;
        currentData.steps = currentSteps;
        currentData.calories = Number((currentSteps * CALORIES_PER_STEP).toFixed(1));
        
        // Verileri kaydet
        AsyncStorage.setItem(DAILY_DATA_KEY, JSON.stringify(currentData));
        
        lastStepTime = now;
      }
      lastY = currentY;
    });

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.log('Background task hatası:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Background task'ı kaydet
export async function registerBackgroundTask() {
  try {
    // Task'ı kaydet
    await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
      minimumInterval: 60, // 1 dakika
      stopOnTerminate: false, // Uygulama kapatıldığında devam et
      startOnBoot: true // Telefon açıldığında başlat
    });
    
    console.log('Background task başarıyla kaydedildi!');
  } catch (error) {
    console.log('Background task kayıt hatası:', error);
  }
}