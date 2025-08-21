import commonTranslations from '../components/common/translations.json';
import { useLanguage } from '../contexts/LanguageContext';

export const useTranslation = (componentTranslations) => {
  const { currentLanguage, changeLanguage } = useLanguage();

  // Translation function that handles both component and common translations
  const t = (key, params = {}) => {
    // Check component translations first
    let translation = componentTranslations?.[currentLanguage]?.[key];
    
    // Fallback to common translations
    if (!translation) {
      translation = commonTranslations[currentLanguage]?.[key];
    }
    
    // Fallback to English if not found in current language
    if (!translation) {
      translation = componentTranslations?.en?.[key] || commonTranslations.en?.[key];
    }
    
    // Return key if no translation found
    if (!translation) {
      return key;
    }
    
    // Simple parameter replacement
    if (typeof translation === 'string' && Object.keys(params).length > 0) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{{${param}}}`, params[param]);
      });
    }
    
    return translation;
  };

  return {
    t,
    currentLanguage,
    changeLanguage
  };
};