import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Btn, Card, Field, Row, Select, Sheet, T } from '../../components/ui';
import type { KycStatusSnapshot } from '../../api/types';
import type { KycDocumentFile } from '../../api/uploads';
import { C } from '../../theme';
import { useApp } from '../../store';

type KycDraft = {
  pan?: string;
  nameOnPan?: string;
  idType?: 'aadhaar' | 'passport' | 'driving_licence' | 'voter_id';
  idDocument?: KycDocumentFile;
  accountHolderName?: string;
  accountNumber?: string;
  ifsc?: string;
};

const ID_TYPES: KycDraft['idType'][] = ['aadhaar', 'passport', 'driving_licence', 'voter_id'];

function isIdType(value: string): value is KycDraft['idType'] {
  return ID_TYPES.some((idType) => idType === value);
}

export function KycSheetHost() {
  const { kycOpen, kycStatus, kycLoading, closeKyc, submitKyc, refreshKycStatus, showToast } = useApp();

  useEffect(() => {
    if (kycOpen) {
      refreshKycStatus().catch((error: unknown) => {
        showToast(error instanceof Error ? error.message : 'Unable to refresh your KYC status.');
      });
    }
  }, [kycOpen, refreshKycStatus, showToast]);

  return (
    <KycSheet
      visible={kycOpen}
      submission={kycStatus}
      loading={kycLoading}
      onClose={closeKyc}
      onSubmit={submitKyc}
      showToast={showToast}
    />
  );
}

