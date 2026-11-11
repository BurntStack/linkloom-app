import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../theme';
import { useApp } from '../../store';
import { Btn, Field, Logo, Row, T } from '../../components/ui';
import {
  ApiError,
  clearAuthTokens,
  completeSignup,
  requestAuthOtp,
  verifyOtp as verifyOtpRequest,
  type AuthChannel,
} from '../../api';

export function Auth({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { login, showToast, loadBrandProfile, loadCreatorProfile, initializeWorkspace } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>(route.params?.mode || 'login');
  const [role, setRole] = useState<'brand' | 'creator'>(route.params?.role === 'creator' ? 'creator' : 'brand');
  const [channel, setChannel] = useState<AuthChannel>('sms');
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<'credentials' | 'verify' | 'details'>('credentials');
  const [otp, setOtp] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [verifiedUser, setVerifiedUser] = useState<any>(null);
  const roleAccent = role === 'creator' ? C.creatorAccent : C.brandAccent;

  const requestCode = async () => {
    if (submitting) return;
    const destination = identifier.trim();
    if (!destination) return showToast(channel === 'email' ? 'Enter your email address.' : 'Enter your mobile number.');
    if (channel === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destination)) {
      return showToast('Enter a valid email address.');
    }
    setSubmitting(true);
    try {
      const response = await requestAuthOtp({ channel, destination });
      if (!response?.challengeId) throw new Error('The server did not return an OTP challenge. Please try again.');
      setChallengeId(response.challengeId);
      setStep('verify');
      setOtp('');
      showToast(`Verification code sent by ${channel === 'email' ? 'email' : 'SMS'}.`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to continue.');
    } finally {
      setSubmitting(false);
    }
  };

  const verifyOtp = async () => {
    if (submitting) return;
    if (!challengeId || !otp.trim()) {
      return showToast(`Enter the verification code sent by ${channel === 'email' ? 'email' : 'SMS'}.`);
    }
    setSubmitting(true);
    try {
      const session = await verifyOtpRequest(challengeId, otp.trim());
      const user = session.user;
      if (mode === 'signup') {
        setVerifiedUser(user);
        setStep('details');
        return;
      }
      const actualRole = user.role === 'creator' ? 'creator' : user.role === 'brand' ? 'brand' : role;
      if (actualRole !== role) {
        await clearAuthTokens();
        throw new Error(`This ${channel === 'email' ? 'email address' : 'mobile number'} belongs to a ${actualRole} account. Select the matching workspace.`);
      }
      try {
        const profile = role === 'creator' ? await loadCreatorProfile() : await loadBrandProfile();
        login(role, user, profile);
        await initializeWorkspace(role, role === 'creator' ? (profile as any).creatorId : undefined);
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 404) throw error;
        navigation.reset({
          index: 0,
          routes: [role === 'creator'
            ? {
                name: 'CreatorSetup',
                params: {
                  initialName: user.fullName || user.full_name || '',
                  phone: user.mobile || user.phone || (channel === 'sms' ? identifier.trim() : ''),
                  user,
                },
              }
            : { name: 'Onboarding', params: { user } }],
        });
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to continue.');
    } finally {
      setSubmitting(false);
    }
  };

  const completeSignupDetails = async () => {
    if (submitting) return;
    if (!verifiedUser) return showToast('Verify your account before continuing.');
    if (name.trim().length < 2) return showToast('Enter your full name.');
    if (role === 'brand' && !companyName.trim()) return showToast('Enter your brand or company name.');
    setSubmitting(true);
    try {
      await completeSignup({
        role,
        fullName: name.trim(),
        ...(role === 'brand' ? { brandName: companyName.trim() } : { displayName: name.trim() }),
      });
      navigation.reset({
        index: 0,
        routes: [role === 'creator'
          ? {
              name: 'CreatorSetup',
              params: {
                initialName: name.trim(),
                phone: channel === 'sms' ? identifier.trim() : verifiedUser.mobile || verifiedUser.phone || '',
                user: verifiedUser,
              },
            }
          : { name: 'Onboarding', params: { user: verifiedUser } }],
      });
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to complete signup.');
    } finally {
      setSubmitting(false);
    }
  };

  const resendOtp = async () => {
    if (submitting) return;
    const destination = identifier.trim();
    if (!destination) return showToast('Enter your email address or mobile number first.');
    setSubmitting(true);
    try {
      const response = await requestAuthOtp({ channel, destination });
      if (!response?.challengeId) throw new Error('The server did not return an OTP challenge.');
      setChallengeId(response.challengeId);
      setOtp('');
      showToast(`A new verification code was sent by ${channel === 'email' ? 'email' : 'SMS'}.`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to resend the code.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: insets.top + 8,
        gap: 17,
        paddingBottom: Math.max(insets.bottom, 24),
      }}
      keyboardShouldPersistTaps="handled"
    >
      <Row style={{ justifyContent: 'space-between', minHeight: 40 }}>
        <Pressable
          onPress={() => navigation.canGoBack() && navigation.goBack()}
          hitSlop={10}
          style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </Pressable>
        <Logo size={15} />
        <View style={{ width: 36 }} />
      </Row>

      {mode === 'signup' ? (
        <View style={{ gap: 7 }}>
          <T size={10} w="semi" color={C.muted}>STEP {step === 'credentials' ? '1' : step === 'verify' ? '2' : '3'} OF 3</T>
          <Row style={{ gap: 4 }}>
            {['Contact', 'Verify', 'Profile'].map((label, index) => {
              const activeIndex = step === 'credentials' ? 0 : step === 'verify' ? 1 : 2;
              return (
                <View key={label} style={{ flex: 1, gap: 5 }}>
                  <View style={{ height: 3, borderRadius: 2, backgroundColor: index <= activeIndex ? roleAccent : C.border }} />
                  <T size={9} color={index <= activeIndex ? C.text : C.muted3}>{label}</T>
                </View>
              );
            })}
          </Row>
        </View>
      ) : null}

      <View style={{ gap: 5 }}>
        <T size={25} w="semi" track={-0.7} color={C.text}>
          {step === 'verify' ? 'Check your inbox' : step === 'details' ? 'Tell us who you are' : mode === 'signup' ? 'Create account' : 'Welcome back'}
        </T>
        <T size={12} color={C.muted} style={{ lineHeight: 18 }}>
          {step === 'verify'
            ? `We sent a one-time code to ${identifier.trim()}.`
            : step === 'details'
              ? `Your ${channel === 'email' ? 'email' : 'mobile number'} is verified. Complete your profile to continue.`
              : mode === 'signup'
                ? 'Create your Linkloom account to get started.'
                : 'Sign in to your Linkloom account.'}
        </T>
      </View>

      {step === 'verify' ? (
        <View style={{ gap: 12 }}>
          <Field
            label="6-digit code"
            value={otp}
            onChangeText={setOtp}
            placeholder="Enter verification code"
            keyboardType={channel === 'sms' ? 'number-pad' : 'default'}
            maxLength={6}
          />
          <Btn
            label={submitting ? 'Please wait…' : 'Verify code'}
            onPress={verifyOtp}
            loading={submitting}
            style={{ minHeight: 48 }}
          />
          <Pressable onPress={resendOtp} style={{ alignSelf: 'center', padding: 8 }}>
            <T size={11} w="semi" color={C.primary}>Resend code</T>
          </Pressable>
          <Pressable onPress={() => {
            setStep('credentials');
            setChallengeId('');
            setOtp('');
          }} style={{ alignSelf: 'center', padding: 4 }}>
            <T size={11} color={C.muted}>Change email or mobile number</T>
          </Pressable>
        </View>
      ) : step === 'details' ? (
        <View style={{ gap: 12 }}>
          <Field label="Full name" value={name} onChangeText={setName} placeholder="e.g. Priya Shah" />
          {role === 'brand' ? (
            <Field label="Brand name" value={companyName} onChangeText={setCompanyName} placeholder="e.g. Salt & Soil Foods" />
          ) : null}
          <Btn
            label={submitting ? 'Creating account…' : 'Continue'}
            onPress={completeSignupDetails}
            loading={submitting}
            style={{ minHeight: 48 }}
          />
        </View>
      ) : (
        <>
          <Row style={{ gap: 8 }}>
            {(['creator', 'brand'] as const).map((accountRole) => (
              <Pressable
                key={accountRole}
                onPress={() => setRole(accountRole)}
                style={{
                  flex: 1,
                  paddingVertical: 9,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: role === accountRole ? (accountRole === 'creator' ? C.creatorAccent : C.brandAccent) : C.border,
                  backgroundColor: role === accountRole ? (accountRole === 'creator' ? C.accentSoft : C.primaryLight) : C.surface,
                  alignItems: 'center',
                }}
              >
                <T size={11} w="semi" color={role === accountRole ? (accountRole === 'creator' ? C.creatorAccent : C.brandAccent) : C.muted}>
                  {accountRole === 'creator' ? "I'm a creator" : "I'm a brand"}
                </T>
              </Pressable>
            ))}
          </Row>

          <Row style={{ borderBottomWidth: 1, borderBottomColor: C.border, gap: 18 }}>
            {(['sms', 'email'] as const).map((method) => (
              <Pressable
                key={method}
                onPress={() => {
                  setChannel(method);
                  setIdentifier('');
                  setChallengeId('');
                }}
                style={{
                  paddingHorizontal: 2,
                  paddingVertical: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: channel === method ? roleAccent : 'transparent',
                }}
              >
                <T size={11} w="semi" color={channel === method ? C.text : C.muted}>
                  {method === 'sms' ? 'Mobile' : 'Email'}
                </T>
              </Pressable>
            ))}
          </Row>

          <Field
            label={channel === 'email' ? 'Email' : 'Mobile'}
            value={identifier}
            onChangeText={setIdentifier}
            placeholder={channel === 'email' ? 'you@example.com' : '+91 98765 43210'}
            keyboardType={channel === 'email' ? 'email-address' : 'phone-pad'}
          />
          <Btn
            label={submitting ? 'Sending code…' : mode === 'signup' ? 'Continue' : 'Send sign-in code'}
            onPress={requestCode}
            loading={submitting}
            style={{ minHeight: 48 }}
          />
          <T size={10} color={C.muted} style={{ lineHeight: 15 }}>
            We’ll send a one-time verification code to your {channel === 'email' ? 'email' : 'mobile number'}.
          </T>
        </>
      )}

      {step === 'credentials' ? (
        <View style={{ gap: 12 }}>
          {mode === 'signup' ? (
            <T size={10} color={C.muted} style={{ textAlign: 'center', lineHeight: 15 }}>
              By continuing, you agree to Linkloom’s Terms of Service and Privacy Policy.
            </T>
          ) : null}
          <Pressable
            onPress={() => {
              setMode(mode === 'signup' ? 'login' : 'signup');
              setStep('credentials');
              setChallengeId('');
              setOtp('');
              setVerifiedUser(null);
            }}
            style={{ alignSelf: 'center', paddingVertical: 5 }}
          >
            <T size={11} color={C.muted}>
              {mode === 'signup' ? 'Have an account? ' : 'New to Linkloom? '}
              <T size={11} w="bold" color={C.text}>{mode === 'signup' ? 'Sign in' : 'Create account'}</T>
            </T>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}
