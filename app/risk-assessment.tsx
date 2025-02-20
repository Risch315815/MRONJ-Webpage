import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { usePatientStore } from './store/patientData';
import { assessRisk } from './utils/riskAssessment';
import { generateAndSavePDF } from './utils/generatePDF';

export default function RiskAssessment() {
  const { patientData } = usePatientStore();
  const riskAssessments = assessRisk(patientData);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case '高風險': return '#FF3B30';
      case '中度風險': return '#FF9500';
      case '低風險': return '#34C759';
      default: return '#000000';
    }
  };

  const handleGeneratePDF = async () => {
    try {
      await generateAndSavePDF(patientData);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>風險評估結果</Text>

        {riskAssessments.map((assessment, index) => (
          <View key={index} style={styles.assessmentCard}>
            <Text style={styles.procedureTitle}>{assessment.procedure}</Text>
            <View style={[
              styles.riskBadge,
              { backgroundColor: getRiskColor(assessment.riskLevel) }
            ]}>
              <Text style={styles.riskText}>{assessment.riskLevel}</Text>
            </View>
            <Text style={styles.recommendation}>{assessment.recommendation}</Text>
          </View>
        ))}

        <TouchableOpacity 
          style={styles.printButton}
          onPress={handleGeneratePDF}
        >
          <Text style={styles.buttonText}>列印評估報告</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  assessmentCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  procedureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  riskBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 10,
  },
  riskText: {
    color: '#fff',
    fontWeight: '600',
  },
  recommendation: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  printButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 