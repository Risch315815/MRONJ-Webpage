import { PatientData } from '../store/patientData';

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

export function assessRisk(patientData: PatientData): RiskAssessment[] {
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