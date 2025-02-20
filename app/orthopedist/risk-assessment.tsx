import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';

// Add these type definitions at the top of the file
type RiskLevel = 'High' | 'Moderate' | 'Low';

type Recommendations = {
  extraction: string;
  implant: string;
  periodontal: string;
  routine: string;
};

export default function RiskAssessment() {
  const [consent, setConsent] = useState(false);
  const [patientData, setPatientData] = useState({
    // Identity Information
    name: '',
    birthDate: '',
    ssn: '',
    
    // Medical Condition
    age: '',
    gender: '',
    systemicDiseases: '',
    radiotherapyHistory: false,
    cancerHistory: '',
    
    // Drug History
    medicationType: '',
    administrationRoute: '',
    duration: '',
    lastDose: '',
  });

  const calculateRisk = () => {
    // Basic risk assessment algorithm
    let riskScore = 0;
    
    // Risk factors based on medication
    if (patientData.medicationType.toLowerCase().includes('zoledronate') || 
        patientData.medicationType.toLowerCase().includes('denosumab')) {
      riskScore += 3;
    } else if (patientData.medicationType.toLowerCase().includes('bisphosphonate')) {
      riskScore += 2;
    }
    
    // Risk based on administration route
    if (patientData.administrationRoute.toLowerCase().includes('iv')) {
      riskScore += 2;
    }
    
    // Risk based on duration (assuming duration is in months)
    const durationMonths = parseInt(patientData.duration) || 0;
    if (durationMonths > 48) {
      riskScore += 3;
    } else if (durationMonths > 24) {
      riskScore += 2;
    } else if (durationMonths > 12) {
      riskScore += 1;
    }
    
    // Additional risk factors
    if (patientData.radiotherapyHistory) riskScore += 2;
    if (patientData.cancerHistory) riskScore += 2;
    
    // Determine risk level
    let riskLevel = 'Low';
    if (riskScore >= 6) {
      riskLevel = 'High';
    } else if (riskScore >= 3) {
      riskLevel = 'Moderate';
    }
    
    return {
      riskScore,
      riskLevel,
      recommendations: getRiskRecommendations(riskLevel)
    };
  };

  const getRiskRecommendations = (riskLevel: RiskLevel): Recommendations => {
    switch (riskLevel) {
      case 'High':
        return {
          extraction: 'High risk - Consider alternative treatments',
          implant: 'Contraindicated',
          periodontal: 'High risk - Minimal invasive approach recommended',
          routine: 'Proceed with caution'
        };
      case 'Moderate':
        return {
          extraction: 'Proceed with caution - Consider drug holiday',
          implant: 'High risk - Consider alternatives',
          periodontal: 'Proceed with caution',
          routine: 'Safe to proceed'
        };
      default:
        return {
          extraction: 'Safe to proceed with normal protocols',
          implant: 'Proceed with caution',
          periodontal: 'Safe to proceed',
          routine: 'Safe to proceed'
        };
    }
  };

  const handleSubmit = () => {
    if (!consent) {
      alert('Patient consent is required');
      return;
    }
    
    const riskAssessment = calculateRisk();
    console.log('Risk Assessment:', riskAssessment);
    // TODO: Generate PDF with assessment results
    router.push('/orthopedist/assessment-result');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>MRONJ Risk Assessment</Text>

        {/* Consent Section */}
        <View style={styles.consentSection}>
          <Text style={styles.consentText}>
            I consent to the collection and processing of my personal medical information
            for the purpose of MRONJ risk assessment.
          </Text>
          <Switch
            value={consent}
            onValueChange={setConsent}
          />
        </View>

        {/* Identity Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={patientData.name}
              onChangeText={(text) => setPatientData({ ...patientData, name: text })}
              placeholder="Enter full name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth</Text>
            <TextInput
              style={styles.input}
              value={patientData.birthDate}
              onChangeText={(text) => setPatientData({ ...patientData, birthDate: text })}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Social Security Number</Text>
            <TextInput
              style={styles.input}
              value={patientData.ssn}
              onChangeText={(text) => setPatientData({ ...patientData, ssn: text })}
              placeholder="XXX-XX-XXXX"
              secureTextEntry
            />
          </View>
        </View>

        {/* Medical History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical History</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={patientData.age}
              onChangeText={(text) => setPatientData({ ...patientData, age: text })}
              placeholder="Enter age"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <TextInput
              style={styles.input}
              value={patientData.gender}
              onChangeText={(text) => setPatientData({ ...patientData, gender: text })}
              placeholder="Enter gender"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Systemic Diseases</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={patientData.systemicDiseases}
              onChangeText={(text) => setPatientData({ ...patientData, systemicDiseases: text })}
              placeholder="List any systemic diseases"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.switchGroup}>
            <Text style={styles.label}>History of Head/Neck Radiotherapy</Text>
            <Switch
              value={patientData.radiotherapyHistory}
              onValueChange={(value) => setPatientData({ ...patientData, radiotherapyHistory: value })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cancer History</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={patientData.cancerHistory}
              onChangeText={(text) => setPatientData({ ...patientData, cancerHistory: text })}
              placeholder="Describe any cancer history"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Medication History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Anti-resorptive Medication</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Medication Name</Text>
            <TextInput
              style={styles.input}
              value={patientData.medicationType}
              onChangeText={(text) => setPatientData({ ...patientData, medicationType: text })}
              placeholder="e.g., Zoledronate, Denosumab"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Administration Route</Text>
            <TextInput
              style={styles.input}
              value={patientData.administrationRoute}
              onChangeText={(text) => setPatientData({ ...patientData, administrationRoute: text })}
              placeholder="e.g., Oral, IV"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duration (months)</Text>
            <TextInput
              style={styles.input}
              value={patientData.duration}
              onChangeText={(text) => setPatientData({ ...patientData, duration: text })}
              placeholder="Enter duration in months"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Last Dose</Text>
            <TextInput
              style={styles.input}
              value={patientData.lastDose}
              onChangeText={(text) => setPatientData({ ...patientData, lastDose: text })}
              placeholder="YYYY-MM-DD"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, !consent && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={!consent}
        >
          <Text style={styles.submitButtonText}>Generate Risk Assessment</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    marginBottom: 25,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  consentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8E8E8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  consentText: {
    flex: 1,
    marginRight: 10,
    fontSize: 14,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 15,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#F8F8F8',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#999',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 