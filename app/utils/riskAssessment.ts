import { PatientData, MedicationType, SubType, DrugName } from '../store/patientData';

type DentalProcedure = 
  | '非侵入性治療'  // Non-invasive (cleaning, filling)
  | '根管治療'    // Root canal treatment
  | '拔牙'         // Extraction
  | '牙周手術'     // Periodontal surgery
  | '植牙';         // Implant

type RiskLevel = '低風險' | '中度風險' | '高風險';

interface RiskAssessment {
  procedure: DentalProcedure;
  riskLevel: RiskLevel;
  recommendation: string;
}

interface RiskFactors {
  // Systemic Risk Factors
  systemicFactors: {
    diabetes: boolean;
    immunosuppression: boolean;
    chronicCorticosteroids: boolean;
    smoking: boolean;
    obesity: boolean;
    rheumatoidArthritis: boolean;
    anemias: boolean;
    coagulopathies: boolean;
  };
  
  // Local Risk Factors
  localFactors: {
    dentoalveolarSurgery: boolean;
    periodontalDisease: boolean;
    poorOralHygiene: boolean;
    illFittingDentures: boolean;
    anatomicFactors: boolean; // tori, exostoses, etc.
  };
  
  // Treatment Related
  medicationFactors: {
    type: MedicationType;
    subType: SubType;
    drugName: DrugName;
    duration: number; // in months
    indication: 'Cancer' | 'Osteoporosis' | 'Other';
    concurrent: boolean; // concurrent use of antiresorptive and antiangiogenic
  };
}

function calculateMedicationDuration(patientData: PatientData): number {
  if (!patientData.hasAntiresorptiveMed) return 0;
  
  const startDate = new Date(
    parseInt(patientData.startYear),
    parseInt(patientData.startMonth) - 1
  );
  
  const endDate = patientData.isStopped
    ? new Date(
        parseInt(patientData.stopYear),
        parseInt(patientData.stopMonth) - 1
      )
    : new Date();
  
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30)); // Convert to months
}

function calculateRiskFactors(patientData: PatientData): RiskFactors {
  // Calculate BMI and obesity
  const heightInMeters = parseFloat(patientData.height) / 100;
  const weightInKg = parseFloat(patientData.weight);
  const bmi = weightInKg / (heightInMeters * heightInMeters);
  const isObese = bmi >= 30;

  return {
    systemicFactors: {
      diabetes: patientData.systemicDiseases.includes('糖尿病'),
      immunosuppression: patientData.systemicDiseases.includes('免疫系統疾病'),
      chronicCorticosteroids: patientData.systemicDiseases.includes('長期使用類固醇'),
      smoking: patientData.systemicDiseases.includes('抽菸'),
      obesity: isObese,
      rheumatoidArthritis: patientData.systemicDiseases.includes('類風濕性關節炎'),
      anemias: patientData.systemicDiseases.includes('貧血'),
      coagulopathies: patientData.systemicDiseases.includes('凝血功能異常'),
    },
    localFactors: {
      dentoalveolarSurgery: false, // To be determined based on procedure
      periodontalDisease: false, // To be added to medical history
      poorOralHygiene: false, // To be added to medical history
      illFittingDentures: false, // To be added to medical history
      anatomicFactors: false, // To be added to medical history
    },
    medicationFactors: {
      type: patientData.medicationType,
      subType: patientData.medicationSubType,
      drugName: patientData.drugName,
      duration: calculateMedicationDuration(patientData),
      indication: mapIndication(patientData.indication),
      concurrent: patientData.medicationType === 'Both',
    }
  };
}

function hasSignificantRiskFactors(riskFactors: RiskFactors): boolean {
  const { systemicFactors } = riskFactors;
  return Object.values(systemicFactors).some(factor => factor === true);
}

function mapIndication(indication: string): 'Cancer' | 'Osteoporosis' | 'Other' {
  switch (indication) {
    case '骨質疏鬆':
      return 'Osteoporosis';
    case '多發性骨髓瘤':
    case '骨轉移':
      return 'Cancer';
    default:
      return 'Other';
  }
}

