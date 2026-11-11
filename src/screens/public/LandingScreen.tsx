import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, BRAND } from '../../theme';
import { LogoMark, Row, T } from '../../components/ui';

export function Landing({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [slide, setSlide] = useState(0);
  const rolePicker = (mode: 'login' | 'signup') => navigation.navigate('RoleSelection', { mode });
  const slides = [
    { title: 'Two threads.', accent: 'One loom.', body: 'Creators and brands, tied by one clear deal — a brief, a price and a date. No guesswork.' },
    { title: 'Briefs in.', accent: 'Bids out.', body: 'Brands post a brief with a budget. Creators bid on the project and set their own price.' },
    { title: 'The money waits', accent: 'in escrow.', body: 'The brand pays the agreed price once the creator accepts. It is released on approval, and refunded if the work never comes.' },
  ];
  const goToRoles = () => rolePicker('signup');
  const currentSlide = slides[slide];

  return (
    <View style={{ flex: 1, backgroundColor: '#1D1D22', paddingTop: insets.top + 12, paddingBottom: Math.max(insets.bottom, 16) }}>
      <StatusBar style="light" />
      <Row style={{ justifyContent: 'space-between', paddingHorizontal: 22 }}>
        <Row style={{ gap: 3 }}>
          <LogoMark size={17} />
          <T size={14} w="semi" color="#FFFFFF" track={-0.4}>{BRAND.toLowerCase()}</T>
        </Row>
        {slide < slides.length - 1 ? (
          <Pressable onPress={goToRoles} hitSlop={10}>
            <T size={12} w="semi" color="#C9C9CF">Skip</T>
          </Pressable>
        ) : null}
      </Row>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 26 }}>
        {slide === 0 ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: 230 }}>
            <View style={{ position: 'absolute', width: 156, height: 1, backgroundColor: '#4A4852', transform: [{ rotate: '-22deg' }] }} />
            <LogoMark size={94} />
            <Row style={{ width: '82%', justifyContent: 'space-between', marginTop: 16 }}>
              <T size={10} color={C.creatorAccent}>creator</T>
              <T size={10} color={C.brandAccent}>brand</T>
            </Row>
          </View>
        ) : slide === 1 ? (
          <View style={{ width: '100%', alignItems: 'center', gap: 20 }}>
            <View style={{ alignSelf: 'flex-start', backgroundColor: '#2D2B37', borderRadius: 13, padding: 14, gap: 5, width: '82%' }}>
              <T size={10} color="#C9C6D3">Mira Sen · Skincare launch</T>
              <T size={18} w="bold" color="#FFFFFF">₹18,000</T>
              <T size={10} color="#C9C6D3">Reel + 2 stories · Due in 10 days</T>
            </View>
            <View style={{ alignSelf: 'flex-end', backgroundColor: '#393344', borderRadius: 13, padding: 12, width: '69%' }}>
              <T size={10} color="#E4DEFF">Your bid <T size={11} w="bold" color={C.cta}>Best</T></T>
              <T size={17} w="bold" color="#FFFFFF">₹18,000</T>
              <T size={10} color="#C9C6D3">Reel + 2 stories · 10 days</T>
            </View>
            <View style={{ position: 'absolute', right: 7, top: 53 }}>
              <Ionicons name="sparkles" size={22} color={C.cta} />
            </View>
          </View>
        ) : (
          <View style={{ width: '100%', alignItems: 'center', gap: 18 }}>
            <View style={{ width: 184, height: 160, alignItems: 'center', justifyContent: 'center' }}>
              <LogoMark size={106} />
              <View style={{ position: 'absolute', width: 46, height: 46, borderRadius: 23, backgroundColor: '#2B263B', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="lock-closed" size={20} color={C.cta} />
              </View>
            </View>
            <View style={{ backgroundColor: '#2D2B37', borderRadius: 20, paddingHorizontal: 17, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 7 }}>
              <Ionicons name="lock-closed" size={12} color="#F1EEFF" />
              <T size={12} w="semi" color="#F1EEFF">₹18,000 held in escrow</T>
            </View>
          </View>
        )}
      </View>

      <View style={{ paddingHorizontal: 22, gap: 14 }}>
        <View style={{ gap: 8 }}>
          <T size={28} w="semi" track={-0.7} color="#FFFFFF">{currentSlide.title}</T>
          <T size={28} w="semi" track={-0.7} color={C.creatorAccent}>{currentSlide.accent}</T>
          <T size={13} color="#B9B9C1" style={{ lineHeight: 20, marginTop: 2 }}>{currentSlide.body}</T>
        </View>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
          <Row style={{ gap: 5 }}>
            {slides.map((_, index) => (
              <View key={index} style={{ width: index === slide ? 20 : 6, height: 4, borderRadius: 2, backgroundColor: index === slide ? C.cta : '#5B5B63' }} />
            ))}
          </Row>
          <Pressable
            onPress={() => slide < slides.length - 1 ? setSlide(slide + 1) : goToRoles()}
            accessibilityRole="button"
            accessibilityLabel={slide < slides.length - 1 ? 'Next onboarding screen' : 'Get started'}
            style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: C.cta, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name={slide < slides.length - 1 ? 'arrow-forward' : 'arrow-forward'} size={21} color="#1D1D22" />
          </Pressable>
        </Row>
        <Pressable onPress={() => rolePicker('login')} style={{ alignSelf: 'center', paddingVertical: 5 }}>
          <T size={11} color="#B9B9C1">Already have an account? <T size={11} w="bold" color="#FFFFFF">Sign in</T></T>
        </Pressable>
      </View>
    </View>
  );
}
