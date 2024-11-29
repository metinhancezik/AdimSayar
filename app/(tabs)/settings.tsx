import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

interface UserSettings {
  weight: string;
  height: string;
  age: string;
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<UserSettings>({
    weight: '70',
    height: '170',
    age: '30',
  });

  const saveSettings = () => {
    // Ayarları kaydet
    console.log('Settings saved:', settings);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ayarlar</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Kilo (kg)</Text>
          <TextInput
            style={styles.input}
            value={settings.weight}
            onChangeText={(text) => setSettings({...settings, weight: text})}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Boy (cm)</Text>
          <TextInput
            style={styles.input}
            value={settings.height}
            onChangeText={(text) => setSettings({...settings, height: text})}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Yaş</Text>
          <TextInput
            style={styles.input}
            value={settings.age}
            onChangeText={(text) => setSettings({...settings, age: text})}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={saveSettings}>
          <Text style={styles.buttonText}>Kaydet</Text>
        </TouchableOpacity>
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
    form: {
      padding: 20,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      marginBottom: 5,
      color: '#666',
    },
    input: {
      borderWidth: 1,
      borderColor: '#ddd',
      padding: 10,
      borderRadius: 5,
      fontSize: 16,
    },
    button: {
      backgroundColor: '#2196F3',
      padding: 15,
      borderRadius: 5,
      alignItems: 'center',
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });