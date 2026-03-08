// Internationalization (i18n) support for multilingual conversations
// Supports English, Hindi, and Tamil

export type Language = 'en' | 'hi' | 'ta';

export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English' },
  hi: { name: 'Hindi', nativeName: 'हिंदी' },
  ta: { name: 'Tamil', nativeName: 'தமிழ்' },
};

// Common phrases translations
export const translations: Record<Language, Record<string, string>> = {
  en: {
    welcome: 'Welcome to our appointment booking system',
    hello: 'Hello',
    goodbye: 'Thank you for using our service. Goodbye!',
    language_detected: 'Language detected as English',
    please_provide_details: 'Please provide your details',
    appointment_booked: 'Your appointment has been booked successfully',
    appointment_cancelled: 'Your appointment has been cancelled',
    no_slots_available: 'Sorry, no slots are available for the requested date',
    please_try_another_date: 'Please try another date',
    confirm_appointment: 'Please confirm your appointment details',
    appointment_confirmed: 'Appointment confirmed!',
    contact_support: 'Please contact support for assistance',
    invalid_phone: 'Invalid phone number. Please provide a valid number',
    patient_not_found: 'Patient not found. Would you like to register?',
    enter_phone_number: 'Please enter your phone number',
    select_date: 'Please select a date for your appointment',
    select_time: 'Please select a time for your appointment',
    processing: 'Processing your request...',
    error_occurred: 'An error occurred. Please try again.',
    session_expired: 'Your session has expired. Please start a new conversation.',
    language_preference_saved: 'Language preference saved',
    upcoming_appointments: 'Your upcoming appointments:',
    no_upcoming: 'You have no upcoming appointments',
    cancel_appointment: 'Cancel this appointment',
    reschedule: 'Reschedule this appointment',
    new_registration: 'New Patient Registration',
    register: 'Register',
    login: 'Login',
    logout: 'Logout',
  },
  hi: {
    welcome: 'हमारी अपॉइंटमेंट बुकिंग सिस्टम में स्वागत है',
    hello: 'नमस्ते',
    goodbye: 'हमारी सेवा का उपयोग करने के लिए धन्यवाद। अलविदा!',
    language_detected: 'भाषा हिंदी के रूप में पहचानी गई',
    please_provide_details: 'कृपया अपने विवरण प्रदान करें',
    appointment_booked: 'आपकी अपॉइंटमेंट सफलतापूर्वक बुक हो गई है',
    appointment_cancelled: 'आपकी अपॉइंटमेंट रद्द कर दी गई है',
    no_slots_available: 'क्षमा करें, अनुरोधित तारीख के लिए कोई स्लॉट उपलब्ध नहीं है',
    please_try_another_date: 'कृपया दूसरी तारीख आजमाएं',
    confirm_appointment: 'कृपया अपनी अपॉइंटमेंट का विवरण पुष्टि करें',
    appointment_confirmed: 'अपॉइंटमेंट की पुष्टि हुई!',
    contact_support: 'सहायता के लिए कृपया समर्थन से संपर्क करें',
    invalid_phone: 'अमान्य फोन नंबर। कृपया एक मान्य नंबर प्रदान करें',
    patient_not_found: 'रोगी नहीं मिला। क्या आप पंजीकरण करना चाहते हैं?',
    enter_phone_number: 'कृपया अपना फोन नंबर दर्ज करें',
    select_date: 'कृपया अपनी अपॉइंटमेंट के लिए एक तारीख चुनें',
    select_time: 'कृपया अपनी अपॉइंटमेंट के लिए एक समय चुनें',
    processing: 'आपके अनुरोध को संसाधित किया जा रहा है...',
    error_occurred: 'एक त्रुटि हुई। कृपया फिर से प्रयास करें।',
    session_expired: 'आपके सेशन की समय सीमा समाप्त हो गई है। कृपया एक नई बातचीत शुरू करें।',
    language_preference_saved: 'भाषा वरीयता सहेजी गई',
    upcoming_appointments: 'आपकी आने वाली अपॉइंटमेंट:',
    no_upcoming: 'आपके पास कोई आने वाली अपॉइंटमेंट नहीं है',
    cancel_appointment: 'इस अपॉइंटमेंट को रद्द करें',
    reschedule: 'इस अपॉइंटमेंट को फिर से शेड्यूल करें',
    new_registration: 'नए रोगी का पंजीकरण',
    register: 'पंजीकरण करें',
    login: 'लॉगिन करें',
    logout: 'लॉगआउट करें',
  },
  ta: {
    welcome: 'எங்கள் சந்திப்பு முன்பதிவு முறைமையில் வரவேற்கிறோம்',
    hello: 'வணக்கம்',
    goodbye: 'எங்கள் சேவையை பயன்படுத்தியதற்கு நன்றி. வடகோடி!',
    language_detected: 'தமிழ் மொழியாக கண்டறியப்பட்டது',
    please_provide_details: 'தயவுசெய்து உங்கள் விவரங்களை வழங்கவும்',
    appointment_booked: 'உங்கள் சந்திப்பு வெற்றிகரமாக முன்பதிவு செய்யப்பட்டுள்ளது',
    appointment_cancelled: 'உங்கள் சந்திப்பு ரத்து செய்யப்பட்டுள்ளது',
    no_slots_available: 'மன்னிக்கவும், கோரப்பட்ட தேதியில் இடம் கிடைக்கவில்லை',
    please_try_another_date: 'தயவுசெய்து மற்றொரு தேதியை முயற்சி செய்யவும்',
    confirm_appointment: 'தயவுசெய்து உங்கள் சந்திப்பு விவரங்களை உறுதிப்படுத்தவும்',
    appointment_confirmed: 'சந்திப்பு உறுதிப்படுத்தப்பட்டுள்ளது!',
    contact_support: 'உதவிக்கு தயவுசெய்து ஆதரவுடன் தொடர்பு கொள்ளவும்',
    invalid_phone: 'தவறான தொலைபேசி எண். தயவுசெய்து செல்லுபடியாகும் எண்ணை வழங்கவும்',
    patient_not_found: 'நோயாளி கண்டறியப்படவில்லை. நீங்கள் பதிவு செய்ய விரும்புகிறீர்களா?',
    enter_phone_number: 'தயவுசெய்து உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்',
    select_date: 'தயவுசெய்து உங்கள் சந்திப்புக்கு ஒரு தேதி தேர்ந்தெடுக்கவும்',
    select_time: 'தயவுசெய்து உங்கள் சந்திப்புக்கு ஒரு நேரத்தை தேர்ந்தெடுக்கவும்',
    processing: 'உங்கள் கோரிக்கை செயல்படுத்தப்படுகிறது...',
    error_occurred: 'ஒரு பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சி செய்யவும்.',
    session_expired: 'உங்கள் அமர்வு முடிந்துவிட்டது. தயவுசெய்து புதிய உரையாடலைத் தொடங்கவும்.',
    language_preference_saved: 'மொழி விருப்பம் சேமிக்கப்பட்டுள்ளது',
    upcoming_appointments: 'உங்கள் வரவிருக்கும் சந்திப்புகள்:',
    no_upcoming: 'உங்களுக்கு வரவிருக்கும் சந்திப்புகள் எதுவுமில்லை',
    cancel_appointment: 'இந்த சந்திப்பை ரத்து செய்யவும்',
    reschedule: 'இந்த சந்திப்பை மீண்டும் அட்டவணைக்க வேண்டும்',
    new_registration: 'புதிய நோயாளி பதிவு',
    register: 'பதிவு செய்யவும்',
    login: 'உள்நுழைக',
    logout: 'வெளியேறு',
  },
};

