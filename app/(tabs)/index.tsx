import React from 'react';
import { View, ScrollView } from 'react-native';
import { Header } from '../../src/components/Header';
import { StepCounter } from '../../src/components/StepCounter';
import { StatsScreen } from '../../src/components/StatsScreen';
import { useStepCounter } from '../../src/hooks/useStepCounter';
import styles from '../../src/styles/styles';

export default function HomeScreen() {
  const { steps, calories, history } = useStepCounter();

  return (
    <ScrollView style={styles.container}>
      <Header />
      <StepCounter steps={steps} calories={calories} />
      <StatsScreen history={history} />
    </ScrollView>
  );
}