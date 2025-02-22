import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import RNPickerSelect from 'react-native-picker-select';
import { usePatientStore } from './store/patientData';

interface PatientInfo {
  name: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  idNumber: string;
  height: string;  // in cm
  weight: string;  // in kg
  age: number | null;
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

// Add this function at the top level
const calculateAge = (year: string, month: string, day: string): number => {
  const birthYear = parseInt(year);
  const birthMonth = parseInt(month);
  const birthDay = parseInt(day);
  const today = new Date();
  let age = today.getFullYear() - birthYear;
  const m = today.getMonth() + 1 - birthMonth;
  if (m < 0 || (m === 0 && today.getDate() < birthDay)) {
    age--;
  }
  return age;
};

export default function PatientInfo() {
  const { updatePatientInfo } = usePatientStore();
  
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
    age: null,
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

  const validateFields = () => {
    const errors = [];
    
    if (!patientInfo.name) errors.push('姓名');
    if (!patientInfo.idNumber) errors.push('身分證字號');
    if (!patientInfo.height) errors.push('身高');
    if (!patientInfo.weight) errors.push('體重');
    
    if (errors.length > 0) {
      Alert.alert('請填寫以下必填項目', errors.join('、'));
      return false;
    }
    
    return true;
  };

  const handleSubmit = () => {
    if (!validateFields()) return;
    
    const height = parseFloat(patientInfo.height);
    const weight = parseFloat(patientInfo.weight);
    
    if (!height || !weight) {
      Alert.alert('請輸入身高體重');
      return;
    }
    
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    const isObese = bmi >= 30;
    
    const age = calculateAge(
      patientInfo.birthYear,
      patientInfo.birthMonth,
      patientInfo.birthDay
    );

    updatePatientInfo({
      name: patientInfo.name,
      birthYear: patientInfo.birthYear,
      birthMonth: patientInfo.birthMonth,
      birthDay: patientInfo.birthDay,
      idNumber: patientInfo.idNumber,
      age: age,
      height: patientInfo.height,
      weight: patientInfo.weight,
      bmi: bmi,
      isObese: isObese,
    });

    router.push('/medical-history');
  };

  // Update the birth date handlers
  const handleBirthYearChange = (value: string) => {
    const age = calculateAge(value, patientInfo.birthMonth, patientInfo.birthDay);
    setPatientInfo({ ...patientInfo, birthYear: value, age });
  };

  const handleBirthMonthChange = (value: string) => {
    const age = calculateAge(patientInfo.birthYear, value, patientInfo.birthDay);
    setPatientInfo({ ...patientInfo, birthMonth: value, age });
  };

  const handleBirthDayChange = (value: string) => {
    const age = calculateAge(patientInfo.birthYear, patientInfo.birthMonth, value);
    setPatientInfo({ ...patientInfo, birthDay: value, age });
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
              onValueChange={handleBirthYearChange}
              items={yearOptions}
              style={pickerSelectStyles}
            />
          )}

          {showMonthPicker && (
            <RNPickerSelect
              value={patientInfo.birthMonth}
              onValueChange={handleBirthMonthChange}
              items={monthOptions}
              style={pickerSelectStyles}
            />
          )}

          {showDayPicker && (
            <RNPickerSelect
              value={patientInfo.birthDay}
              onValueChange={handleBirthDayChange}
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