/**
 * Get translation for a key in a specific language
 */
export function t(key: string, language: Language = 'en'): string {
  return translations[language]?.[key as keyof typeof translations.en] ||
    translations.en[key as keyof typeof translations.en] ||
    key;
}

/**
 * Get all translations for a language
 */
export function getLanguageTranslations(language: Language): Record<string, string> {
  return translations[language] || translations.en;
}

/**
 * Format a message with translations
 */
export function formatMessage(
  template: string,
  variables: Record<string, string | number>,
  language: Language = 'en'
): string {
  let message = t(template, language);
  Object.forEach((key, value) => {
    message = message.replace(`{${key}}`, String(value));
  });
  return message;
}

/**
 * Get language display name
 */
export function getLanguageName(language: Language): string {
  return SUPPORTED_LANGUAGES[language]?.name || 'Unknown';
}

/**
 * Get language native name
 */
export function getLanguageNativeName(language: Language): string {
  return SUPPORTED_LANGUAGES[language]?.nativeName || 'Unknown';
}

/**
 * Create language preference object
 */
export function createLanguagePreference(language: Language): {
  code: Language;
  name: string;
  nativeName: string;
} {
  return {
    code: language,
    name: getLanguageName(language),
    nativeName: getLanguageNativeName(language),
  };
}

// Language-specific API endpoint strings
export const apiStrings: Record<Language, Record<string, string>> = {
  en: {
    api_key: 'en-US',
    locale: 'en_US',
    region: 'US',
  },
  hi: {
    api_key: 'hi-IN',
    locale: 'hi_IN',
    region: 'IN',
  },
  ta: {
    api_key: 'ta-IN',
    locale: 'ta_IN',
    region: 'IN',
  },
};
