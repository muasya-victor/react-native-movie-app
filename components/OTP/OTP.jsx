// components/OTP/OTP.jsx - Safe version with error handling
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

// Import translations directly
import translations from './translations.json';

// Safe navigation hook
const useSafeRouter = () => {
  try {
    const { useRouter } = require("expo-router");
    return useRouter();
  } catch (error) {
    console.warn('Router not available:', error);
    return {
      back: () => console.log('Back navigation'),
      replace: (path) => console.log('Navigate to:', path),
      push: (path) => console.log('Push to:', path)
    };
  }
};

// Safe translation hook
const useSafeTranslation = (componentTranslations) => {
  try {
    const { useTranslation } = require('../../hooks/useTranslation');
    return useTranslation(componentTranslations);
  } catch (error) {
    console.warn('Translation context not available, using fallback');
    
    // Fallback translation function
    const t = (key) => {
      return componentTranslations?.en?.[key] || key;
    };
    
    return {
      t,
      currentLanguage: 'en',
      changeLanguage: () => {},
      isLoading: false
    };
  }
};

export default function OTPComponent() {
  const router = useSafeRouter();
  const { t } = useSafeTranslation(translations);
  
  const [code, setCode] = useState(["", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(59);
  const inputRefs = useRef([]);
  const scrollViewRef = useRef();


  const user_role = 'wage_worker' // site_admin , site_manager

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleCodeChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleInputFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: 200,
        animated: true,
      });
    }, 100);
  };

  const handleVerify = () => {
    const verificationCode = code.join("");
    if (verificationCode.length === 4) {
      console.log("Verification code:", verificationCode);
      try {
        router.replace("/(tabs)");
      } catch (error) {
        console.error('Navigation failed:', error);
      }
    }
  };

  const handleResend = () => {
    setTimeLeft(59);
    setCode(["", "", "", ""]);
    console.log("Resending code...");
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: 'white' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 16, 
        paddingTop: 48, 
        paddingBottom: 16 
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Text style={{ fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <Text style={{ 
          fontSize: 20, 
          fontWeight: '600', 
          textAlign: 'center', 
          flex: 1, 
          marginRight: 32 
        }}>
          {t('verification')}
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1, paddingHorizontal: 24 }}
        contentContainerStyle={{ 
          flexGrow: 1,
          paddingBottom: 50 
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Image */}
        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <Image 
            source={require('../../assets/images/login.jpg')}
            style={{ width: '100%', height: 224 }}
            resizeMode="contain"
          />
        </View>

        {/* Content Section */}
        <View style={{ flex: 1 }}>
          {/* Title */}
          <Text style={{ 
            fontSize: 24, 
            fontWeight: 'bold', 
            color: 'black', 
            marginBottom: 16, 
            textAlign: 'center' 
          }}>
            {t('enterTheCode')}
          </Text>

          {/* Subtitle */}
          <Text style={{ 
            color: '#6b7280', 
            fontSize: 16, 
            marginBottom: 32, 
            textAlign: 'center' 
          }}>
            {t('verificationSent')}
          </Text>

          {/* Code Input Fields */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            width: '100%', 
            marginBottom: 32, 
            paddingHorizontal: 8 
          }}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={{
                  width: 64,
                  height: 64,
                  borderWidth: 0.8,
                  borderColor: digit ? '#10b981' : '#d1d5db',
                  borderRadius: 8,
                  textAlign: 'center',
                  fontSize: 20,
                  fontWeight: 'bold',
                  backgroundColor: 'white',

                }}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                onFocus={handleInputFocus}
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Timer */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'center', 
            alignItems: 'center', 
            marginBottom: 32 
          }}>
            <View style={{ alignItems: 'center', marginHorizontal: 12 }}>
              <View style={{ 
                backgroundColor: '#f3f4f6', 
                paddingHorizontal: 16, 
                paddingVertical: 12, 
                borderRadius: 8, 
                minWidth: 60 
              }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>00</Text>
              </View>
              <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>
                {t('hours')}
              </Text>
            </View>
            
            <Text style={{ color: '#9ca3af', fontSize: 20, marginHorizontal: 8 }}>:</Text>
            
            <View style={{ alignItems: 'center', marginHorizontal: 12 }}>
              <View style={{ 
                backgroundColor: '#f3f4f6', 
                paddingHorizontal: 16, 
                paddingVertical: 12, 
                borderRadius: 8, 
                minWidth: 60 
              }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>00</Text>
              </View>
              <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>
                {t('minutes')}
              </Text>
            </View>
            
            <Text style={{ color: '#9ca3af', fontSize: 20, marginHorizontal: 8 }}>:</Text>
            
            <View style={{ alignItems: 'center', marginHorizontal: 12 }}>
              <View style={{ 
                backgroundColor: '#fed7aa', 
                paddingHorizontal: 16, 
                paddingVertical: 12, 
                borderRadius: 12, 
                minWidth: 60 
              }}>
                <Text style={{ 
                  fontSize: 20, 
                  fontWeight: 'bold', 
                  textAlign: 'center', 
                  color: '#ea580c' 
                }}>
                  {timeLeft.toString().padStart(2, "0")}
                </Text>
              </View>
              <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>
                {t('seconds')}
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Section */}
        <View style={{ marginTop: 'auto' }}>
          {/* Verify Button */}
          <TouchableOpacity
            style={{
              backgroundColor: code.join("").length === 4 ? '#10b981' : '#d1d5db',
              borderRadius: 50,
              paddingVertical: 16,
              marginBottom: 16,
              shadowColor: code.join("").length === 4 ? '#10b981' : 'transparent',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
            onPress={handleVerify}
            disabled={code.join("").length !== 4}
          >
            <Text style={{ 
              color: 'white', 
              textAlign: 'center', 
              fontSize: 14, 
              fontWeight: '400' 
            }}>
              {t('verify')}
            </Text>
          </TouchableOpacity>

          {/* Resend Link */}
          <TouchableOpacity onPress={handleResend} style={{ paddingVertical: 8 }}>
            <Text style={{ 
              textAlign: 'center', 
              color: '#10b981', 
              fontSize: 14, 
              fontWeight: '400' 
            }}>
              {t('didntReceiveResend')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}