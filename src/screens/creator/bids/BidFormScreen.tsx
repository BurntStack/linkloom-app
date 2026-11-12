import React, { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Btn, Card, Field, Row, Sheet, StackHeader, T } from '../../../components/ui';
import { Job } from '../../../data';
import { C, F, inr } from '../../../theme';
import { useApp } from '../../../store';
import { toCreatorJob } from '../shared';

function ReviewBidSheet({
  visible,
  onClose,
  onEdit,
  onSend,
  job,
  price,
  proposal,
  deliveryDays,
  saving,
}: {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onSend: () => void;
  job: { title: string; category: string };
  price: number;
  proposal: string;
  deliveryDays: string;
  saving: boolean;
}) {
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Review your bid"
      sub={`${job.category} · ${job.title}`}
      footer={(
        <Row style={{ gap: 8 }}>
          <Btn label="Edit" variant="outline" flex disabled={saving} onPress={onEdit} />
          <Btn label={saving ? 'Sending…' : 'Send bid'} icon="paper-plane-outline" flex disabled={saving} onPress={onSend} />
        </Row>
      )}
    >
      <View style={{ overflow: 'hidden', borderRadius: 18, borderWidth: 1, borderColor: C.border, backgroundColor: C.surfaceSubtle }}>
        <View style={{ padding: 14, gap: 6 }}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <T size={12} color={C.muted}>Your price</T>
            <T size={12} color={C.muted}>You receive</T>
          </Row>
          <Row style={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
            <T size={27} w="semi" color={C.text}>{inr(price)}</T>
            <T size={15} w="semi" color={C.green}>{inr(price)} in full</T>
          </Row>
        </View>
        <ReviewRow label="Platform fee" value="None · Creator plan" />
        <ReviewRow label="Tax" value="As per confirmed rules" />
        <ReviewRow label="Delivery time" value={`${deliveryDays} days`} />
      </View>
      <View style={{ borderLeftWidth: 3, borderLeftColor: C.creatorAccent, borderRadius: 12, padding: 13, backgroundColor: C.pinkBg }}>
        <T size={13} color={C.text} style={{ lineHeight: 20 }}>{proposal}</T>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 13, borderRadius: 14, backgroundColor: C.accentSoft }}>
        <Ionicons name="lock-closed-outline" size={18} color={C.pinkText} />
        <T size={12} color={C.text} style={{ flex: 1, lineHeight: 19 }}>
          If the brand accepts, they fund escrow before you start. It is released after approval.
        </T>
      </View>
      <Row style={{ alignItems: 'flex-start', gap: 8 }}>
        <Ionicons name="eye-outline" size={17} color={C.muted} />
        <T size={11} color={C.muted} style={{ flex: 1, lineHeight: 17 }}>
          The brand sees your price, proposal, and delivery estimate. Your account and payout details stay private.
        </T>
      </Row>
    </Sheet>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <Row style={{ justifyContent: 'space-between', gap: 10, paddingHorizontal: 14, paddingVertical: 11, borderTopWidth: 1, borderTopColor: C.border }}>
      <T size={12} color={C.muted}>{label}</T>
      <T size={12} w="semi" color={C.text} style={{ flex: 1, textAlign: 'right' }}>{value}</T>
    </Row>
  );
}

