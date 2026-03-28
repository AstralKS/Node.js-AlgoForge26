/**
 * Sample WhatsApp-style patient messages for testing AI integration
 * Simulates real patient messages that would come from WhatsApp
 */

export const SAMPLE_WHATSAPP_MESSAGES = [
  {
    from: '+919876543210',
    message: 'Doctor sahab I am feeling very tired since 3 days. My body temperature is also high around 101F. Having headache and body pain also. Took paracetamol yesterday but not much relief.',
    expected_type: 'symptom',
  },
  {
    from: '+919876543210',
    message: 'Good morning. My BP reading today is 140/90. Sugar fasting was 180. Feeling a bit dizzy when I stand up.',
    expected_type: 'biometric',
  },
  {
    from: '+919876543210',
    message: 'Took my morning medicines - metformin 500mg and amlodipine 5mg. But I skipped the evening dose yesterday because I felt nauseous.',
    expected_type: 'medication_update',
  },
  {
    from: '+919876543210',
    message: 'I have been having chest pain since last night. It gets worse when I breathe deeply. Should I go to the hospital?',
    expected_type: 'symptom',
  },
  {
    from: '+919876543210',
    message: 'My weight today is 78kg. I have been walking 30 minutes daily as doctor advised. Feeling better overall but still have joint pain in knees.',
    expected_type: 'biometric',
  },
];

/**
 * Sample patient data for seeding / testing
 */
export const SAMPLE_PATIENTS = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '+919876543210',
    date_of_birth: '1965-05-15',
    gender: 'male',
    blood_group: 'B+',
    medical_history: 'Type 2 Diabetes (diagnosed 2018), Hypertension (diagnosed 2020)',
    current_diagnosis: 'Type 2 Diabetes Mellitus, Essential Hypertension',
    whatsapp_number: '+919876543210',
  },
  {
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+919876543211',
    date_of_birth: '1980-11-22',
    gender: 'female',
    blood_group: 'A+',
    medical_history: 'Asthma (childhood), Thyroid (2019)',
    current_diagnosis: 'Hypothyroidism, Chronic Asthma',
    whatsapp_number: '+919876543211',
  },
  {
    name: 'Amit Patel',
    email: 'amit@example.com',
    phone: '+919876543212',
    date_of_birth: '1955-03-08',
    gender: 'male',
    blood_group: 'O+',
    medical_history: 'Heart attack (2022), Angioplasty (2022), High cholesterol',
    current_diagnosis: 'Post-MI, Dyslipidemia',
    whatsapp_number: '+919876543212',
  },
];

export const SAMPLE_DOCTORS = [
  {
    name: 'Dr. Meera Iyer',
    email: 'dr.meera@example.com',
    phone: '+919876543200',
    specialization: 'Internal Medicine',
    license_number: 'MH-12345',
    hospital: 'City General Hospital',
  },
  {
    name: 'Dr. Arjun Nair',
    email: 'dr.arjun@example.com',
    phone: '+919876543201',
    specialization: 'Cardiology',
    license_number: 'MH-67890',
    hospital: 'Heart Care Institute',
  },
];

/**
 * Sample symptoms data
 */
export const SAMPLE_SYMPTOMS = [
  {
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    description: 'Persistent headache on the right side, throbbing pain. Severity increases in the evening.',
    severity: 6,
    source: 'whatsapp' as const,
  },
  {
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    description: 'Feeling fatigued and drowsy throughout the day. Difficulty concentrating at work.',
    severity: 5,
    source: 'whatsapp' as const,
  },
  {
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    description: 'Mild chest discomfort after climbing stairs. Lasted about 5 minutes then went away.',
    severity: 7,
    source: 'manual' as const,
  },
];

/**
 * Sample biometric readings
 */
export const SAMPLE_BIOMETRICS = [
  { type: 'bp' as const, value: '140/90', unit: 'mmHg', timestamp: new Date(Date.now() - 1 * 86400000).toISOString() },
  { type: 'bp' as const, value: '135/85', unit: 'mmHg', timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
  { type: 'glucose' as const, value: '180', unit: 'mg/dL', timestamp: new Date(Date.now() - 1 * 86400000).toISOString() },
  { type: 'glucose' as const, value: '165', unit: 'mg/dL', timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
  { type: 'heart_rate' as const, value: '82', unit: 'bpm', timestamp: new Date(Date.now() - 1 * 86400000).toISOString() },
  { type: 'weight' as const, value: '78', unit: 'kg', timestamp: new Date(Date.now() - 1 * 86400000).toISOString() },
  { type: 'temperature' as const, value: '101', unit: '°F', timestamp: new Date(Date.now() - 1 * 86400000).toISOString() },
  { type: 'spo2' as const, value: '96', unit: '%', timestamp: new Date(Date.now() - 1 * 86400000).toISOString() },
];
