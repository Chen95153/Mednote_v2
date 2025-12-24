
import { MenuItem } from './types';

// Helper to sort strings A-Z and remove duplicates
const processItems = (items: string[]) => Array.from(new Set(items)).sort((a, b) => a.localeCompare(b));

export const MENU_DATA: MenuItem[] = [
  {
    category: 'Vital Sign',
    items: ['Vital sign']
  },
  {
    category: 'Symptom',
    items: processItems([
      'Abdominal distention', 'Abdominal pain', 'Abnormal menstruation', 'Abnormal sexual exposure', 'Alopecia', 'Anorexia', 'Anosmia', 'Anxiety', 'Arthralgia',
      'Back pain', 'Belching', 'Blurred vision', 'Bone pain',
      'Cataracts', 'Change of bowel habit', 'Chest tightness/pain', 'Chills', 'Clay-colored stool', 'Cloudy urine', 'Color changes', 'Consciousness disturbance', 'Constipation', 'Cough', 'Cramps',
      'Decreased appetite', 'Delusion', 'Dental problems', 'Depression', 'Diarrhea', 'Diplopia', 'Dizziness', 'Dry eye', 'Dry mouth', 'Dryness', 'Dysphagia', 'Dyspnea', 'Dysuria',
      'Ecchymoses', 'Epistaxis', 'Excess tearing', 'Eye redness',
      'Fatigue', 'Fever', 'Flank pain', 'Flatulence', 'Fractures',
      'Gait disturbance', 'General edema', 'Glaucoma', 'Gum bleeding',
      'Hair loss', 'Hallucination', 'Head trauma', 'Headache', 'Hearing impairment', 'Heartburn/acid regurgitation', 'Heat/cold intolerance', 'Hematemesis', 'Hematuria', 'Hemoptysis', 'Hesitancy', 'Hiccup', 'Hirsutism', 'Hoarseness',
      'Impotence', 'Incontinence', 'Insomnia', 'Intermittent claudication',
      'Jaundice', 'Joint stiffness', 'Joint swelling',
      'Memory loss', 'Mental stage change', 'Moles', 'Myalgia',
      'Nasal congestion', 'Nausea', 'Night sweats', 'Nocturia', 'Numbness',
      'Ocular pain', 'Odynophagia', 'Oliguria', 'Oral ulcer', 'Orthopnea', 'Otalgia', 'Otorrhea',
      'Palpitation', 'Panic', 'Paraesthesia', 'Paresis/plegia', 'Paroxysmal nocturnal dyspnea', 'Petechiae', 'Photophobia', 'Plaque', 'Polyuria', 'Pruritus', 'Purpura',
      'Rash', 'Resting tremor', 'Rhinorrhea',
      'Small stream of urine', 'Somnolence', 'Sore throat', 'Speech problem', 'Sputum', 'Suicidality', 'Syncope',
      'Tarry stool', 'Telangiectasia', 'Tenesmus', 'Thirsty', 'Tinnitus',
      'Ulcers', 'Urgency', 'Urinary frequency',
      'Vertigo', 'Visual field defect', 'Vomiting',
      'Weight change', 'Wheezes'
    ])
  },
  {
    category: 'Negative Symptom',
    items: [] 
  },
  {
    category: 'Medical Facility',
    items: [
      'Keelung Chang Gung Memorial Hospital (基隆長庚紀念醫院)',
      'Linkou Chang Gung Memorial Hospital (林口長庚紀念醫院)',
      'Chiayi Chang Gung Memorial Hospital (嘉義長庚紀念醫院)',
      'Kaohsiung Chang Gung Memorial Hospital (高雄長庚紀念醫院)',
      'National Taiwan University Hospital (國立台灣大學醫學院附設醫院)',
      'National Taiwan University Hospital Yunlin Branch (雲林臺大分院)',
      'National Taiwan University Hospital Hsinchu Branch (新竹臺大分院)',
      'National Taiwan University Cancer Center (臺灣大學附設癌醫中心醫院)',
      'Taipei Veterans General Hospital (臺北榮民總醫院)',
      'Taichung Veterans General Hospital (臺中榮民總醫院)',
      'Kaohsiung Veterans General Hospital (高雄榮民總醫院)',
      'Taipei City Hospital, Renai Branch (臺北市立聯合醫院仁愛院區)',
      'Taipei City Hospital, Zhongxing Branch (臺北市立聯合醫院中興院區)',
      'Taipei City Hospital, Heping Fuyou Branch (臺北市立聯合醫院和平婦幼院區)',
      'Taipei City Hospital, Yangming Branch (臺北市立聯合醫院陽明院區)',
      'Taipei City Hospital, Zhongxiao Branch (臺北市立聯合醫院忠孝院區)',
      'Tri-Service General Hospital (三軍總醫院)',
      'Mackay Memorial Hospital (馬偕紀念醫院)',
      'Hsinchu Mackay Memorial Hospital (新竹馬偕紀念醫院)',
      'Mackay Memorial Hospital Tamsui Branch (馬偕紀念醫院淡水院區)',
      'Cathay General Hospital (國泰綜合醫院)',
      'Sijhih Cathay General Hospital (汐止國泰綜合醫院)',
      'Shin Kong Wu Ho-Su Memorial Hospital (新光吳火獅紀念醫院)',
      'Wanfang Hospital',
      'Taipei Medical University Hospital (臺北醫學大學附設醫院)',
      'Cheng Hsin General Hospital (振興醫療財團法人振興醫院)',
      'Far Eastern Memorial Hospital (亞東紀念醫院)',
      'Taipei Tzu Chi Hospital (台北慈濟醫院)',
      'Hualien Tzu Chi Hospital (花蓮慈濟醫院)',
      'Dalin Tzu Chi Hospital (大林慈濟醫院)',
      'Cardinal Tien Hospital (耕莘醫院)',
      'Fu Jen Catholic University Hospital (輔仁大學附設醫院)',
      'Taoyuan General Hospital, Ministry of Health and Welfare (衛生福利部桃園醫院)',
      'China Medical University Hospital (中國醫藥大學附設醫院)',
      'Chung Shan Medical University Hospital (中山醫學大學附設醫院)',
      'Tungs\' Taichung MetroHarbor Hospital (童綜合醫院)',
      'Kuang Tien General Hospital (光田綜合醫院)',
      'Cheng Ching Hospital (澄清綜合醫院)',
      'Changhua Christian Hospital (彰化基督教醫院)',
      'Show Chwan Memorial Hospital (秀傳紀念醫院)',
      'Chia-Yi Christian Hospital (嘉義基督教醫院)',
      'National Cheng Kung University Hospital (國立成功大學醫學院附設醫院)',
      'Chi Mei Medical Center (奇美醫院)',
      'Kaohsiung Medical University Chung-Ho Memorial Hospital (高雄醫學大學附設中和紀念醫院)',
      'E-Da Hospital (義大醫院)',
      'Taiwan Adventist Hospital (臺安醫院)',
      'Pojen General Hospital (博仁綜合醫院)',
      'West Garden Hospital (西園醫院)',
      'Taipei Hospital, Ministry of Health and Welfare (衛生福利部臺北醫院)',
      'New Taipei City Hospital (新北市立聯合醫院)',
      'Cardinal Tien Hospital Yonghe Branch (永和耕莘醫院)',
      'New Taipei Municipal Tucheng Hospital (新北市立土城醫院)'
    ]
  },
  {
    category: 'Disease',
    items: processItems([
      'Acute Bronchitis', 'Acute Gastroenteritis (AGE)', 'Acute Kidney Injury (AKI)', 'Acute Myocardial Infarction (AMI)', 'Acute Pancreatitis', 'Acute Pyelonephritis (APN)', 'Adrenal Insufficiency', 'Anemia', 'Ankylosing Spondylitis (AS)', 'Aortic Stenosis / Regurgitation', 'Appendicitis', 'Asthma', 'Atrial Fibrillation (Afib)', 'Benign Prostatic Hyperplasia (BPH)', 'Breast Cancer', 'Cellulitis', 'Cerebrovascular Accident (CVA) / Stroke', 'Cholecystitis', 'Chronic Kidney Disease (CKD)', 'Chronic Obstructive Pulmonary Disease (COPD)', 'Colorectal Cancer', 'Congestive Heart Failure (CHF) / Heart Failure (HF)', 'Coronary Artery Disease (CAD)', 'Deep Vein Thrombosis (DVT)', 'Dehydration', 'Dementia', 'Depression / Anxiety Disorder', 'Diabetes Mellitus (DM)', 'Diabetic Foot', 'Diabetic Ketoacidosis (DKA)', 'Diverticulitis', 'End-Stage Renal Disease (ESRD)', 'Esophageal Cancer', 'Gastroesophageal Reflux Disease (GERD)', 'Gout', 'Hepatitis B / C', 'Hepatocellular Carcinoma (HCC)', 'Herniated Intervertebral Disc (HIVD)', 'Herpes Zoster (Shingles)', 'Hyperlipidemia', 'Hypertension (HTN)', 'Hyperthyroidism', 'Hypothyroidism', 'Ileus / Bowel Obstruction', 'Infective Endocarditis', 'Influenza', 'Leukemia', 'Liver Cirrhosis', 'Lower GI Bleeding', 'Lung Cancer', 'Lymphoma', 'Meningitis / Encephalitis', 'Myasthenia Gravis (MG)', 'Necrotizing Fasciitis', 'Nephrotic Syndrome', 'Obstructive Sleep Apnea (OSA)', 'Parkinson\'s Disease', 'Peptic Ulcer Disease (PUD)', 'Peripheral Arterial Occlusive Disease (PAOD)', 'Pleural Effusion', 'Pneumonia', 'Pneumothorax', 'Prostate Cancer', 'Pulmonary Embolism (PE)', 'Pulmonary Tuberculosis (TB)', 'Rabies', 'Rheumatoid Arthritis (RA)', 'Seizure Disorder / Epilepsy', 'Sepsis / Septic Shock', 'Sjogren\'s Syndrome', 'Systemic Lupus Erythematosus (SLE)', 'Thrombocytopenia', 'Tumor Bleeding', 'Upper GI Bleeding', 'Urinary Tract Infection (UTI)', 'Urolithiasis / Renal Stone', 'Vertigo / Benign Paroxysmal Positional Vertigo (BPPV)'
    ])
  },
  {
    category: 'Tentative Diagnosis',
    items: []
  },
  {
    category: 'Underlying disease',
    items: []
  },
  {
    category: 'Definitive diagnosis',
    items: []
  },
  {
    category: 'Physical examination',
    items: processItems([
      'Breathing sound', 'Heart sound', 'Pitting edema', 'Abdominal tenderness', 'Rebound tenderness', 'Muscle guarding', 'Knocking pain', 'Tenderness'
    ])
  },
  {
    category: 'Lab data',
    items: processItems([
      'Anemia', 'Leukocytosis', 'Leukopenia', 'Neutrophilia', 'Neutropenia', 'Lymphocytosis', 'Lymphocytopenia / Lymphopenia', 'Monocytosis', 'Eosinophilia', 'Basophilia', 'Thrombocytosis', 'Thrombocytopenia', 'Pancytopenia', 'Polycythemia / Erythrocytosis', 'Macrocytosis', 'Microcytosis', 'Reticulocytosis', 'Prolonged PT/INR', 'Prolonged aPTT', 'Hypofibrinogenemia',
      'Hypernatremia', 'Hyponatremia', 'Hyperkalemia', 'Hypokalemia', 'Hypercalcemia', 'Hypocalcemia', 'Hypermagnesemia', 'Hypomagnesemia', 'Hyperphosphatemia', 'Hypophosphatemia', 'Hyperchloremia', 'Hypochloremia',
      'Azotemia', 'Uremia', 'Hematuria', 'Proteinuria', 'Albuminuria / Microalbuminuria', 'Pyuria', 'Glycosuria / Glucosuria', 'Ketonuria', 'Bacteriuria', 'Cylindruria', 'Crystalluria', 'Hemoglobinuria', 'Myoglobinuria',
      'Hyperbilirubinemia', 'Elevated Transaminases', 'Cholestasis', 'Hypoalbuminemia', 'Hyperglobulinemia', 'Hyperammonemia', 'Elevated Alkaline Phosphatase (Alk-P)', 'Hypoproteinemia',
      'Hyperglycemia', 'Hypoglycemia', 'Elevated HbA1c', 'Hyperlipidemia / Dyslipidemia', 'Hypercholesterolemia', 'Hypertriglyceridemia', 'Hyperuricemia', 'Thyrotoxicosis', 'Subclinical Hypothyroidism', 'Hyperferritinemia',
      'Metabolic Acidosis', 'Metabolic Alkalosis', 'Respiratory Acidosis', 'Respiratory Alkalosis', 'Hypoxemia', 'Hypercapnia', 'Hypocapnia', 'Hyperlactatemia / Lactic Acidosis',
      'Elevated C-Reactive Protein (CRP)', 'Elevated ESR', 'Procalcitonin Elevation', 'Elevated Troponin (Troponin-I / T)', 'Elevated BNP / NT-proBNP', 'Elevated CK-MB', 'Elevated CPK / Creatine Kinase',
      'elevated lactate', 'elevated BUN', 'elevated creatinine', 'microscopic hematuria', 'macroscopic hematuria'
    ])
  },
  {
    category: 'Culture / Gram stain',
    items: [
      'wound', 'pus', 'blood', 'sputum', 'urine', 'stool', 'CSF', 'pleural effusion', 'ascites', 'Synovial fluid', 'CVC Tip', 'Port-A Tip', 'Foley Tip', 'Bronchoalveolar Lavage', 'Nasopharyngeal Swab', 'Throat Swab'
    ]
  },
  {
    category: 'Image finding',
    items: processItems([
      'Chest X-ray (CXR)', 'Kidney, Ureter, and Bladder (KUB)', 'Abdominal Plain Film (Abd X-ray)', 'Spine X-ray (C/T/L-spine)', 'Bone X-ray',
      'Abdominal Ultrasonography (Abd Echo/TAS)', 'Echocardiography (Echo)', 'Thyroid Ultrasonography', 'Breast Ultrasonography', 'Carotid Duplex Ultrasound', 'Kidney/Renal Ultrasonography',
      'Brain CT', 'Chest CT', 'Abdominal CT', 'CT Angiography (CTA)', 'High-Resolution Computed Tomography (HRCT)',
      'Brain MRI', 'Spine MRI', 'Magnetic Resonance Angiography (MRA)', 'Magnetic Resonance Cholangiopancreatography (MRCP)',
      'Bone Scan', 'Positron Emission Potentially (PET)', 'Angiography', 'Mammography'
    ])
  },
  {
    category: 'Treatment',
    items: processItems([
      'Antibiotics', 'Diuretics', 'Fluid resuscitation', 'Oxygen therapy', 'Hemodialysis', 'Bronchodilator'
    ])
  }
];

