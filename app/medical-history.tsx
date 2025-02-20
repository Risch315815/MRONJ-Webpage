import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import RNPickerSelect from 'react-native-picker-select';
import { usePatientStore } from './store/patientData';

export default function MedicalHistory() {
  const { patientData, updatePatientInfo } = usePatientStore();

  // Updated systemic diseases options
  const systemicDiseaseOptions = [
    { label: '無', value: '無' },
    { label: '高血壓', value: '高血壓' },
    { label: '心臟支架', value: '心臟支架' },
    { label: '糖尿病', value: '糖尿病' },
    { label: '洗腎', value: '洗腎' },
    { label: 'A型肝炎', value: 'A型肝炎' },
    { label: 'B型肝炎', value: 'B型肝炎' },
    { label: 'C型肝炎', value: 'C型肝炎' },
    { label: '腦中風病史', value: '腦中風病史' },
  ];

  const genderOptions = [
    { label: '男', value: '男' },
    { label: '女', value: '女' },
    { label: '跨性別', value: '跨性別' },
  ];

  const transgenderOptions = [
    { label: '男跨女', value: '男跨女' },
    { label: '女跨男', value: '女跨男' },
    { label: '其他', value: '其他' },
  ];

  const hormoneTherapyDurationOptions = [
    { label: '5年以內', value: '5年以內' },
    { label: '5-10年', value: '5-10年' },
    { label: '10年以上', value: '10年以上' },
  ];

  const handleSubmit = () => {
    // TODO: Validate inputs
    router.push('/medication-history');
  };

  // In the MedicalHistory component, add a function to calculate age
  const calculateAge = (birthYear: string, birthMonth: string, birthDay: string) => {
    const today = new Date();
    const birthDate = new Date(
      parseInt(birthYear),
      parseInt(birthMonth) - 1,
      parseInt(birthDay)
    );
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  };

  // Add logic to handle "無" selection
  const handleDiseaseSelection = (disease: string) => {
    const currentDiseases = patientData.systemicDiseases;
    let newDiseases: string[];

    if (disease === '無') {
      // If selecting "無", clear all other selections
      newDiseases = ['無'];
    } else {
      if (currentDiseases.includes('無')) {
        // If "無" was previously selected, remove it
        newDiseases = [disease];
      } else {
        // Toggle the selected disease
        newDiseases = currentDiseases.includes(disease)
          ? currentDiseases.filter(d => d !== disease)
          : [...currentDiseases, disease];
      }
    }

    updatePatientInfo({ systemicDiseases: newDiseases });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>病史資料</Text>

        <View style={styles.form}>
          {/* Calculated Age */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>年齡</Text>
            <Text style={styles.calculatedAge}>
              {calculateAge(patientData.birthYear, patientData.birthMonth, patientData.birthDay)}歲
            </Text>
          </View>

          {/* Gender Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>生理性別</Text>
            <View style={styles.radioGroup}>
              {genderOptions.map((option) => (
                <TouchableOpacity 
                  key={option.value}
                  style={[
                    styles.radioButton,
                    patientData.gender === option.value && styles.radioButtonSelected
                  ]}
                  onPress={() => {
                    updatePatientInfo({ 
                      gender: option.value,
                      // Reset related fields when changing gender
                      transgenderType: '',
                      hasHormoneTherapy: false,
                      hormoneTherapyDuration: '',
                    });
                  }}
                >
                  <Text style={[
                    styles.radioText,
                    patientData.gender === option.value && styles.radioTextSelected
                  ]}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Transgender Type Selection */}
          {patientData.gender === '跨性別' && (
            <View style={styles.inputGroup}>
              <Text style={styles.sublabel}>跨性別類型</Text>
              <View style={styles.radioGroup}>
                {transgenderOptions.map((option) => (
                  <TouchableOpacity 
                    key={option.value}
                    style={[
                      styles.radioButton,
                      patientData.transgenderType === option.value && styles.radioButtonSelected
                    ]}
                    onPress={() => updatePatientInfo({ transgenderType: option.value })}
                  >
                    <Text style={[
                      styles.radioText,
                      patientData.transgenderType === option.value && styles.radioTextSelected
                    ]}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Hormone Therapy Question */}
          {patientData.gender === '跨性別' && (
            <View style={styles.inputGroup}>
              <Text style={styles.sublabel}>是否接受賀爾蒙療法？</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity 
                  style={[
                    styles.radioButton,
                    patientData.hasHormoneTherapy && styles.radioButtonSelected
                  ]}
                  onPress={() => updatePatientInfo({ 
                    hasHormoneTherapy: true,
                  })}
                >
                  <Text style={[
                    styles.radioText,
                    patientData.hasHormoneTherapy && styles.radioTextSelected
                  ]}>是</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.radioButton,
                    patientData.hasHormoneTherapy === false && styles.radioButtonSelected
                  ]}
                  onPress={() => updatePatientInfo({ 
                    hasHormoneTherapy: false,
                    hormoneTherapyDuration: '', // Reset duration when selecting No
                  })}
                >
                  <Text style={[
                    styles.radioText,
                    patientData.hasHormoneTherapy === false && styles.radioTextSelected
                  ]}>否</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Hormone Therapy Duration */}
          {patientData.gender === '跨性別' && patientData.hasHormoneTherapy && (
            <View style={styles.inputGroup}>
              <Text style={styles.sublabel}>接受賀爾蒙療法時間長度</Text>
              <View style={styles.pickerContainer}>
                <RNPickerSelect
                  value={patientData.hormoneTherapyDuration}
                  onValueChange={(value) => 
                    updatePatientInfo({ hormoneTherapyDuration: value })}
                  items={hormoneTherapyDurationOptions}
                  style={pickerSelectStyles}
                  placeholder={{ label: '請選擇時間長度', value: null }}
                />
              </View>
            </View>
          )}

          {/* Systemic Diseases */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>系統性疾病（可複選）</Text>
            <View style={styles.checkboxGroup}>
              {systemicDiseaseOptions.map((disease) => (
                <TouchableOpacity
                  key={disease.value}
                  style={styles.checkbox}
                  onPress={() => handleDiseaseSelection(disease.value)}
                >
                  <View style={[
                    styles.checkboxBox,
                    patientData.systemicDiseases.includes(disease.value) && styles.checkboxChecked
                  ]} />
                  <Text style={styles.checkboxLabel}>{disease.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Radiotherapy History */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>是否曾接受頭頸部放射治療？</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity 
                style={[
                  styles.radioButton,
                  patientData.hasRadiotherapy && styles.radioButtonSelected
                ]}
                onPress={() => updatePatientInfo({ hasRadiotherapy: true })}
              >
                <Text style={[
                  styles.radioText,
                  patientData.hasRadiotherapy && styles.radioTextSelected
                ]}>是</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.radioButton,
                  !patientData.hasRadiotherapy && styles.radioButtonSelected
                ]}
                onPress={() => updatePatientInfo({ hasRadiotherapy: false })}
              >
                <Text style={[
                  styles.radioText,
                  !patientData.hasRadiotherapy && styles.radioTextSelected
                ]}>否</Text>
              </TouchableOpacity>
            </View>
          </View>

          {patientData.hasRadiotherapy && (
            <View style={styles.inputGroup}>
              <Text style={styles.sublabel}>放射治療詳情</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={patientData.radiotherapyDetails}
                onChangeText={(text) => 
                  updatePatientInfo({ radiotherapyDetails: text })}
                placeholder="請說明治療時間、部位等"
                multiline
                numberOfLines={3}
              />
            </View>
          )}

          {/* Cancer History */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>是否有惡性腫瘤病史？</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity 
                style={[
                  styles.radioButton,
                  patientData.hasCancer && styles.radioButtonSelected
                ]}
                onPress={() => updatePatientInfo({ hasCancer: true })}
              >
                <Text style={[
                  styles.radioText,
                  patientData.hasCancer && styles.radioTextSelected
                ]}>是</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.radioButton,
                  !patientData.hasCancer && styles.radioButtonSelected
                ]}
                onPress={() => updatePatientInfo({ hasCancer: false })}
              >
                <Text style={[
                  styles.radioText,
                  !patientData.hasCancer && styles.radioTextSelected
                ]}>否</Text>
              </TouchableOpacity>
            </View>
          </View>

          {patientData.hasCancer && (
            <View style={styles.inputGroup}>
              <Text style={styles.sublabel}>腫瘤病史詳情</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={patientData.cancerHistory}
                onChangeText={(text) => 
                  updatePatientInfo({ cancerHistory: text })}
                placeholder="請說明診斷時間、類型、治療方式等"
                multiline
                numberOfLines={3}
              />
            </View>
          )}

          {/* Other Conditions */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>其他病史</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={patientData.otherConditions}
              onChangeText={(text) => 
                updatePatientInfo({ otherConditions: text })}
              placeholder="請填寫其他需要注意的病史"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>下一步</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    gap: 20,
    marginBottom: 30,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  sublabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  nextButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  calculatedAge: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  checkboxGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 4,
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 10,
  },
  radioButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: 'white',
  },
  radioButtonSelected: {
    backgroundColor: '#007AFF',
  },
  radioText: {
    fontSize: 16,
    color: '#007AFF',
  },
  radioTextSelected: {
    color: 'white',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: '#333',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#333',
  },
}); 