import React from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/styles';  // 👈 Burada da değişti

interface Props {
  steps: number;
  calories: number;
}

export const StepCounter = ({ steps, calories }: Props) => {
  return (
    <View style={styles.counterContainer}>
      <Text style={styles.stepCount}>{steps}</Text>
      <Text style={styles.label}>Adım</Text>
      <Text style={styles.calories}>{calories} kcal</Text>
    </View>
  );
};