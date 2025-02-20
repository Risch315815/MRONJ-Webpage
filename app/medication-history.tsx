import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import RNPickerSelect from 'react-native-picker-select';
import { usePatientStore } from './store/patientData';

export default function MedicationHistory() {
  const { patientData, updatePatientInfo } = usePatientStore();
  const [dateError, setDateError] = useState<string>('');

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

  // Grouped medications for display
  const medicationGroups = [
    {
      title: '雙磷酸鹽類藥物',
      medications: [
        { name: '福善美保骨錠Fosamax Plus', route: '口服' },
        { name: '瑞谷卓膜衣錠Reosteo', route: '口服' },
        { name: '骨維壯注射劑Boniva', route: '注射' },
      ]
    },
    {
      title: '單株抗體藥物',
      medications: [
        { name: '保骼麗注射液Prolia', route: '注射' },
      ]
    },
    {
      title: '其他骨質疏鬆藥物',
      medications: [
        { name: '鈣穩膜衣錠Evista', route: '口服' },
        { name: '骨穩Forteo', route: '注射' },
        { name: '益穩挺Evenity', route: '注射' },
      ]
    }
  ];

  const handleDrugSelection = (drugName: string, route: string) => {
    updatePatientInfo({
      drugName,
      administrationRoute: route
    });
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
                <Text style={[
                  styles.radioText,
                  patientData.hasAntiresorptiveMed && styles.radioTextSelected
                ]}>是</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.radioButton,
                  patientData.hasAntiresorptiveMed === false && styles.radioButtonSelected
                ]}
                onPress={() => updatePatientInfo({ 
                  hasAntiresorptiveMed: false,
                  drugName: '',
                  administrationRoute: '',
                  indication: '',
                  dosage: '',
                  frequency: '',
                  duration: '',
                  lastDoseDate: '',
                  hasDrugHoliday: false,
                  drugHolidayStartDate: '',
                })}
              >
                <Text style={[
                  styles.radioText,
                  patientData.hasAntiresorptiveMed === false && styles.radioTextSelected
                ]}>否</Text>
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
                          onPress={() => updatePatientInfo({ indication: reason })}
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
                          onPress={() => updatePatientInfo({ frequency: option.value })}
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
          onPress={() => router.push('/pre-assessment')}
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