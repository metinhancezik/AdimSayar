import React from 'react';
import { View, Text, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { StepHistory } from '../types';
import styles from '../styles/styles';

interface Props {
  history: StepHistory;
}

export const StatsScreen: React.FC<Props> = ({ history }) => {
  // Son 7 günün verilerini al
  const last7Days = history.slice(-7).reverse();
  
  // Grafik verilerini hazırla
  const chartData = {
    labels: last7Days.length > 0 
      ? last7Days.map(item => {
          const date = new Date(item.date);
          return date.getDate().toString(); // Sadece günün sayısını göster
        })
      : ['0'], // Veri yoksa '0' göster
    datasets: [{
      data: last7Days.length > 0 
        ? last7Days.map(item => item.steps)
        : [0], // Veri yoksa 0 göster
      color: (opacity = 1) => `rgba(71, 136, 255, ${opacity})`,
      strokeWidth: 2
    }]
  };

  // İstatistikleri hesapla
  const averageSteps = last7Days.length > 0
    ? Math.round(last7Days.reduce((acc, cur) => acc + cur.steps, 0) / last7Days.length)
    : 0;

  const maxSteps = last7Days.length > 0
    ? Math.max(...last7Days.map(item => item.steps))
    : 0;

  const totalCalories = last7Days.length > 0
    ? last7Days.reduce((acc, cur) => acc + cur.calories, 0)
    : 0;

  return (
    <ScrollView style={styles.statsContainer}>
      <Text style={styles.statsTitle}>Son 7 Günlük İstatistikler</Text>
      
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 40}
        height={220}
        yAxisLabel=""
        yAxisSuffix=" adım"
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#4788ff'
          }
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
      />

      <View style={styles.statsInfoContainer}>
        <View style={styles.statsInfoItem}>
          <Text style={styles.statsInfoLabel}>Günlük Ortalama</Text>
          <Text style={styles.statsInfoValue}>{averageSteps} adım</Text>
        </View>

        <View style={styles.statsInfoItem}>
          <Text style={styles.statsInfoLabel}>En Yüksek</Text>
          <Text style={styles.statsInfoValue}>{maxSteps} adım</Text>
        </View>

        <View style={styles.statsInfoItem}>
          <Text style={styles.statsInfoLabel}>Toplam Kalori</Text>
          <Text style={styles.statsInfoValue}>{totalCalories.toFixed(1)} kcal</Text>
        </View>
      </View>
    </ScrollView>
  );
};