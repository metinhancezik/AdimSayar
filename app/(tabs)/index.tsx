import React from 'react';
import { View } from 'react-native';
import { Header } from '../../src/components/Header';
import { StepCounter } from '../../src/components/StepCounter';
import { SensorData } from '../../src/components/SensorData';
import { useStepCounter } from '../../src/hooks/useStepCounter';
import styles from '../../src/styles/styles';  // 👈 { styles } yerine styles

export default function HomeScreen() {
  const { steps, calories, sensorData } = useStepCounter();

  return (
    <View style={styles.container}>
      <Header />
      <StepCounter steps={steps} calories={calories} />
      <SensorData data={sensorData} />
    </View>
  );
}