export function assessRisk(patientData: PatientData): RiskAssessment[] {
  const riskFactors = calculateRiskFactors(patientData);
  
  // Stage-specific risk assessment based on AAOMS 2022 guidelines
  function calculateProcedureRisk(procedure: DentalProcedure): RiskLevel {
    // Cancer patients with antiresorptive/antiangiogenic therapy
    if (mapIndication(patientData.indication) === 'Cancer') {
      if (riskFactors.medicationFactors.duration > 24) {
        return '高風險';
      }
      return '中度風險';
    }
    
    // Osteoporosis patients
    if (mapIndication(patientData.indication) === 'Osteoporosis') {
      if (riskFactors.medicationFactors.duration > 48 || 
          hasSignificantRiskFactors(riskFactors)) {
        return '中度風險';
      }
      return '低風險';
    }
    
    // Non-invasive procedures
    if (procedure === '非侵入性治療') {
      return '低風險';
    }
    
    return '低風險';
  }

  // Generate recommendations based on risk level
  function generateRecommendations(procedure: DentalProcedure, risk: RiskLevel): string {
    switch (risk) {
      case '高風險':
        return '建議：\n' +
               '1. 考慮替代性治療方案\n' +
               '2. 若必須進行手術，建議：\n' +
               '   - 術前抗生素預防性投藥\n' +
               '   - 減少手術創傷\n' +
               '   - 主要癒合\n' +
               '3. 密切追蹤至少6個月';
      
      case '中度風險':
        return '建議：\n' +
               '1. 考慮藥物假期（與開立處方醫師討論）\n' +
               '2. 採取額外預防措施：\n' +
               '   - 術前徹底清潔\n' +
               '   - 減少手術創傷\n' +
               '3. 定期追蹤';
      
      case '低風險':
        return '可進行常規治療，但需要：\n' +
               '1. 告知風險並簽署同意書\n' +
               '2. 維持良好口腔衛生\n' +
               '3. 定期追蹤';
    }
  }

  const assessments: RiskAssessment[] = [];
  
  // Calculate medication duration in months
  const getMedicationDuration = (): number => {
    if (!patientData.hasAntiresorptiveMed) return 0;
    
    const startDate = new Date(
      parseInt(patientData.startYear),
      parseInt(patientData.startMonth) - 1
    );
    
    const endDate = patientData.isStopped
      ? new Date(
          parseInt(patientData.stopYear),
          parseInt(patientData.stopMonth) - 1
        )
      : new Date();
    
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30)); // Convert to months
  };

  const medicationDuration = getMedicationDuration();
  
  // Risk factors
  const hasHighRiskFactors = 
    patientData.hasRadiotherapy ||
    patientData.hasCancer ||
    patientData.systemicDiseases.some((disease: string) => 
      ['糖尿病', '洗腎'].includes(disease)
    );

  const procedures: DentalProcedure[] = [
    '非侵入性治療',
    '拔牙',
    '牙周手術',
    '植牙',
    '根管治療'
  ];

  procedures.forEach(procedure => {
    let riskLevel: RiskLevel = '低風險';
    let recommendation = '';

    // Base risk assessment on medication type, duration, and risk factors
    if (patientData.hasAntiresorptiveMed) {
      if (procedure === '非侵入性治療') {
        riskLevel = '低風險';
        recommendation = '可進行治療，建議定期追蹤。';
      } else {
        // For invasive procedures
        if (medicationDuration > 36 || hasHighRiskFactors) {
          riskLevel = '高風險';
          recommendation = '建議轉診至醫學中心進行評估。需要特殊處理及術後密切追蹤。';
        } else if (medicationDuration > 12) {
          riskLevel = '中度風險';
          recommendation = '建議先諮詢原處方醫師，評估是否需要暫停用藥。需要特殊處理及術後追蹤。';
        } else {
          riskLevel = '低風險';
          recommendation = '可進行治療，但需要告知風險並簽署同意書。建議術後追蹤。';
        }
      }
    } else {
      riskLevel = '低風險';
      recommendation = '可進行一般治療。';
    }

    assessments.push({
      procedure,
      riskLevel,
      recommendation
    });
  });

  return assessments;
} 