export function KycSheet({
  visible,
  submission,
  loading,
  onClose,
  onSubmit,
  showToast,
}: {
  visible: boolean;
  submission: KycStatusSnapshot | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (draft: KycDraft) => Promise<KycStatusSnapshot>;
  showToast: (message: string) => void;
}) {
  const [nameOnPan, setNameOnPan] = useState('');
  const [pan, setPan] = useState('');
  const [idType, setIdType] = useState<KycDraft['idType']>('aadhaar');
  const [idDocument, setIdDocument] = useState<KycDocumentFile | null>(null);
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [saving, setSaving] = useState(false);
  const locked = submission?.status === 'pending' || submission?.status === 'verified';
  const statusAvailable = Boolean(submission);

  useEffect(() => {
    setNameOnPan('');
    setPan('');
    const savedIdType = submission?.id.maskedValue;
    setIdType(savedIdType && isIdType(savedIdType) ? savedIdType : 'aadhaar');
    setIdDocument(null);
    setAccountHolderName('');
    setAccountNumber('');
    setIfsc('');
  }, [visible]);

  useEffect(() => {
    const savedIdType = submission?.id.maskedValue;
    if (submission?.id.completed && savedIdType && isIdType(savedIdType)) {
      setIdType(savedIdType);
    }
  }, [submission?.id.completed, submission?.id.maskedValue]);

  const chooseDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) return;
      const selected = result.assets[0];
      if (selected.size !== undefined && selected.size > 10 * 1024 * 1024) {
        showToast('KYC documents must be 10 MB or smaller.');
        return;
      }
      setIdDocument({
        uri: selected.uri,
        name: selected.name,
        mimeType: selected.mimeType,
        size: selected.size,
      });
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to choose your identity document.');
    }
  };

  const submit = async () => {
    const hasPanInput = Boolean(nameOnPan.trim() || pan.trim());
    const hasBankInput = Boolean(accountHolderName.trim() || accountNumber.trim() || ifsc.trim());
    const idTypeChanged = submission?.id.completed && idType !== submission.id.maskedValue;

    if (hasPanInput || !submission?.pan.completed) {
      if (nameOnPan.trim().length < 2) return showToast('Enter your full legal name.');
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.trim().toUpperCase())) {
        return showToast('Enter a valid 10-character PAN number.');
      }
    }

    if (idDocument || idTypeChanged || !submission?.id.completed) {
      if (!idDocument) return showToast('Choose your government ID document.');
    }

    if (hasBankInput || !submission?.bank.completed) {
      if (accountHolderName.trim().length < 2) return showToast('Enter the bank account-holder name.');
      if (!/^\d{9,18}$/.test(accountNumber.trim())) {
        return showToast('Enter a valid bank account number.');
      }
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.trim().toUpperCase())) {
        return showToast('Enter a valid 11-character IFSC code.');
      }
    }

    setSaving(true);
    try {
      const next = await onSubmit({
        ...(hasPanInput ? { nameOnPan: nameOnPan.trim(), pan: pan.trim().toUpperCase() } : {}),
        ...(idDocument ? { idType, idDocument } : {}),
        ...(hasBankInput ? {
          accountHolderName: accountHolderName.trim(),
          accountNumber: accountNumber.trim(),
          ifsc: ifsc.trim().toUpperCase(),
        } : {}),
      });
      showToast(next.status === 'pending' ? 'KYC submitted for Ops verification.' : `KYC status: ${next.status.replace(/_/g, ' ')}.`);
      onClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to submit your KYC details.');
    } finally {
      setSaving(false);
    }
  };

  const statusLabel = submission?.status === 'verified'
    ? 'Your account is verified.'
    : submission?.status === 'pending'
      ? 'Your KYC is under review. Editing is locked until the review is complete.'
      : submission?.status === 'rejected'
        ? 'Update the rejected details and resubmit for review.'
        : 'Complete each step and submit your details for Ops review.';

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={submission?.status === 'verified' ? 'KYC verified' : 'KYC verification'}
      sub={statusLabel}
      footer={locked || loading || !statusAvailable ? (
        <Btn label="Close" variant="outline" flex disabled={saving} onPress={onClose} />
      ) : (
        <Row style={{ gap: 8 }}>
          <Btn label="Cancel" variant="outline" flex disabled={saving} onPress={onClose} />
          <Btn label={saving ? 'Submitting…' : 'Submit for review'} flex disabled={saving} onPress={submit} />
        </Row>
      )}
    >
      {loading ? (
        <Card><T size={12} color={C.muted}>Refreshing your KYC status…</T></Card>
      ) : !statusAvailable ? (
        <Card style={{ gap: 5 }}>
          <T size={12} w="semi" color={C.text}>KYC status unavailable</T>
          <T size={11} color={C.muted}>Your details are locked until the current server status can be loaded. Close this form and retry when online.</T>
        </Card>
      ) : (
        <>
          {submission?.rejectionReason ? (
            <Card style={{ gap: 4, backgroundColor: C.redBg }}>
              <T size={12} w="semi" color={C.red}>Update required</T>
              <T size={12} color={C.text}>{submission.rejectionReason}</T>
            </Card>
          ) : null}
          <Card style={{ gap: 10 }}>
            <StepProgress label="PAN details" progress={submission?.pan} />
            <StepProgress label="Government ID" progress={submission?.id} />
            <StepProgress label="Bank account" progress={submission?.bank} />
          </Card>
          {locked ? (
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
              <Ionicons name={submission.status === 'verified' ? 'checkmark-circle' : 'time-outline'} size={19} color={submission.status === 'verified' ? C.green : C.amber} />
              <T size={12} color={C.text} style={{ flex: 1, lineHeight: 18 }}>{statusLabel}</T>
            </Card>
          ) : (
            <>
              <Field label="Full name on PAN" value={nameOnPan} onChangeText={setNameOnPan} placeholder="As shown on your PAN card" maxLength={100} />
              <Field
                label="PAN number"
                value={pan}
                onChangeText={(value) => setPan(value.replace(/\s/g, '').toUpperCase().slice(0, 10))}
                placeholder="ABCDE1234F"
                maxLength={10}
              />
              <Select label="Government ID type" value={idType} options={ID_TYPES} onChange={(value) => {
                if (isIdType(value)) setIdType(value);
              }} />
              <DocumentButton
                label={idDocument?.name || 'Choose government ID document'}
                onPress={chooseDocument}
              />
              <Field
                label="Bank account-holder name"
                value={accountHolderName}
                onChangeText={setAccountHolderName}
                placeholder="As shown on your bank account"
                maxLength={100}
              />
              <Field
                label="Bank account number"
                value={accountNumber}
                onChangeText={(value) => setAccountNumber(value.replace(/\D/g, '').slice(0, 18))}
                placeholder="Enter account number"
                keyboardType="number-pad"
                secure
              />
              <Field
                label="IFSC code"
                value={ifsc}
                onChangeText={(value) => setIfsc(value.replace(/\s/g, '').toUpperCase().slice(0, 11))}
                placeholder="ABCD0123456"
                maxLength={11}
              />
              <T size={10.5} color={C.muted} style={{ lineHeight: 16 }}>
                Supported document formats: JPG, PNG, WebP, or PDF. Maximum file size: 10 MB.
              </T>
            </>
          )}
        </>
      )}
    </Sheet>
  );
}