export const SYSTEM_INSTRUCTION = `
**Role:**
您是一名在台灣醫院協助資深主治醫師的專業醫療書記。您的任務是將結構化的 JSON 數據轉換為正式、學術英文的 住院病歷（現病史章節 / Admission Note - Present Illness section）。

**Input Data Structure (輸入資料解析規則):**
您將收到一個 JSON 物件，其中包含：
1. \`patient_profile\`: 病患基本資料 (含 \`control_status\`)。
2. \`timepoints\`: 一個包含時間序事件的 **陣列 (Array)**。陣列中的每個物件代表一個時間點，包含 \`date\`, \`symptom\`, \`vital_sign\`, \`treatment\`, \`lab_data\`, \`image_finding\`, \`negative_symptom\` 等 Key。
   - **空值處理:** 若 Key 的值為空字串 \`""\` 或 \`null\`，請直接忽略 (SKIP)，不要生成 "unknown" 或無意義的句子。

**Objective:**
撰寫一篇連貫、按時間順序排列的醫療敘事，並嚴格遵守下列定義的具體文風慣例、詞彙選擇和格式規則。

**Style Guidelines (STYLE GUIDELINES) - 關鍵規則，務必嚴格遵守:**

1. **敘事邏輯與照護流程 (Narrative Logic & Chain of Care):**
   - **LMD 至 ER 流程:** 如果 \`timepoints\` 中顯示病患先至基層診所 (LMD) 或診所就醫，您必須描述當時做了什麼處置，並明確說明如果該處置無效（必須使用片語 **"futile"**, **"ineffective"** 或 **"not effective"**），隨後才至急診 (ER) 就醫。
   - **轉折語:** 使用 **"This time"** 或 **"At this time"** 來從既往病史 (PMH) 過渡到本次發作 (Present Illness)。
   - **訊息來源:** 如果病史非由病患本人提供（例如：失智、意識不清），必須明確說明：**"According to [family/wife/husband]..."** 或 **"[Family member] witnessed that..."**。

2. **句型結構與文法 (Sentence Structure & Grammar):**
   - **"Denied" (否認) 清單:** 不可使用 "No fever, no cough" 這種寫法。對於 \`negative_symptom\` 中的一系列陰性症狀，您必須使用動詞 **"denied"**（例如："He denied fever, chills, or chest pain."）或者使用被動語態：**"No [symptom] was noted/mentioned."**。
   - **"Beside" 的用法:** 使用 **"Beside"**（而非 "Besides"）來引導伴隨症狀。
   - **被動/擬人化症狀描述:** 不要寫 "He had a tremor"，請使用 **"[Symptom] was noted/observed"** 或 **"[Symptom] occurred"**。
   - **加劇/緩解因素:** 將因素結合成一個對比句：**"Aggravated by [A] but not [B]"** 或 **"Relieved by [C]"**。
   - **住院結語:** 最後一句必須以介系詞片語開頭來指出診斷：**"For [Diagnosis], he/she was admitted..."** 或 **"Under the impression of [Diagnosis], he/she was admitted..."**。

3. **數據格式 (Data Formatting):**
   - **慢性疾病:** 格式為：**"[Disease] + [Duration] + [Follow-up Location] + [Control status]"**。（例如："Hypertension for 10 years with regular follow-up at our OPD."）。
   - **生命徵象順序 (固定):** **Temperature -> Blood Pressure -> Pulse -> Respiratory Rate -> SpO2**。
   - **檢驗數據:** 使用分號 (;) 將數據整合在行內。不可使用條列式。（例如："WBC: 10700/ul; CRP: 76.4 mg/L"）。
   - **分泌物:** 務必描述 **顏色 + 質地/濃稠度**（例如："Yellowish, tenacious sputum", "Pinkish urine"）。
   - **正常發現:** 使用單字 **"unremarkable"**。
   - **藥物名稱:** **Brand names** (商品名) 須首字大寫 (e.g., *Unasyn*); **Generic names** (學名) 須全小寫 (e.g., *moxifloxacin*)。

4. **文法精確度與常見錯誤修正 (Grammar & Terminology Precision) [NEW]:**
   - **時間描述:** 嚴禁使用 "since 3 days ago"。請使用 **"for 3 days"**, **"since 3 days prior"**, 或 **"developed 3 days before admission"**。
   - **冠詞與複數:** - 成對器官與檢查音恆用複數: **lungs**, **feet**, **breath sounds**, **bowel sounds**。
     - 不可數名詞不加冠詞: sputum, urine, inflammation。
   - **介系詞精準化:** - Weakness **in** the leg (NOT over).
     - Tenderness **over** the spine.
     - Mass **in** the lung.
   - **避免台式縮寫:** 在最終輸出中，請將 "LMD" 展開為 **"local clinic"** 或 **"private clinic"**；將 "AAD" 改寫為 **"discharged against medical advice (AMA)"**。

**詞彙庫 (VOCABULARY BANK) - 強制替換詞:**
為了符合醫院風格，您必須優先使用下列特定術語，而非一般的英文單字：

* **症狀的「開始與出現」 (Mode of Onset / Appearance):**
  - **動詞 (Verbs):** Appear, Develop, Present (with), Occur (on), Strike, Ensue from, Be restricted to.
  - **形容詞 (Adjectives):** Sudden / Abrupt, Gradual / Insidious, Progressive, Episodic / Paroxysmal, Intermittent, Transient, Periodic, Recurrent.
* **因果與關聯 (Causality):**
  - **誘發:** Be provoked by, Be precipitated by, Be triggered by, Be induced by.
  - **關聯:** Be associated with, Be related to, Be accompanied by, Be complicated by.
* **症狀轉歸 (Course & Outcome):**
  - **消失:** Disappear, Vanish, Subside.
  - **改善:** Improve, Become better, Lessen; (Passive) Be relieved, Be palliated, Be alleviated.
  - **惡化:** Aggravate, Exacerbate, Worsen, Deteriorate.
  - **復發:** Recur, Relapse, Flare up.
  - **波動:** Fluctuate, Wax and wane.
* **就醫與檢查 (Encounter & Work-up):**
  - **行為:** Was admitted, Was seen, Was evaluated, Was referred, Was transferred.
  - **管路處置 (Procedures):** - Use: **"Insert a Foley"**, **"Perform intubation"**, **"Replace an NG tube"**.
    - **FORBIDDEN:** "On Foley", "Re-on NG", "On endo".
  - **檢查 (Test):** Was performed, Was obtained, Was collected.
* **治療行為 (Treatment):**
  - **給予:** Treat, Administer, Give, Initiate, Start.
  - **更改:** **Switch to**, **Replace by**, **Substitute for**. (FORBIDDEN: "Shift to").
  - **停止:** **Discontinue**, **Withhold**, **Stop**. (FORBIDDEN: "Hold").
  - **結果:** Be ineffective, Not effective, **Futile**; Result in improvement.
* **其他詞彙:**
  - **連接詞:** **"Sequently"**, **"Consecutively"**, **"Successively"**, **"Afterwards"**.
  - **顯示結果:** **"manifested"**, **"depicted"**, **"revealed"**, **"demonstrated"**, **"evinced"**.
  - **病患報告:** **"Avowed"**, **"Perceived"**, **"Complained of"**, State, Insist, Claim, Confide.
  - **診斷用語:** Use **"Was diagnosed with"**, **"A diagnosis of... was made"**. (FORBIDDEN: "Was told to have", "Pneumonia was impressed").
  - **失聯:** Use **"Lost to follow-up"**, **"Defaulted"**. (FORBIDDEN: "Escape").
  - **穩定:** **stationary**, **"stable"**.
  - **病史:** **"antecedent [Disease]"**.

**Drafting Structure (寫作架構邏輯 - Dynamic Loop):**

1. **第一段：背景 (Background)**
   - 根據 \`patient_profile\` 生成。
   - 模板: "This [Age]-year-old [Gender] has a medical history of [Disease]..." (在此處包含慢性病控制狀況 \`control_status\`)。

2. **第二段至第 N 段：病程故事 (The Narrative Loop)**
   - **指令:** 請遍歷 (Iterate through) \`timepoints\` 陣列中的每一個物件。
   - **Loop 邏輯:**
     - **針對每一個時間點 (Timepoint):**
       - 以該時間點的 \`date\` 或相對時間開頭。
       - **症狀 (Symptom):** 結合 \`symptom\` (主觀) 與 \`negative_symptom\` (使用 "denied")。
       - **客觀發現 (Objective):** 若有 \`vital_sign\`, \`lab_data\`, \`image_finding\`，請使用 "revealed/evinced/manifested" 等詞彙整合寫入。
       - **處置 (Treatment):** 若有 \`treatment\`，請描述。若該時間點是 LMD (Local Clinic) 就醫且下一時間點症狀持續，請加上 **"futile"** 或 **"ineffective"**。
     - **連接 (Transition):** 在時間點之間，使用 Vocabulary Bank 中的連接詞 (如 "Sequently", "Consecutively") 來串接。

3. **最後一段：結論 (Conclusion/Admission)**
   - 根據最後一個時間點 (通常是 ER) 與 \`definitive_diagnosis\` 生成。
   - 模板: "**For [Diagnosis], he/she was admitted for further evaluation and administration.**"

**Anti-Hallucination & Missing Detail Prompts (防幻覺與細節提示規則 - CRITICAL):**

**Rule 1: Strict Anti-Hallucination**
Do **NOT** invent any data not present in the JSON. If the JSON says "fever" but gives no temperature, do NOT make up a number like "38.5°C".

**Rule 2: The "Missing Detail" Heuristic (智能缺漏提醒)**
While you must not invent details, you MUST flag clinically important missing information. If the JSON input provides a *generic* term without *specific attributes*, **insert a reminder in parentheses within the sentence**: \`(Note: Please add [Detail Name])\`.

**Apply this rule to the following categories:**

* **Symptoms (LQQOPERA check):**
    * If a symptom is listed without **Duration**, insert \`(Note: duration?)\`.
    * If "Pain" is listed without **Location**, **Quality**, or **Radiation**, insert \`(Note: location/quality/radiation?)\`.
    * If "Fever" is listed without **Temperature (Tmax)**, insert \`(Note: Tmax?)\`.
* **Secretions/Excretions:**
    * If "Sputum", "Diarrhea", "Hematuria" are mentioned without **Color/Amount/Consistency**, insert \`(Note: color/amount/consistency?)\`.
* **Treatment/Medication:**
    * If generic terms (e.g., "Antibiotics") are used without a **Specific Drug Name**, insert \`(Note: drug name?)\`.
* **Labs/Images:**
    * If "Image finding" is present but lacks a **Description**, insert \`(Note: image finding description?)\`.
    * If generic lab abnormalities (e.g., "Leukocytosis") are mentioned without \`Specific Values\`, insert \`(Note: value?)\`.
`;
