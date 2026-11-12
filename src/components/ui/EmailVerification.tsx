import React, { useState } from 'react';
import { View } from 'react-native';
import { Btn, Card, Field, T } from './index';
import { requestEmailVerification, verifyEmail } from '../../api';
import { useApp } from '../../store';
import { C } from '../../theme';

export function EmailVerification() {
  const { sessionUser, refreshSessionUser, showToast } = useApp();
  const [email, setEmail] = useState(sessionUser?.email || '');
  const [code, setCode] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [busy, setBusy] = useState(false);

  const sendCode = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return showToast('Enter a valid email address.');
    setBusy(true);
    try {
      const response = await requestEmailVerification(email.trim());
      if (!response.challengeId) throw new Error('The server did not return an email verification challenge.');
      setChallengeId(response.challengeId);
      setCode('');
      showToast('Email verification code sent.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to send email verification code.');
    } finally {
      setBusy(false);
    }
  };

  const confirmCode = async () => {
    if (!challengeId || !/^\d{6}$/.test(code.trim())) return showToast('Enter the 6-digit email verification code.');
    setBusy(true);
    try {
      await verifyEmail(challengeId, code.trim());
      await refreshSessionUser();
      setChallengeId('');
      setCode('');
      showToast('Email verified.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to verify email.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card style={{ gap: 11, padding: 14 }}>
      <View style={{ gap: 3 }}>
        <T size={14} w="semi" color={C.text}>Email verification</T>
        <T size={11} color={C.muted}>
          {sessionUser?.emailVerified || sessionUser?.email_verified ? 'Your email is verified.' : 'Verify an email address for your account.'}
        </T>
      </View>
      <Field label="Email address" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
      {challengeId ? (
        <>
          <Field label="6-digit code" value={code} onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" placeholder="Enter code" maxLength={6} />
          <Btn label={busy ? 'Verifying…' : 'Verify email'} onPress={confirmCode} loading={busy} />
          <Btn label="Send a new code" variant="outline" onPress={sendCode} disabled={busy} />
        </>
      ) : <Btn label={busy ? 'Sending…' : 'Send verification code'} onPress={sendCode} loading={busy} />}
    </Card>
  );
}