export function CreatorBidForm({ navigation, route }: any) {
  const { submitCreatorBid, showToast, jobs } = useApp();
  const sourceJob = jobs.find((item: Job) => item.id === route.params?.jobId && item.status === 'open');
  const job = sourceJob ? toCreatorJob(sourceJob) : undefined;
  const [price, setPrice] = useState('');
  const [proposal, setProposal] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [saving, setSaving] = useState(false);
  const [reviewVisible, setReviewVisible] = useState(false);

  if (!job) return <View style={{ flex: 1, backgroundColor: C.bg }}><StackHeader title="Your bid" onBack={() => navigation.goBack()} /><View style={{ padding: 20 }}><T color={C.muted}>This campaign is no longer available.</T></View></View>;

  const validate = () => {
    const amount = Number(price);
    if (!Number.isFinite(amount) || amount <= 0) {
      showToast('Enter a valid proposal amount');
      return false;
    }
    if (amount < job.minBudget || amount > job.maxBudget) {
      showToast(`Your amount must be between ${inr(job.minBudget)} and ${inr(job.maxBudget)}`);
      return false;
    }
    if (proposal.trim().length < 20) {
      showToast('Add a proposal with at least 20 characters');
      return false;
    }
    const days = Number(deliveryDays);
    if (!Number.isInteger(days) || days < 1) {
      showToast('Enter the expected delivery time in days');
      return false;
    }
    return true;
  };

  const openReview = () => {
    if (validate()) setReviewVisible(true);
  };

  const send = async () => {
    if (!validate()) {
      setReviewVisible(false);
      return;
    }
    setSaving(true);
    try {
      await submitCreatorBid({
        jobId: job.id,
        jobTitle: job.title,
        price: Number(price),
        proposal: proposal.trim(),
        deliveryDays: Number(deliveryDays),
      });
      setReviewVisible(false);
      navigation.replace('CreatorBidSent', {
        jobId: job.id,
        jobTitle: job.title,
        price: Number(price),
      });
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to submit your proposal.');
    } finally {
      setSaving(false);
    }
  };

  const budgetPresets = [...new Set([job.minBudget, Math.round((job.minBudget + job.maxBudget) / 2), job.maxBudget])];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StackHeader title="Your bid" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 18, gap: 14, paddingBottom: 28 }} keyboardShouldPersistTaps="handled">
        <T size={13} color={C.muted}>{job.title}</T>

        <View style={{ padding: 15, borderRadius: 22, borderWidth: 1.5, borderColor: C.text, backgroundColor: C.surface, gap: 12 }}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <T size={14} w="semi" color={C.text}>Your price</T>
            <T size={12} color={C.muted}>INR</T>
          </Row>
          <Row style={{ alignItems: 'center', gap: 4 }}>
            <T size={28} w="semi" color={C.text}>₹</T>
            <TextInput
              value={price}
              onChangeText={(value) => setPrice(value.replace(/\D/g, ''))}
              placeholder="Enter your price"
              placeholderTextColor={C.muted3}
              keyboardType="number-pad"
              accessibilityLabel="Your bid price"
              style={{ flex: 1, padding: 0, fontFamily: F.semi, fontSize: 32, color: C.text }}
            />
          </Row>
          <View style={{ gap: 6 }}>
            <View style={{ height: 7, borderRadius: 6, backgroundColor: C.border, overflow: 'hidden' }}>
              <View style={{ width: price && job.maxBudget > job.minBudget
                ? `${Math.max(0, Math.min(100, ((Number(price) - job.minBudget) / (job.maxBudget - job.minBudget)) * 100))}%`
                : '0%', height: '100%', backgroundColor: C.creatorAccent }} />
            </View>
            <Row style={{ justifyContent: 'space-between' }}>
              <T size={11} color={C.muted}>Min {inr(job.minBudget)}</T>
              <T size={11} color={C.muted}>Max {inr(job.maxBudget)}</T>
            </Row>
          </View>
        </View>

        <Row style={{ gap: 7 }}>
          {budgetPresets.map((amount, index) => (
            <Pressable key={amount} onPress={() => setPrice(String(amount))} style={{
              flex: 1,
              minHeight: 44,
              paddingHorizontal: 8,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: C.border2,
              backgroundColor: C.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <T size={11.5} w="semi" color={C.text}>{index === 0 ? 'Min ' : index === 1 ? 'Mid ' : 'Max '}{inr(amount)}</T>
            </Pressable>
          ))}
        </Row>

        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <T size={12} color={C.muted}>You receive the agreed price, in full</T>
          <T size={18} w="semi" color={C.text}>{inr(Number(price) || 0)}</T>
        </Row>

        <View style={{ borderRadius: 18, borderWidth: 1, borderColor: C.border2, backgroundColor: C.surface, padding: 13, gap: 8 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <T size={13} w="semi" color={C.text}>Why you</T>
            <T size={12} color={C.muted}>{proposal.length} / 1000</T>
          </Row>
          <Field
            value={proposal}
            onChangeText={setProposal}
            placeholder="Describe your audience fit, creative approach, and what you will deliver."
            multiline
            maxLength={1000}
          />
        </View>
        <Field label="Expected delivery time (days)" value={deliveryDays} onChangeText={(value) => setDeliveryDays(value.replace(/\D/g, ''))} placeholder="e.g. 7" keyboardType="number-pad" />
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name="calendar-outline" size={20} color={C.muted} />
          <T size={13} color={C.muted} style={{ flex: 1 }}>Post date will be agreed with the brand</T>
          <T size={13} w="semi" color={C.text}>After acceptance</T>
        </Card>
      </ScrollView>

      <View style={{ paddingHorizontal: 18, paddingVertical: 12, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.surface }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <T size={11} color={C.muted}>Tax as per confirmed rules</T>
            <T size={12} w="semi" color={C.text}>Nothing is sent yet</T>
          </View>
          <Btn label="Review bid" onPress={openReview} style={{ minWidth: 140, borderRadius: 28 }} />
        </Row>
      </View>
      <ReviewBidSheet
        visible={reviewVisible}
        onClose={() => setReviewVisible(false)}
        onEdit={() => setReviewVisible(false)}
        onSend={send}
        job={{ title: job.title, category: job.category }}
        price={Number(price) || 0}
        proposal={proposal}
        deliveryDays={deliveryDays}
        saving={saving}
      />
    </View>
  );
}
