import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function PreAssessment() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../assets/cute-doctor-mascot.png')}
          style={styles.mascot}
          resizeMode="contain"
        />
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>
            準備好知道你的評估結果了嗎?
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/risk-assessment')}
        >
          <Text style={styles.buttonText}>我準備好了</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mascot: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  messageBox: {
    backgroundColor: '#F0F7FF',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginBottom: 30,
  },
  messageText: {
    fontSize: 24,
    color: '#007AFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
}); 