function StepProgress({ label, progress }: { label: string; progress?: KycStatusSnapshot['pan'] }) {
  return (
    <Row style={{ alignItems: 'center', gap: 8 }}>
      <Ionicons name={progress?.completed ? 'checkmark-circle' : 'ellipse-outline'} size={17} color={progress?.completed ? C.green : C.muted3} />
      <T size={12} w="med" color={C.text} style={{ flex: 1 }}>{label}</T>
      <T size={10.5} color={progress?.completed ? C.green : C.muted}>
        {progress?.completed ? progress.maskedValue || 'Complete' : 'Not complete'}
      </T>
    </Row>
  );
}

function DocumentButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{ minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: C.border, borderRadius: 12, backgroundColor: C.surface }}
    >
      <Ionicons name="cloud-upload-outline" size={19} color={C.primary} />
      <T size={12} w="semi" color={C.text} numberOfLines={1} style={{ flex: 1 }}>{label}</T>
      <Ionicons name="chevron-forward" size={15} color={C.muted2} />
    </Pressable>
  );
}

export function KycProfileCard({
  submission,
  loading,
  onPress,
}: {
  submission: KycStatusSnapshot | null;
  loading: boolean;
  onPress: () => void;
}) {
  const verified = submission?.status === 'verified';
  const statusText = loading
    ? 'Refreshing status…'
    : !submission
      ? 'Status unavailable'
      : verified
        ? 'Verified'
        : submission.status === 'rejected'
          ? 'Update required'
          : submission.status === 'pending'
            ? 'Under verification'
            : `${Number(submission.pan.completed) + Number(submission.id.completed) + Number(submission.bank.completed)} of 3 steps complete`;
  const statusColor = verified ? C.green : submission?.status === 'rejected' ? C.red : C.muted;
  const actionLabel = submission?.status === 'pending' || verified
    ? 'View KYC status'
    : submission?.status === 'in_progress' || submission?.status === 'rejected'
      ? 'Continue KYC'
      : 'Complete KYC';

  return (
    <Card style={{ gap: 10 }}>
      <Row style={{ alignItems: 'center', gap: 8 }}>
        <Ionicons name={verified ? 'checkmark-circle' : 'shield-checkmark-outline'} size={18} color={statusColor} />
        <View style={{ flex: 1, gap: 2 }}>
          <T size={13} w="semi" color={C.text}>KYC &amp; verification</T>
          <T size={11} w="med" color={statusColor}>{statusText}</T>
        </View>
        {verified ? <T size={10} w="bold" color={C.green}>VERIFIED</T> : null}
      </Row>
      {submission?.rejectionReason ? (
        <T size={10.5} color={C.red} style={{ lineHeight: 16 }}>{submission.rejectionReason}</T>
      ) : null}
      <Btn
        label={actionLabel}
        icon={verified ? 'checkmark-circle-outline' : 'shield-checkmark-outline'}
        variant="outline"
        disabled={loading}
        onPress={onPress}
      />
    </Card>
  );
}
