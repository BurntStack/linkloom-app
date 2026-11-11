import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../theme';
import { useApp } from '../../store';
import { Btn, Field, Row, Select, T } from '../../components/ui';
import { type BrandOnboarding } from '../../api';

export function Onboarding({ route }: any) {
  const insets = useSafeAreaInsets();
  const { brandProfile, login, sessionUser, saveBrandOnboarding, initializeWorkspace, showToast } = useApp();
  const [brand, setBrand] = useState(brandProfile?.brandName || '');
  const [businessCategory, setBusinessCategory] = useState(brandProfile?.businessCategory || '');
  const [geographicalScope, setGeographicalScope] = useState(brandProfile?.geographicalScope || '');
  const [regionState, setRegionState] = useState(brandProfile?.regionState || '');
  const [city, setCity] = useState(brandProfile?.city || '');
  const [country, setCountry] = useState(brandProfile?.country || 'India');
  const [firstName, setFirstName] = useState(brandProfile?.firstName || '');
  const [lastName, setLastName] = useState(brandProfile?.lastName || '');
  const [phone, setPhone] = useState(brandProfile?.mobile || '');
  const [website, setWebsite] = useState(brandProfile?.brandWebsite || '');
  const [logo, setLogo] = useState(brandProfile?.brandLogo || '');
  const [legalName, setLegalName] = useState(brandProfile?.legalName || '');
  const [gstin, setGstin] = useState(brandProfile?.gstin || '');
  const [stateCode, setStateCode] = useState(brandProfile?.stateCode || '');
  const [billingAddress, setBillingAddress] = useState(brandProfile?.billingAddress || '');
  const [termsAccepted, setTermsAccepted] = useState(brandProfile?.termsAccepted || false);
  const [saving, setSaving] = useState(false);

  const go = async () => {
    if (saving) return;
    if (brand.trim().length < 2) return showToast('Brand name must be at least 2 characters');
    if (!businessCategory || !geographicalScope || !regionState.trim()) {
      return showToast('Complete the required brand category, location, and region fields');
    }
    if (!termsAccepted) return showToast('Accept the terms to continue');

    const profile: BrandOnboarding = {
      brandName: brand.trim(),
      businessCategory,
      geographicalScope,
      regionState: regionState.trim(),
      termsAccepted,
      ...(city.trim() ? { city: city.trim() } : {}),
      country: country.trim() || 'India',
      ...(firstName.trim() ? { firstName: firstName.trim() } : {}),
      ...(lastName.trim() ? { lastName: lastName.trim() } : {}),
      ...(phone.trim() ? { mobile: phone.trim() } : {}),
      ...(website.trim() ? { brandWebsite: website.trim() } : {}),
      ...(logo.trim() ? { brandLogo: logo.trim() } : {}),
      ...(legalName.trim() ? { legalName: legalName.trim() } : {}),
      ...(gstin.trim() ? { gstin: gstin.trim() } : {}),
      ...(stateCode.trim() ? { stateCode: stateCode.trim() } : {}),
      ...(billingAddress.trim() ? { billingAddress: billingAddress.trim() } : {}),
    };

    setSaving(true);
    try {
      const saved = await saveBrandOnboarding(profile);
      login('brand', route.params?.user || sessionUser, saved);
      await initializeWorkspace('brand');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to save your brand profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{
        padding: 20,
        paddingTop: insets.top + 16,
        gap: 14,
        paddingBottom: 36,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ gap: 4 }}>
        <T size={11} w="bold" color={C.primary} track={0.8}>BRAND PROFILE</T>
        <T size={26} w="semi" track={-0.7} color={C.text} style={{ fontFamily: 'Georgia' }}>
          Tell creators who you are
        </T>
        <T size={13} color={C.muted2} style={{ lineHeight: 19 }}>
          Creators see these details on your campaigns and invitations.
        </T>
      </View>

      <View style={{ gap: 11, padding: 14, borderRadius: 18, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border }}>
        <View style={{ gap: 3 }}>
          <T size={16} w="semi" color={C.text}>Brand basics</T>
          <T size={11.5} color={C.muted}>The details creators see first.</T>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: C.border2 }}>
          <View style={{ width: 48, height: 48, borderRadius: 15, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
            <T size={21} w="semi" color={C.primary} style={{ fontFamily: 'Georgia' }}>
              {brand.trim().charAt(0).toUpperCase() || 'B'}
            </T>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <T size={13} w="semi" color={C.text}>Brand logo</T>
            <T size={10.5} color={C.muted}>Add a public image URL below</T>
          </View>
          <Ionicons name="image-outline" size={18} color={C.muted2} />
        </View>
        <Field label="Brand name *" value={brand} onChangeText={setBrand} placeholder="e.g. Salt & Soil Foods" />
        <Field label="Website" value={website} onChangeText={setWebsite} placeholder="mybrand.com" keyboardType="url" />
        <Field label="Brand logo URL" value={logo} onChangeText={setLogo} placeholder="https://example.com/logo.png" keyboardType="url" />
      </View>

      <View style={{ gap: 11, padding: 14, borderRadius: 18, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border }}>
        <View style={{ gap: 3 }}>
          <T size={16} w="semi" color={C.text}>Business & location</T>
          <T size={11.5} color={C.muted}>Help creators understand your market.</T>
        </View>
        <Select
          label="Business category *"
          value={businessCategory || 'Select a category'}
          options={['Fashion & Style', 'Beauty & Personal Care', 'Health & Fitness', 'Food & Culinary', 'Home & Real Estate', 'Travel & Adventure']}
          onChange={setBusinessCategory}
        />
        <Select
          label="Geographical scope *"
          value={geographicalScope || 'Select a scope'}
          options={['Within City', 'Within State', 'Across Country', 'International']}
          onChange={setGeographicalScope}
        />
        <Field label="State / region *" value={regionState} onChangeText={setRegionState} placeholder="e.g. Maharashtra" />
        <Row style={{ gap: 10, alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Field label="City" value={city} onChangeText={setCity} placeholder="e.g. Mumbai" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Country" value={country} onChangeText={setCountry} placeholder="India" />
          </View>
        </Row>
      </View>

      <View style={{ gap: 11, padding: 14, borderRadius: 18, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border }}>
        <View style={{ gap: 3 }}>
          <T size={16} w="semi" color={C.text}>Contact person</T>
          <T size={11.5} color={C.muted}>Who creators can coordinate with.</T>
        </View>
        <Row style={{ gap: 10, alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Field label="First name" value={firstName} onChangeText={setFirstName} placeholder="e.g. Pooja" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Last name" value={lastName} onChangeText={setLastName} placeholder="e.g. Hegde" />
          </View>
        </Row>
        <Field label="Mobile number" value={phone} onChangeText={setPhone} placeholder="+91 98765 43210" keyboardType="phone-pad" />
      </View>

      <View style={{ gap: 11, padding: 14, borderRadius: 18, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border }}>
        <View style={{ gap: 3 }}>
          <T size={16} w="semi" color={C.text}>Billing details</T>
          <T size={11.5} color={C.muted}>Used for invoices and payment records.</T>
        </View>
        <Field label="Legal business name" value={legalName} onChangeText={setLegalName} placeholder="Registered legal name" />
        <Field label="GSTIN" value={gstin} onChangeText={setGstin} placeholder="Optional GSTIN" />
        <Field label="State code" value={stateCode} onChangeText={setStateCode} placeholder="State code for billing" />
        <Field label="Billing address" value={billingAddress} onChangeText={setBillingAddress} placeholder="Full billing address" multiline />
      </View>

      <Pressable
        onPress={() => setTermsAccepted((accepted) => !accepted)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: termsAccepted }}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 9, padding: 12, borderRadius: 14, backgroundColor: C.surfaceSoft }}
      >
        <Ionicons name={termsAccepted ? 'checkbox' : 'square-outline'} size={21} color={termsAccepted ? C.primary : C.muted} />
        <T size={12} color={C.muted} style={{ flex: 1 }}>
          I accept the terms and conditions. *
        </T>
      </Pressable>

      <Btn
        label={saving ? 'Saving profile…' : 'Continue'}
        onPress={go}
        loading={saving}
        style={{ minHeight: 54, borderRadius: 28, marginTop: 2 }}
      />
    </ScrollView>
  );
}
