import React, { useState } from 'react';
import { View, ScrollView, Pressable, Platform } from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../theme';
import { useApp } from '../../store';
import { Btn, Field, Logo, Row, T } from '../../components/ui';
import {
  ApiError,
  clearAuthTokens,
  completeSignup,
  loginWithGoogle,
  loginWithPassword,
  requestAuthOtp,
  verifyOtp as verifyOtpRequest,
} from '../../api';

const GOOGLE_WEB_CLIENT_ID = '591280470035-mamos86blk66gpr7bufpv48ln9dntsef.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

export function Auth({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { login, showToast, loadBrandProfile, loadCreatorProfile, initializeWorkspace } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>(route.params?.mode || 'login');
  const [role, setRole] = useState<'brand' | 'creator'>(route.params?.role === 'creator' ? 'creator' : 'brand');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<'credentials' | 'verify' | 'details'>('credentials');
  const [otp, setOtp] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [verifiedUser, setVerifiedUser] = useState<any>(null);
  const roleAccent = role === 'creator' ? C.creatorAccent : C.brandAccent;
  const getDestination = () => email.trim().toLowerCase();
  const validateEmail = (destination: string) => {
    if (!destination) {
      showToast('Enter your email address.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destination)) {
      showToast('Enter a valid email address.');
      return false;
    }
    return true;
  };

  const continueWithUser = async (user: any) => {
    const actualRole = user.role === 'creator' ? 'creator' : user.role === 'brand' ? 'brand' : role;
    if (actualRole !== role) {
      await clearAuthTokens();
      throw new Error(`This account belongs to a ${actualRole} workspace. Select the matching workspace.`);
    }
    if (user.needsOnboarding) {
      navigation.reset({
        index: 0,
        routes: [role === 'creator'
          ? {
              name: 'CreatorSetup',
              params: {
                initialName: user.fullName || user.full_name || '',
                phone: user.phone || user.mobile || '',
                user,
              },
            }
          : { name: 'Onboarding', params: { user } }],
      });
      return;
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
                phone: user.phone || user.mobile || '',
                user,
              },
            }
          : { name: 'Onboarding', params: { user } }],
      });
    }
  };

  const signInWithPassword = async () => {
    if (submitting) return;
    const destination = getDestination();
    if (!validateEmail(destination)) return;
    if (!password) return showToast('Enter your password.');
    setSubmitting(true);
    try {
      const session = await loginWithPassword(destination, password);
      await continueWithUser(session.user);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  const signInWithGoogle = async () => {
    if (submitting) return;
    if (Constants.executionEnvironment === 'storeClient') {
      showToast('Google sign-in requires the Linkloom development build. Open that app instead of Expo Go.');
      return;
    }
    setSubmitting(true);
    try {
      const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
      if (Platform.OS === 'ios' && !GOOGLE_IOS_CLIENT_ID) {
        throw new Error('Google sign-in needs an iOS OAuth client ID in this build.');
      }
      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        ...(GOOGLE_IOS_CLIENT_ID ? { iosClientId: GOOGLE_IOS_CLIENT_ID } : {}),
      });
      if (Platform.OS === 'android') await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      if (response.type === 'cancelled') return;
      if (response.type !== 'success') throw new Error('Google sign-in did not complete.');
      if (!response.data.idToken) throw new Error('Google did not return an ID token. Check the Web OAuth client configuration.');
      const session = await loginWithGoogle(response.data.idToken, role);
      await continueWithUser(session.user);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to sign in with Google.');
    } finally {
      setSubmitting(false);
    }
  };

  const requestCode = async () => {
    if (submitting) return;
    const destination = getDestination();
    if (!validateEmail(destination)) return;
    if (password.length < 8) return showToast('Choose a password with at least 8 characters.');
    setSubmitting(true);
    try {
      const response = await requestAuthOtp({ channel: 'email', destination });
      if (!response?.challengeId) throw new Error('The server did not return an OTP challenge. Please try again.');
      setChallengeId(response.challengeId);
      setStep('verify');
      setOtp('');
      showToast('Verification code sent by email.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to continue.');
    } finally {
      setSubmitting(false);
    }
  };

  const verifyOtp = async () => {
    if (submitting) return;
    if (!challengeId || !otp.trim()) {
      return showToast('Enter the verification code sent by email.');
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
      await continueWithUser(user);
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
      const response = await completeSignup({
        role,
        fullName: name.trim(),
        ...(role === 'brand' ? { brandName: companyName.trim() } : { displayName: name.trim() }),
        password,
        confirmPassword: password,
      });
      const responseUser = response?.user || response;
      const user = responseUser && typeof responseUser === 'object'
        ? { ...verifiedUser, ...responseUser }
        : verifiedUser;
      navigation.reset({
        index: 0,
        routes: [role === 'creator'
          ? {
              name: 'CreatorSetup',
              params: {
                initialName: name.trim(),
                phone: user.phone || user.mobile || '',
                user,
              },
            }
          : { name: 'Onboarding', params: { user } }],
      });
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to complete signup.');
    } finally {
      setSubmitting(false);
    }
  };

  const resendOtp = async () => {
    if (submitting) return;
    const destination = getDestination();
    if (!validateEmail(destination)) return;
    setSubmitting(true);
    try {
      const response = await requestAuthOtp({ channel: 'email', destination });
      if (!response?.challengeId) throw new Error('The server did not return an OTP challenge.');
      setChallengeId(response.challengeId);
      setOtp('');
      showToast('A new verification code was sent by email.');
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
            {['Email', 'Verify', 'Profile'].map((label, index) => {
              const activeIndex = step === 'credentials' ? 0 : step === 'verify' ? 1 : 2;
              return (
                <View key={label} style={{ flex: 1, gap: 5 }}>
                  <View style={{ height: 3, borderRadius: 2, backgroundColor: index <= activeIndex ? roleAccent : C.border }} />
                  <T size={9} w="med" color={index <= activeIndex ? C.text : C.muted3}>{label}</T>
                </View>
              );
            })}
          </Row>
        </View>
      ) : null}

      <View style={{ gap: 5 }}>
        <T size={28} w="bold" track={-0.7} color={C.text}>
          {step === 'verify'
            ? 'Check your inbox'
            : step === 'details' ? 'Tell us who you are' : mode === 'signup' ? 'Create account' : 'Welcome back'}
        </T>
        <T size={12} w="med" color={C.muted} style={{ lineHeight: 18 }}>
          {step === 'verify'
            ? `We sent a one-time code to ${getDestination()}.`
            : step === 'details'
              ? 'Your email is verified. Complete your profile to continue.'
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
            onChangeText={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter verification code"
            keyboardType="number-pad"
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
            <T size={11} w="med" color={C.muted}>Change email address</T>
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

          <Field
            label="Email address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'}
            secure
            secureToggle
          />
          <Btn
            label={submitting ? 'Please wait…' : mode === 'signup' ? 'Send verification code' : 'Sign in'}
            onPress={mode === 'signup' ? requestCode : signInWithPassword}
            loading={submitting}
            style={{ minHeight: 48 }}
          />
          <T size={10} w="med" color={C.muted} style={{ lineHeight: 15 }}>
            {mode === 'signup'
              ? 'We’ll email you a one-time verification code.'
              : 'Sign in with the password associated with your email address.'}
          </T>
          <Row style={{ gap: 10, alignItems: 'center' }}>
            <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
            <T size={10} w="med" color={C.muted}>OR</T>
            <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
          </Row>
          <Btn
            label={submitting ? 'Please wait…' : 'Continue with Google'}
            onPress={signInWithGoogle}
            variant="outline"
            icon="logo-google"
            loading={submitting}
            style={{ minHeight: 48 }}
          />
        </>
      )}

      {step === 'credentials' ? (
        <View style={{ gap: 12 }}>
          {mode === 'signup' ? (
            <T size={10} w="med" color={C.muted} style={{ textAlign: 'center', lineHeight: 15 }}>
              By continuing, you agree to Linkloom’s Terms of Service and Privacy Policy.
            </T>
          ) : null}
          <Pressable
            onPress={() => {
              setMode(mode === 'signup' ? 'login' : 'signup');
              setStep('credentials');
              setPassword('');
              setChallengeId('');
              setOtp('');
              setVerifiedUser(null);
            }}
            style={{ alignSelf: 'center', paddingVertical: 5 }}
          >
            <T size={11} w="med" color={C.muted}>
              {mode === 'signup' ? 'Have an account? ' : 'New to Linkloom? '}
              <T size={11} w="bold" color={C.text}>{mode === 'signup' ? 'Sign in' : 'Create account'}</T>
            </T>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}
