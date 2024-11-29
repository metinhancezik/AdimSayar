import { StyleSheet } from 'react-native';

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
  calories: {
    fontSize: 20,
    color: '#4CAF50',
    marginTop: 10,
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

export default styles;  // 👈 default export olarak değiştirdik