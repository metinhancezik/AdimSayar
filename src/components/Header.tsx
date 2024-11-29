import React from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/styles';  // 👈 Burada da değişti

export const Header = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Adım Sayar</Text>
    </View>
  );
};