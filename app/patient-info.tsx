import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import RNPickerSelect from 'react-native-picker-select';

interface PatientInfo {
  name: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  idNumber: string;
  height: string;  // in cm
  weight: string;  // in kg
}

// Generate height options (140cm to 200cm)
const heightOptions = Array.from(
  { length: 61 },
  (_, i) => ({ label: `${140 + i} 公分`, value: (140 + i).toString() })
);

// Generate weight options (30kg to 150kg)
const weightOptions = Array.from(
  { length: 121 },
  (_, i) => ({ label: `${30 + i} 公斤`, value: (30 + i).toString() })
);

export default function PatientInfo() {
  // Get current year
  const currentYear = new Date().getFullYear();
  
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: '',
    birthYear: currentYear.toString(),
    birthMonth: '1',
    birthDay: '1',
    idNumber: '',
    height: '',
    weight: '',
  });

  // Generate year options from 1912 to current year
  const yearOptions = Array.from(
    { length: currentYear - 1911 },
    (_, i) => ({ label: `${1912 + i}年`, value: (1912 + i).toString() })
  ).reverse(); // Reverse to show newest years first

  // Generate month options
  const monthOptions = Array.from(
    { length: 12 },
    (_, i) => ({ label: `${i + 1}月`, value: (i + 1).toString() })
  );

  // Add these state variables for controlling pickers
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showHeightPicker, setShowHeightPicker] = useState(false);
  const [showWeightPicker, setShowWeightPicker] = useState(false);

  // Add a function to get days in month
  const getDaysInMonth = (year: string, month: string) => {
    return new Date(parseInt(year), parseInt(month), 0).getDate();
  };

  // Update the dayOptions to be dynamic based on selected year and month
  const dayOptions = Array.from(
    { length: getDaysInMonth(patientInfo.birthYear, patientInfo.birthMonth) },
    (_, i) => ({ label: `${i + 1}日`, value: (i + 1).toString() })
  );

  // Calculate BMI
  const calculateBMI = (): number | null => {
    if (!patientInfo.height || !patientInfo.weight) return null;
    
    const heightInMeters = parseFloat(patientInfo.height) / 100;
    const weightInKg = parseFloat(patientInfo.weight);
    
    if (heightInMeters <= 0 || weightInKg <= 0) return null;
    
    return weightInKg / (heightInMeters * heightInMeters);
  };

  const bmi = calculateBMI();
  const isObese = bmi ? bmi >= 30 : false;  // WHO definition of obesity

  const handleSubmit = () => {
    if (!patientInfo.height || !patientInfo.weight) {
      Alert.alert('請輸入身高體重');
      return;
    }
    
    const bmi = calculateBMI();
    if (bmi === null) {
      Alert.alert('身高體重數值有誤');
      return;
    }

    router.push('/medical-history');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>個人資料</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>姓名</Text>
            <TextInput
              style={styles.input}
              value={patientInfo.name}
              onChangeText={(text) => setPatientInfo({ ...patientInfo, name: text })}
              placeholder="請輸入身分證上的姓名"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>出生日期</Text>
            <View style={styles.datePickerGroup}>
              <TouchableOpacity 
                style={[styles.pickerContainer, { flex: 2 }]}
                onPress={() => setShowYearPicker(true)}
              >
                <Text style={styles.pickerText}>
                  {patientInfo.birthYear}年
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.pickerContainer, { flex: 1 }]}
                onPress={() => setShowMonthPicker(true)}
              >
                <Text style={styles.pickerText}>
                  {patientInfo.birthMonth}月
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.pickerContainer, { flex: 1 }]}
                onPress={() => setShowDayPicker(true)}
              >
                <Text style={styles.pickerText}>
                  {patientInfo.birthDay}日
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {showYearPicker && (
            <RNPickerSelect
              value={patientInfo.birthYear}
              onValueChange={(value) => {
                setPatientInfo({ ...patientInfo, birthYear: value });
                setShowYearPicker(false);
              }}
              items={yearOptions}
              style={pickerSelectStyles}
            />
          )}

          {showMonthPicker && (
            <RNPickerSelect
              value={patientInfo.birthMonth}
              onValueChange={(value) => {
                setPatientInfo({ ...patientInfo, birthMonth: value });
                setShowMonthPicker(false);
              }}
              items={monthOptions}
              style={pickerSelectStyles}
            />
          )}

          {showDayPicker && (
            <RNPickerSelect
              value={patientInfo.birthDay}
              onValueChange={(value) => {
                setPatientInfo({ ...patientInfo, birthDay: value });
                setShowDayPicker(false);
              }}
              items={dayOptions}
              style={pickerSelectStyles}
            />
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>身高</Text>
            <TouchableOpacity 
              style={styles.pickerContainer}
              onPress={() => setShowHeightPicker(true)}
            >
              <Text style={styles.pickerText}>
                {patientInfo.height ? `${patientInfo.height} 公分` : '請選擇身高'}
              </Text>
            </TouchableOpacity>
            {showHeightPicker && (
              <RNPickerSelect
                value={patientInfo.height}
                onValueChange={(value) => {
                  setPatientInfo({ ...patientInfo, height: value });
                  setShowHeightPicker(false);
                }}
                items={heightOptions}
                style={pickerSelectStyles}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>體重</Text>
            <TouchableOpacity 
              style={styles.pickerContainer}
              onPress={() => setShowWeightPicker(true)}
            >
              <Text style={styles.pickerText}>
                {patientInfo.weight ? `${patientInfo.weight} 公斤` : '請選擇體重'}
              </Text>
            </TouchableOpacity>
            {showWeightPicker && (
              <RNPickerSelect
                value={patientInfo.weight}
                onValueChange={(value) => {
                  setPatientInfo({ ...patientInfo, weight: value });
                  setShowWeightPicker(false);
                }}
                items={weightOptions}
                style={pickerSelectStyles}
              />
            )}
          </View>

          {bmi && (
            <View style={styles.bmiContainer}>
              <Text style={styles.bmiText}>
                BMI: {bmi.toFixed(1)}
                {isObese && ' (肥胖)'}
              </Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>身份證字號</Text>
            <TextInput
              style={styles.input}
              value={patientInfo.idNumber}
              onChangeText={(text) => setPatientInfo({ ...patientInfo, idNumber: text })}
              placeholder="請輸入身份證字號"
              autoCapitalize="characters"
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
  input: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
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
  datePickerGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  pickerContainer: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  bmiContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  bmiText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
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