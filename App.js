import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Accelerometer } from 'expo-sensors';

export default function App() {
  const [steps, setSteps] = useState(0);
  const [{ x, y, z }, setData] = useState({ x: 0, y: 0, z: 0 });
  const [subscription, setSubscription] = useState(null);
  const [lastY, setLastY] = useState(0);
  const threshold = 1.2; // Adım algılama hassasiyeti

  const _subscribe = () => {
    setSubscription(
      Accelerometer.addListener(accelerometerData => {
        setData(accelerometerData);
        
        // Adım algılama algoritması
        const currentY = accelerometerData.y;
        if (Math.abs(currentY - lastY) > threshold) {
          setSteps(prevSteps => prevSteps + 1);
        }
        setLastY(currentY);
      })
    );
    
    // Sensör verilerini her 100ms'de bir güncelle
    Accelerometer.setUpdateInterval(100);
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Adım Sayar</Text>
      </View>

      <View style={styles.counterContainer}>
        <Text style={styles.stepCount}>{steps}</Text>
        <Text style={styles.label}>Adım</Text>
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