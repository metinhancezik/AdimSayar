import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, NativeModules, Platform } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKGROUND_FETCH_TASK = 'background-fetch';
const STEPS_KEY = '@steps';
const CALORIES_FACTOR = 0.04; // Yaklaşık kalori hesaplama faktörü

// Widget güncelleme fonksiyonu
const updateWidget = async (steps) => {
  try {
    const calories = steps * CALORIES_FACTOR;
    if (Platform.OS === 'android') {
      await NativeModules.StepCounterModule.updateWidget(steps, calories);
    }
  } catch (error) {
    console.error('Widget güncelleme hatası:', error);
  }
};

// Arka plan görevi tanımlama
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const stepsStr = await AsyncStorage.getItem(STEPS_KEY);
    const steps = parseInt(stepsStr) || 0;
    await updateWidget(steps);
    return BackgroundFetch.Result.NewData;
  } catch (error) {
    return BackgroundFetch.Result.Failed;
  }
});

export default function App() {
  const [steps, setSteps] = useState(0);
  const [{ x, y, z }, setData] = useState({ x: 0, y: 0, z: 0 });
  const [subscription, setSubscription] = useState(null);
  const [lastY, setLastY] = useState(0);
  const threshold = 1.2;

  // Adım sayısını kaydet ve widget'ı güncelle
  const saveAndUpdateSteps = async (newSteps) => {
    try {
      await AsyncStorage.setItem(STEPS_KEY, newSteps.toString());
      await updateWidget(newSteps);
    } catch (error) {
      console.error('Adım kaydetme hatası:', error);
    }
  };

  const _subscribe = () => {
    setSubscription(
      Accelerometer.addListener(accelerometerData => {
        setData(accelerometerData);
        
        const currentY = accelerometerData.y;
        if (Math.abs(currentY - lastY) > threshold) {
          const newSteps = steps + 1;
          setSteps(newSteps);
          saveAndUpdateSteps(newSteps);
        }
        setLastY(currentY);
      })
    );
    
    Accelerometer.setUpdateInterval(100);
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  // Arka plan görevini kaydet
  const registerBackgroundTask = async () => {
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 15 * 60, // 15 dakika
        stopOnTerminate: false,
        startOnBoot: true,
      });
    } catch (error) {
      console.error('Arka plan görevi kayıt hatası:', error);
    }
  };

  useEffect(() => {
    // Kaydedilmiş adım sayısını yükle
    const loadSavedSteps = async () => {
      try {
        const savedSteps = await AsyncStorage.getItem(STEPS_KEY);
        if (savedSteps) {
          setSteps(parseInt(savedSteps));
        }
      } catch (error) {
        console.error('Adım yükleme hatası:', error);
      }
    };

    loadSavedSteps();
    _subscribe();
    registerBackgroundTask();

    return () => {
      _unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Adım Sayar</Text>
      </View>

      <View style={styles.counterContainer}>
        <Text style={styles.stepCount}>{steps}</Text>
        <Text style={styles.label}>Adım</Text>
        <Text style={styles.calories}>
          {(steps * CALORIES_FACTOR).toFixed(1)} kcal
        </Text>
      </View>

      <View style={styles.sensorData}>
        <Text style={styles.sensorTitle}>Hareket Verileri:</Text>
        <Text style={styles.sensorText}>İleri/Geri: {y.toFixed(2)}</Text>
        <Text style={styles.sensorText}>Sağ/Sol: {x.toFixed(2)}</Text>
        <Text style={styles.sensorText}>Yukarı/Aşağı: {z.toFixed(2)}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  counterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  stepCount: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  label: {
    fontSize: 24,
    color: '#666',
  },
  sensorData: {
    margin: 20,
    padding: 20,
    backgroundColor: '#eee',
    borderRadius: 10,
  },
  sensorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sensorText: {
    fontSize: 16,
    marginVertical: 5,
  },
});