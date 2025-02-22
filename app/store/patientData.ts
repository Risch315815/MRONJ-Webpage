import { create } from 'zustand';

// Add these types for medication categorization
export type MedicationType = 
  | 'Antiresorptive'  // 抗骨質再吸收劑
  | 'Antiangiogenic'  // 抗血管新生劑
  | 'Both'            // 兩者皆是
  | '';

export type SubType = 
  | 'Bisphosphonates-IV'     // 靜脈注射型雙磷酸鹽類
  | 'Bisphosphonates-Oral'   // 口服型雙磷酸鹽類
  | 'RANK-L Inhibitors'      // RANK-L抑制劑
  | 'Antiangiogenic Agents'  // 抗血管新生藥物
  | '';

export type DrugName = 
  // Bisphosphonates - IV
  | 'Zoledronate (Zometa)'
  | 'Pamidronate (Aredia)'
  | 'Ibandronate (Boniva IV)'
  
  // Bisphosphonates - Oral
  | 'Alendronate (Fosamax)'
  | 'Risedronate (Actonel)'
  | 'Ibandronate (Boniva)'
  
  // RANK-L Inhibitors
  | 'Denosumab (Prolia/Xgeva)'
  
  // Antiangiogenic
  | 'Bevacizumab (Avastin)'
  | 'Sunitinib (Sutent)'
  | 'Cabozantinib (Cabometyx)'
  | '';

export interface PatientData {
  // Personal Info
  name: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  idNumber: string;
  
  // Medical History
  gender: '男' | '女' | '跨性別' | '';
  transgenderType: '男跨女' | '女跨男' | '其他' | '';
  hasHormoneTherapy: boolean;
  hormoneTherapyDuration: '5年以內' | '5-10年' | '10年以上' | '';
  systemicDiseases: string[];
  hasRadiotherapy: boolean;
  radiotherapyDetails: string;
  hasCancer: boolean;
  cancerHistory: string;
  otherConditions: string;

  // Updated Medication History
  hasAntiresorptiveMed: boolean;
  medicationType: MedicationType;
  medicationSubType: SubType;
  drugName: DrugName;
  administrationRoute: '口服' | '注射' | '';
  indication: '骨質疏鬆' | '多發性骨髓瘤' | '骨轉移' | '其他' | '';
  startYear: string;
  startMonth: string;
  frequency: '每天' | '每個月' | '每半年' | '';
  isStopped: boolean;
  stopYear: string;
  stopMonth: string;

  // Physical measurements
  height: string;  // in cm
  weight: string;  // in kg
  bmi: number | null;
  isObese: boolean;
}

interface PatientStore {
  patientData: PatientData;
  updatePatientInfo: (data: Partial<PatientData>) => void;
  resetPatientData: () => void;
}

const initialState: PatientData = {
  name: '',
  birthYear: new Date().getFullYear().toString(),
  birthMonth: '1',
  birthDay: '1',
  idNumber: '',
  gender: '',
  transgenderType: '',
  hasHormoneTherapy: false,
  hormoneTherapyDuration: '',
  systemicDiseases: [],
  hasRadiotherapy: false,
  radiotherapyDetails: '',
  hasCancer: false,
  cancerHistory: '',
  otherConditions: '',
  hasAntiresorptiveMed: false,
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
  height: '',
  weight: '',
  bmi: null,
  isObese: false,
};

export const usePatientStore = create<PatientStore>((set: any) => ({
  patientData: initialState,
  updatePatientInfo: (data: Partial<PatientData>) => 
    set((state: PatientStore) => ({ 
      patientData: { ...state.patientData, ...data } 
    })),
  resetPatientData: () => set({ patientData: initialState }),
})); 