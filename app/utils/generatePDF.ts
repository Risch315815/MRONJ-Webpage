import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Platform, Alert } from 'react-native';
import { PatientData } from '../store/patientData';
import { assessRisk } from './riskAssessment';

const generateHTML = (patientData: PatientData) => {
  const riskAssessments = assessRisk(patientData);
  const today = new Date().toLocaleDateString('zh-TW');
  
  return `
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: sans-serif; padding: 20px; }
          h1 { color: #007AFF; text-align: center; }
          .section { margin: 20px 0; }
          .assessment { 
            border: 1px solid #ccc; 
            padding: 15px; 
            margin: 10px 0; 
            border-radius: 5px;
          }
          .risk-high { color: #FF3B30; }
          .risk-medium { color: #FF9500; }
          .risk-low { color: #34C759; }
        </style>
      </head>
      <body>
        <h1>MRONJ風險評估報告</h1>
        <div class="section">
          <h2>基本資料</h2>
          <p>姓名: ${patientData.name}</p>
          <p>生日: ${patientData.birthYear}年${patientData.birthMonth}月${patientData.birthDay}日</p>
          <p>身分證字號: ${patientData.idNumber}</p>
          <p>評估日期: ${today}</p>
        </div>

        <div class="section">
          <h2>病史資料</h2>
          <p>全身性疾病: ${patientData.systemicDiseases.join('、') || '無'}</p>
          <p>放射治療病史: ${patientData.hasRadiotherapy ? '有' : '無'}</p>
          ${patientData.hasRadiotherapy ? `<p>詳情: ${patientData.radiotherapyDetails}</p>` : ''}
          <p>腫瘤病史: ${patientData.hasCancer ? '有' : '無'}</p>
          ${patientData.hasCancer ? `<p>詳情: ${patientData.cancerHistory}</p>` : ''}
        </div>

        <div class="section">
          <h2>用藥紀錄</h2>
          ${patientData.hasAntiresorptiveMed ? `
            <p>藥物名稱: ${patientData.drugName}</p>
            <p>使用方式: ${patientData.administrationRoute}</p>
            <p>使用原因: ${patientData.indication}</p>
            <p>開始時間: ${patientData.startYear}年${patientData.startMonth}月</p>
            <p>使用頻率: ${patientData.frequency}</p>
            ${patientData.isStopped ? 
              `<p>停藥時間: ${patientData.stopYear}年${patientData.stopMonth}月</p>` : 
              '<p>目前持續使用中</p>'
            }
          ` : '<p>無使用相關藥物</p>'}
        </div>

        <div class="section">
          <h2>風險評估結果</h2>
          ${riskAssessments.map(assessment => `
            <div class="assessment">
              <h3>${assessment.procedure}</h3>
              <p class="risk-${assessment.riskLevel === '高風險' ? 'high' : 
                            assessment.riskLevel === '中度風險' ? 'medium' : 'low'}">
                風險程度: ${assessment.riskLevel}
              </p>
              <p>建議: ${assessment.recommendation}</p>
            </div>
          `).join('')}
        </div>
      </body>
    </html>
  `;
};

export const generateAndSavePDF = async (patientData: PatientData) => {
  try {
    // Generate HTML content
    const htmlContent = generateHTML(patientData);
    
    // Generate PDF file
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false
    });

    const pdfName = `MRONJ風險評估報告_${patientData.name}_${new Date().getTime()}.pdf`;

    if (Platform.OS === 'android') {
      // For Android: Use sharing
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: '儲存評估報告',
          UTI: 'com.adobe.pdf'
        });
      }
    } else {
      // For iOS: Save to app's documents directory
      const savePath = `${FileSystem.documentDirectory}${pdfName}`;
      await FileSystem.copyAsync({
        from: uri,
        to: savePath
      });
      Alert.alert(
        '儲存成功',
        `報告已儲存至您的裝置\n檔案名稱: ${pdfName}\n位置: 我的檔案/Documents`
      );
    }

    // Clean up the temporary file
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch (error) {
    console.error('Error generating PDF:', error);
    Alert.alert('錯誤', '儲存報告時發生錯誤');
    throw error;
  }
}; 