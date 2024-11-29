import React from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/styles';  // 👈 Burada da değişti
import { SensorData as SensorDataType } from '../types';

interface Props {
  data: SensorDataType;
}

export const SensorData = ({ data }: Props) => {
  const { x, y, z } = data;
  
  return (
    <View style={styles.sensorData}>
      <Text style={styles.sensorTitle}>Hareket Verileri:</Text>
      <Text style={styles.sensorText}>İleri/Geri: {y.toFixed(2)}</Text>
      <Text style={styles.sensorText}>Sağ/Sol: {x.toFixed(2)}</Text>
      <Text style={styles.sensorText}>Yukarı/Aşağı: {z.toFixed(2)}</Text>
    </View>
  );
};