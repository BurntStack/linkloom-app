import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, inr } from '../../../theme';
import { useApp } from '../../../store';
import { Btn, Card, Field, Row, Select, Sheet, T } from '../../../components/ui';
import { PLATFORMS } from '../../../data';
import type { CampaignUsageRights } from '../../../data';
import {
  DURATION_VALUES,
  formatCampaignUsageRights,
  parseCampaignDeadline,
  USAGE_CHANNELS,
  USAGE_DURATIONS,
} from '../campaignUtils';

export function PostJob({ editId }: { editId?: string }) {
  const { closeSheet, addJob, updateJob, showToast, jobs, openKyc, kycStatus } = useApp();
  const existing = jobs.find((j: any) => j.id === editId);
  const existingRights = existing?.usageRights && typeof existing.usageRights === 'object'
    ? existing.usageRights as CampaignUsageRights
    : undefined;

  const [title, setTitle] = useState(existing?.title || '');
  const [platform, setPlatform] = useState(existing?.platform || 'Instagram');
  const [desc, setDesc] = useState(existing?.description || '');
  const [deliverables, setDeliverables] = useState(existing?.deliverables || '1 Reel + 2 Stories');
  const [usageDuration, setUsageDuration] = useState(DURATION_VALUES[existingRights?.duration || ''] || '');
  const [usageChannels, setUsageChannels] = useState<string[]>(existingRights?.channels || []);
  const [exclusivity, setExclusivity] = useState(existingRights ? (existingRights.exclusivity ? 'Yes' : 'No') : '');
  const [exclusivityCategory, setExclusivityCategory] = useState(existingRights?.exclusivityCategory || '');
  const [territory, setTerritory] = useState(existingRights?.territory || '');
  const [from, setFrom] = useState(existing ? String(existing.min) : '5000');
  const [to, setTo] = useState(existing ? String(existing.max) : '15000');
  const initialClose = existing?.closes ? parseCampaignDeadline(existing.closes) : null;
  const [date, setDate] = useState(initialClose && !Number.isNaN(initialClose.getTime())
    ? `${initialClose.getFullYear()}-${String(initialClose.getMonth() + 1).padStart(2, '0')}-${String(initialClose.getDate()).padStart(2, '0')}`
    : '');
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);

  const submit = async () => {
    if (!title.trim()) return showToast('Please add a campaign brief title');
    if (!desc.trim()) return showToast('Please add the campaign brief');
    if (!deliverables.trim()) return showToast('Please describe the required deliverables');
    if (!usageDuration || !usageChannels.length || !exclusivity || !territory.trim()) {
      return showToast('Choose a usage duration, at least one channel, exclusivity, and territory.');
    }
    if (exclusivity === 'Yes' && !exclusivityCategory.trim()) {
      return showToast('Enter the category for exclusive usage.');
    }
    const min = parseInt(from.replace(/\D/g, '') || '0', 10);
    const max = parseInt(to.replace(/\D/g, '') || '0', 10);
    if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min <= 0 || max <= min) {
      return showToast('Enter a valid budget range with the maximum above the minimum.');
    }
    if (!date.trim()) return showToast('Choose a proposal deadline.');
    const parsedDeadline = parseCampaignDeadline(date);
    if (!parsedDeadline) return showToast('Enter a valid proposal deadline.');
    if (parsedDeadline.getTime() <= Date.now()) return showToast('Proposal deadline must be in the future.');
    const closes = parsedDeadline.toISOString();
    const usageRights: CampaignUsageRights = {
      duration: DURATION_VALUES[usageDuration],
      channels: usageChannels,
      exclusivity: exclusivity === 'Yes',
      exclusivityCategory: exclusivity === 'Yes' ? exclusivityCategory.trim() : '',
      territory: territory.trim(),
    };
    const publish = async () => {
      setSaving(true);
      try {
        if (existing) {
          await updateJob(existing.id, {
            title: title.trim(), platform, description: desc.trim(), deliverables: deliverables.trim(),
            usageRights, min, max, ...(closes ? { closes } : {}),
          });
          showToast('Campaign brief updated');
        } else {
          await addJob({
            title: title.trim(), platform, description: desc.trim(), deliverables: deliverables.trim(),
            usageRights, min, max, ...(closes ? { closes } : {}),
          });
          showToast('Campaign posted — creators will submit proposals');
        }
        closeSheet();
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Unable to save campaign.');
      } finally {
        setSaving(false);
      }
    };

    if (kycStatus?.status !== 'verified') {
      openKyc();
      return;
    }
    await publish();
  };

  const stepTitles = ['The brief', 'Deliverables', 'Budget and timing', 'Review'];
  const stepHeadings = ['What do you need made?', 'Where, and what exactly?', 'Budget and reach', 'Review your job'];
  const stepSubtitles = [
    'Creators see this first, so keep it short and concrete.',
    'Choose the platform and explain exactly what the creator will deliver.',
    'Set your budget range and the date proposals close.',
    'Check your brief before you post it. You only pay after confirming a bid.',
  ];

  const moveNext = () => {
    if (step === 0 && !title.trim()) return showToast('Please add a campaign brief title');
    if (step === 0 && !desc.trim()) return showToast('Please add the campaign brief');
    if (step === 1 && !deliverables.trim()) return showToast('Please describe the required deliverables');
    if (step === 1 && (!usageDuration || !usageChannels.length || !exclusivity || !territory.trim())) {
      return showToast('Choose a usage duration, at least one channel, exclusivity, and territory.');
    }
    if (step === 1 && exclusivity === 'Yes' && !exclusivityCategory.trim()) {
      return showToast('Enter the category for exclusive usage.');
    }
    if (step === 2) {
      const min = parseInt(from.replace(/\D/g, '') || '0', 10);
      const max = parseInt(to.replace(/\D/g, '') || '0', 10);
      if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min <= 0 || max <= min) {
        return showToast('Enter a valid budget range with the maximum above the minimum.');
      }
      if (!date.trim()) return showToast('Choose a proposal deadline.');
      const parsedDeadline = parseCampaignDeadline(date);
      if (!parsedDeadline) return showToast('Enter a valid proposal deadline.');
      if (parsedDeadline.getTime() <= Date.now()) return showToast('Proposal deadline must be in the future.');
    }
    setStep((current) => Math.min(current + 1, stepTitles.length - 1));
  };

  return (
    <Sheet
      visible
      onClose={closeSheet}
      title={existing ? 'Edit job' : 'Post a job'}
      sub={`Step ${step + 1} of 4 · ${stepTitles[step]}`}
      headerRight={
        <Pressable
          onPress={closeSheet}
          accessibilityRole="button"
          accessibilityLabel="Close post job form"
          hitSlop={8}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.surfaceSoft, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="close" size={20} color={C.text} />
        </Pressable>
      }
      footer={
        <View style={{ gap: 10 }}>
          <Row style={{ gap: 5 }}>
            {stepTitles.map((label, index) => (
              <View key={label} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: index <= step ? C.dark : C.border }} />
            ))}
          </Row>
          <Row style={{ gap: 8 }}>
            {step > 0 ? <Btn label="Back" variant="outline" onPress={() => setStep((current) => current - 1)} /> : <Btn label="Close" variant="outline" onPress={closeSheet} />}
            {step < 3 ? (
              <Btn label="Continue" flex onPress={moveNext} />
            ) : (
              <Btn label={saving ? 'Posting…' : existing ? 'Save changes' : 'Post job'} flex onPress={submit} disabled={saving} />
            )}
          </Row>
        </View>
      }
    >
      <T size={24} w="semi" track={-0.7} color={C.text}>{stepHeadings[step]}</T>
      <T size={13} color={C.muted2}>{stepSubtitles[step]}</T>

      {step === 0 ? (
        <View style={{ gap: 14 }}>
          <Field label="Job title" value={title} onChangeText={setTitle} placeholder="e.g. Barrier Repair Serum launch" maxLength={60} />
          <Field label="Brief and must-haves" value={desc} onChangeText={setDesc} multiline placeholder="What should creators make? Include the key message, visual direction, tags, and hashtags." />
        </View>
      ) : null}

      {step === 1 ? (
        <View style={{ gap: 14 }}>
          <Select label="Platform" value={platform} options={PLATFORMS} onChange={setPlatform} />
          <Field label="Deliverables" value={deliverables} onChangeText={setDeliverables} placeholder="e.g. 1 Reel + 2 Stories" />
          <Select label="Usage duration" value={usageDuration || 'Choose duration'} options={USAGE_DURATIONS} onChange={setUsageDuration} />
          <View style={{ gap: 7 }}>
            <T size={12} w="semi" color={C.textSecondary}>Where can the content be used?</T>
            <Row style={{ gap: 7, flexWrap: 'wrap' }}>
              {USAGE_CHANNELS.map((channel) => {
                const selected = usageChannels.includes(channel.value);
                return (
                  <Pressable key={channel.value} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={() => setUsageChannels((previous) => selected ? previous.filter((item) => item !== channel.value) : [...previous, channel.value])} style={{ borderWidth: 1, borderColor: selected ? C.dark : C.border2, backgroundColor: selected ? C.dark : C.surface, borderRadius: 12, paddingHorizontal: 11, paddingVertical: 9 }}>
                    <T size={11.5} w="semi" color={selected ? C.onDark : C.text}>{channel.label}</T>
                  </Pressable>
                );
              })}
            </Row>
          </View>
          <Select label="Exclusive usage?" value={exclusivity || 'Choose'} options={['No', 'Yes']} onChange={setExclusivity} />
          {exclusivity === 'Yes' ? <Field label="Exclusive category" value={exclusivityCategory} onChangeText={setExclusivityCategory} placeholder="e.g. packaged snacks" /> : null}
          <Field label="Territory" value={territory} onChangeText={setTerritory} placeholder="e.g. India" />
        </View>
      ) : null}

      {step === 2 ? (
        <View style={{ gap: 14 }}>
          <T size={12} color={C.muted2}>Creators can bid within this range. No platform fee is added to the posted budget.</T>
          <Row style={{ gap: 10, alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}><Field label="Budget from" prefix="₹" value={from} onChangeText={setFrom} keyboardType="number-pad" placeholder="5,000" /></View>
            <View style={{ flex: 1 }}><Field label="Budget to" prefix="₹" value={to} onChangeText={setTo} keyboardType="number-pad" placeholder="15,000" /></View>
          </Row>
          <Field label="Bids close" value={date} onChangeText={setDate} placeholder="e.g. 15 Nov 2026" />
        </View>
      ) : null}

      {step === 3 ? (
        <View style={{ gap: 12 }}>
          <T size={11} w="bold" track={0.8} color={C.muted2}>HOW CREATORS WILL SEE IT</T>
          <Card style={{ gap: 12, padding: 15 }}>
            <Row style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1, gap: 3 }}>
                <T size={14} w="semi" color={C.text}>{title || 'Your campaign title'}</T>
                <T size={12} color={C.muted2}>{platform} · {date || 'Bids close date'}</T>
              </View>
              <T size={18} w="semi" color={C.text}>{inr(Number(to.replace(/\D/g, '') || 0))}</T>
            </Row>
            <T size={13} color={C.textSecondary}>{desc}</T>
            <Row style={{ gap: 7, flexWrap: 'wrap' }}>
              {[deliverables, `${inr(Number(from.replace(/\D/g, '') || 0))}–${inr(Number(to.replace(/\D/g, '') || 0))}`, territory].filter(Boolean).map((tag) => (
                <View key={tag} style={{ paddingVertical: 6, paddingHorizontal: 9, borderRadius: 99, backgroundColor: C.surfaceSoft }}>
                  <T size={11} w="semi" color={C.text}>{tag}</T>
                </View>
              ))}
            </Row>
          </Card>
          <Card style={{ gap: 10, padding: 14 }}>
            <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <View style={{ flex: 1, gap: 3 }}>
                <T size={11} color={C.muted2}>Usage rights</T>
                <T size={12} w="semi" color={C.text}>{formatCampaignUsageRights({
                  duration: DURATION_VALUES[usageDuration] || usageDuration,
                  channels: usageChannels,
                  exclusivity: exclusivity === 'Yes',
                  exclusivityCategory: exclusivity === 'Yes' ? exclusivityCategory : '',
                  territory,
                })}</T>
              </View>
              <Pressable onPress={() => setStep(1)} hitSlop={8}><T size={12} w="semi" color={C.primary}>Edit</T></Pressable>
            </Row>
          </Card>
          <T size={12} color={C.muted2}>You pay only when you confirm a creator’s bid.</T>
        </View>
      ) : null}
    </Sheet>
  );
}
