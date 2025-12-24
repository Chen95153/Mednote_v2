
// Data model for the Timeline events
export interface TimelineEvent {
  id: string;
  date: string;
  dateType: 'date' | 'month';
  categorizedContent: Record<string, string>;
  otherInformation: string;
}

export interface PatientProfile {
  age: string;
  gender: 'male' | 'female' | '';
  underlying_diseases: string[];
  control_quality: string;
  management_modality: string;
  follow_up_status: string;
}

/**
 * Updated JSON structure sent to Gemini
 */
export interface MedicalRecordData {
  "patient_profile": {
    age: number;
    gender: string;
    informant: string;
    "underlying_disease": string[];
    control_status: {
      quality: string;
      modality: string;
      follow_up: string;
    }
  };
  "timepoints": Array<{
    date: string;
    vital_sign: string;
    symptom: string;
    negative_symptom: string;
    medical_facility: string;
    tentative_diagnosis: string;
    underlying_disease: string;
    definitive_diagnosis: string;
    physical_examination: string;
    lab_data: string;
    image_finding: string;
    treatment: string;
    other_information: string;
  }>;
}

export type MenuCategory = 
  | 'Vital Sign'
  | 'Symptom' 
  | 'Negative Symptom' 
  | 'Medical Facility'
  | 'Disease' 
  | 'Tentative Diagnosis' 
  | 'Underlying disease' 
  | 'Definitive diagnosis' 
  | 'Physical examination' 
  | 'Lab data' 
  | 'Image finding' 
  | 'Treatment'
  | 'Culture / Gram stain';

export interface MenuItem {
  category: MenuCategory;
  items: string[];
}
