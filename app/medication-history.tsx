import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import RNPickerSelect from 'react-native-picker-select';
import { usePatientStore, DrugName } from './store/patientData';

// Add interface for medication
interface Medication {
  name: DrugName;
  route: '口服' | '注射';
}

interface MedicationGroup {
  title: string;
  medications: Medication[];
}

export default function MedicationHistory() {
  const { patientData, updatePatientInfo } = usePatientStore();
  const [dateError, setDateError] = useState<string>('');

  // Set default value for hasAntiresorptiveMed to true when component mounts
  useEffect(() => {
    if (patientData.hasAntiresorptiveMed === false) {
      updatePatientInfo({
        hasAntiresorptiveMed: true,
        medicationType: '',
        medicationSubType: '',
        drugName: '',
        administrationRoute: '',
        indication: '',
        startYear: '',
        startMonth: '',
        frequency: '',
        isStopped: false,
        stopYear: '',
        stopMonth: '',
      });
    }
  }, []);

  // Get current year and generate year options (from 1990 to current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: currentYear - 1990 + 1 },
    (_, i) => ({ 
      label: `${currentYear - i}年`, 
      value: (currentYear - i).toString() 
    })
  );

  // Generate month options
  const monthOptions = Array.from(
    { length: 12 },
    (_, i) => ({ label: `${i + 1}月`, value: (i + 1).toString() })
  );

  const frequencyOptions = [
    { label: '每天', value: '每天' },
    { label: '每個月', value: '每個月' },
    { label: '每半年', value: '每半年' },
  ];

  // Update medicationGroups with proper typing
  const medicationGroups: MedicationGroup[] = [
    {
      title: '雙磷酸鹽類藥物',
      medications: [
        { name: 'Alendronate (Fosamax)', route: '口服' },
        { name: 'Risedronate (Actonel)', route: '口服' },
        { name: 'Ibandronate (Boniva)', route: '注射' },
      ]
    },
    {
      title: '單株抗體藥物',
      medications: [
        { name: 'Denosumab (Prolia/Xgeva)', route: '注射' },
      ]
    },
    {
      title: '其他骨質疏鬆藥物',
      medications: [
        { name: 'Bevacizumab (Avastin)', route: '注射' },
        { name: 'Sunitinib (Sutent)', route: '口服' },
        { name: 'Cabozantinib (Cabometyx)', route: '口服' },
      ]
    }
  ];

  const handleDrugSelection = (drugName: DrugName, route: '口服' | '注射') => {
    updatePatientInfo({
      drugName,
      administrationRoute: route
    });
  };

  const handleReasonSelection = (reason: '骨質疏鬆' | '多發性骨髓瘤' | '骨轉移' | '其他') => {
    updatePatientInfo({ indication: reason });
  };

  const handleFrequencySelection = (freq: '每天' | '每個月' | '每半年') => {
    updatePatientInfo({ frequency: freq });
  };

  // Add validation function
  const validateStopDate = (year: string, month: string) => {
    if (!patientData.startYear || !patientData.startMonth) {
      setDateError('請先選擇開始用藥時間');
      return false;
    }

    const startDate = new Date(
      parseInt(patientData.startYear),
      parseInt(patientData.startMonth) - 1
    );
    const stopDate = new Date(
      parseInt(year),
      parseInt(month) - 1
    );

    if (stopDate < startDate) {
      setDateError('停藥時間不能早於開始用藥時間');
      return false;
    }

    setDateError('');
    return true;
  };

  // Update the stop date handlers
  const handleStopYearChange = (value: string) => {
    if (value && patientData.stopMonth) {
      if (validateStopDate(value, patientData.stopMonth)) {
        updatePatientInfo({ stopYear: value });
      }
    } else {
      updatePatientInfo({ stopYear: value });
    }
  };

  const handleStopMonthChange = (value: string) => {
    if (value && patientData.stopYear) {
      if (validateStopDate(patientData.stopYear, value)) {
        updatePatientInfo({ stopMonth: value });
      }
    } else {
      updatePatientInfo({ stopMonth: value });
    }
  };

  const validateMedicationFields = () => {
    if (patientData.hasAntiresorptiveMed) {
      const errors = [];
      
      // Check medication selection
      if (!patientData.drugName) {
        errors.push('請選擇使用的藥物');
      }

      if (patientData.drugName) {
        // Only check these if a medication is selected
        if (!patientData.indication) {
          errors.push('請選擇使用原因');
        }

        if (!patientData.startYear || !patientData.startMonth) {
          errors.push(`請選擇開始${patientData.administrationRoute === '口服' ? '吃藥' : '注射'}的時間`);
        }

        if (!patientData.frequency) {
          errors.push(`請選擇${patientData.administrationRoute === '口服' ? '吃藥' : '注射'}頻率`);
        }

        // Check medication status
        if (patientData.isStopped) {
          if (!patientData.stopYear || !patientData.stopMonth) {
            errors.push('請選擇停藥時間');
          } else {
            // Validate stop date is after start date
            const startDate = new Date(
              parseInt(patientData.startYear),
              parseInt(patientData.startMonth) - 1
            );
            const stopDate = new Date(
              parseInt(patientData.stopYear),
              parseInt(patientData.stopMonth) - 1
            );

            if (stopDate < startDate) {
              errors.push('停藥時間不能早於開始用藥時間');
            }
          }
        }
      }

      if (errors.length > 0) {
        Alert.alert(
          '請完整填寫用藥資訊',
          errors.join('\n'),
          [{ text: '確定' }]
        );
        return false;
      }
    }
    return true;
  };

  // Update the submit handler
  const handleSubmit = () => {
    if (validateMedicationFields()) {
      router.push('/pre-assessment');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>用藥紀錄</Text>

        <View style={styles.form}>
          {/* Initial question */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>是否正在使用或曾經使用骨質疏鬆相關藥物？</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  patientData.hasAntiresorptiveMed && styles.radioButtonSelected
                ]}
                onPress={() => updatePatientInfo({ hasAntiresorptiveMed: true })}
              >
                <Text style={styles.radioText}>是</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  !patientData.hasAntiresorptiveMed && styles.radioButtonSelected
                ]}
                onPress={() => updatePatientInfo({ hasAntiresorptiveMed: false })}
              >
                <Text style={styles.radioText}>否</Text>
              </TouchableOpacity>
            </View>
          </View>

          {patientData.hasAntiresorptiveMed && (
            <>
              {/* Medication Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>請選擇使用的藥物</Text>
                {medicationGroups.map((group, groupIndex) => (
                  <View key={groupIndex} style={styles.medicationGroup}>
                    <Text style={styles.groupTitle}>{group.title}</Text>
                    <View style={styles.medicationsGrid}>
                      {group.medications.map((med, medIndex) => (
                        <TouchableOpacity
                          key={medIndex}
                          style={[
                            styles.medicationButton,
                            patientData.drugName === med.name && styles.medicationButtonSelected
                          ]}
                          onPress={() => handleDrugSelection(med.name, med.route)}
                        >
                          <Text style={[
                            styles.medicationText,
                            patientData.drugName === med.name && styles.medicationTextSelected
                          ]}>{med.name}</Text>
                          <Text style={[
                            styles.routeText,
                            patientData.drugName === med.name && styles.medicationTextSelected
                          ]}>({med.route})</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </View>

              {/* Usage Details */}
              {patientData.drugName && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>使用原因</Text>
                    <View style={styles.radioGroup}>
                      {['骨質疏鬆', '多發性骨髓瘤', '骨轉移', '其他'].map((reason) => (
                        <TouchableOpacity
                          key={reason}
                          style={[
                            styles.reasonButton,
                            patientData.indication === reason && styles.reasonButtonSelected
                          ]}
                          onPress={() => handleReasonSelection(reason as '骨質疏鬆' | '多發性骨髓瘤' | '骨轉移' | '其他')}
                        >
                          <Text style={[
                            styles.reasonText,
                            patientData.indication === reason && styles.reasonTextSelected
                          ]}>{reason}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Start Date */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>開始{patientData.administrationRoute === '口服' ? '吃' : '注射'}的時間</Text>
                    <View style={styles.datePickerGroup}>
                      <View style={[styles.pickerContainer, { flex: 1 }]}>
                        <RNPickerSelect
                          value={patientData.startYear}
                          onValueChange={(value) => 
                            updatePatientInfo({ startYear: value })}
                          items={yearOptions}
                          style={pickerSelectStyles}
                          placeholder={{ label: '年份', value: null }}
                        />
                      </View>
                      <View style={[styles.pickerContainer, { flex: 1 }]}>
                        <RNPickerSelect
                          value={patientData.startMonth}
                          onValueChange={(value) => 
                            updatePatientInfo({ startMonth: value })}
                          items={monthOptions}
                          style={pickerSelectStyles}
                          placeholder={{ label: '月份', value: null }}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Frequency */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      多久{patientData.administrationRoute === '口服' ? '吃' : '注射'}一次
                    </Text>
                    <View style={styles.radioGroup}>
                      {frequencyOptions.map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.radioButton,
                            patientData.frequency === option.value && styles.radioButtonSelected
                          ]}
                          onPress={() => handleFrequencySelection(option.value as '每天' | '每個月' | '每半年')}
                        >
                          <Text style={[
                            styles.radioText,
                            patientData.frequency === option.value && styles.radioTextSelected
                          ]}>{option.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Stop Date Section */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>目前用藥狀態</Text>
                    <View style={styles.radioGroup}>
                      <TouchableOpacity 
                        style={[
                          styles.radioButton,
                          !patientData.isStopped && styles.radioButtonSelected
                        ]}
                        onPress={() => updatePatientInfo({ 
                          isStopped: false,
                          stopYear: '',
                          stopMonth: '',
                        })}
                      >
                        <Text style={[
                          styles.radioText,
                          !patientData.isStopped && styles.radioTextSelected
                        ]}>持續服用</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[
                          styles.radioButton,
                          patientData.isStopped && styles.radioButtonSelected
                        ]}
                        onPress={() => updatePatientInfo({ isStopped: true })}
                      >
                        <Text style={[
                          styles.radioText,
                          patientData.isStopped && styles.radioTextSelected
                        ]}>已停藥</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Show stop date pickers only if stopped */}
                  {patientData.isStopped && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.sublabel}>停藥時間</Text>
                      <View style={styles.datePickerGroup}>
                        <View style={[styles.pickerContainer, { flex: 1 }]}>
                          <RNPickerSelect
                            value={patientData.stopYear}
                            onValueChange={handleStopYearChange}
                            items={yearOptions}
                            style={pickerSelectStyles}
                            placeholder={{ label: '年份', value: null }}
                          />
                        </View>
                        <View style={[styles.pickerContainer, { flex: 1 }]}>
                          <RNPickerSelect
                            value={patientData.stopMonth}
                            onValueChange={handleStopMonthChange}
                            items={monthOptions}
                            style={pickerSelectStyles}
                            placeholder={{ label: '月份', value: null }}
                          />
                        </View>
                      </View>
                      {dateError ? (
                        <Text style={styles.errorText}>{dateError}</Text>
                      ) : null}
                    </View>
                  )}
                </>
              )}
            </>
          )}
        </View>

        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>送出資料</Text>
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
  },
  form: {
    // Add appropriate styles for the form
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    padding: 10,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 5,
  },
  radioButtonSelected: {
    backgroundColor: '#000',
  },
  radioText: {
    fontSize: 16,
  },
  radioTextSelected: {
    color: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
  },
  input: {
    padding: 10,
  },
  nextButton: {
    padding: 15,
    backgroundColor: '#000',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  medicationGroup: {
    marginTop: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  medicationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  medicationButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    width: '48%',
  },
  medicationButtonSelected: {
    backgroundColor: '#007AFF',
  },
  medicationText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
  },
  medicationTextSelected: {
    color: 'white',
  },
  routeText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  reasonButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginRight: 10,
  },
  reasonButtonSelected: {
    backgroundColor: '#007AFF',
  },
  reasonText: {
    color: '#007AFF',
    fontSize: 14,
  },
  reasonTextSelected: {
    color: 'white',
  },
  datePickerGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  sublabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 5,
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