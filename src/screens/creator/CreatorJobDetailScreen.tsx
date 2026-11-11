import React from 'react';
import { ScrollView, View } from 'react-native';
import { Avatar, Btn, Row, StackHeader, T } from '../../components/ui';
import { Job } from '../../data';
import { C, inr } from '../../theme';
import { useApp } from '../../store';
import { toCreatorJob } from './shared';

function SectionTitle({ children }: { children: string }) {
  return <T size={12} w="bold" track={1} color={C.muted}>{children}</T>;
}

function TermRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, paddingVertical: 13 }}>
      <T size={13} color={C.muted}>{label}</T>
      <T size={13} w="semi" color={accent ? C.pinkText : C.text} style={{ flex: 1, textAlign: 'right' }}>{value}</T>
    </Row>
  );
}

function usageRightsLabel(value: Job['usageRights']) {
  if (!value) return 'Not specified';
  if (typeof value === 'string') return value;
  const duration = value.duration.replace(/_/g, ' ');
  const channels = value.channels.map((channel) => channel.replace(/_/g, ' ')).join(', ');
  return [
    duration ? `Usage for ${duration}` : '',
    channels ? `Channels: ${channels}` : '',
    value.exclusivity
      ? `Exclusive${value.exclusivityCategory ? ` in ${value.exclusivityCategory}` : ''}`
      : 'Non-exclusive',
    value.territory ? `Territory: ${value.territory}` : '',
  ].filter(Boolean).join(' · ') || 'Not specified';
}

export function CreatorJobDetail({ navigation, route }: any) {
  const { jobs } = useApp();
  const sourceJob = jobs.find((item: Job) => item.id === route.params?.jobId);
  const job = sourceJob ? toCreatorJob(sourceJob) : undefined;
  if (!job) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <StackHeader title="Campaign" onBack={() => navigation.goBack()} />
        <View style={{ padding: 20 }}><T color={C.muted}>This campaign is no longer available.</T></View>
      </View>
    );
  }

  const deliverables = job.deliverables.split(/\n+/).map((item) => item.trim()).filter(Boolean);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StackHeader title={job.title} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 18, paddingTop: 22, gap: 22, paddingBottom: 28 }}>
        <View style={{ gap: 7 }}>
          <T size={11} w="bold" track={1} color={C.muted}>CAMPAIGN BRIEF</T>
          <T size={26} w="semi" track={-0.7} color={C.text}>{job.title}</T>
          <T size={13} color={C.muted}>
            {job.category} · {job.platform} · {job.minBudget === job.maxBudget ? inr(job.maxBudget) : `${inr(job.minBudget)}–${inr(job.maxBudget)}`}
          </T>
        </View>

        <View style={{ gap: 10 }}>
          <SectionTitle>DELIVERABLES</SectionTitle>
          <View style={{ overflow: 'hidden', borderRadius: 22, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface }}>
            {deliverables.map((item, index) => (
              <Row key={`${index}-${item}`} style={{
                gap: 13,
                paddingHorizontal: 15,
                paddingVertical: 15,
                borderBottomWidth: index < deliverables.length - 1 ? 1 : 0,
                borderBottomColor: C.border,
              }}>
                <T size={19} w="semi" color={C.creatorAccent}>{String(index + 1).padStart(2, '0')}</T>
                <T size={14} color={C.text} style={{ flex: 1, lineHeight: 21 }}>{item}</T>
              </Row>
            ))}
          </View>
          {job.description && job.description !== job.deliverables ? (
            <T size={13} color={C.muted} style={{ lineHeight: 20 }}>{job.description}</T>
          ) : null}
        </View>

        <View style={{ gap: 10 }}>
          <SectionTitle>TERMS</SectionTitle>
          <View style={{ paddingHorizontal: 15, borderRadius: 22, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface }}>
            <TermRow label="Platform" value={job.platform} />
            <View style={{ height: 1, backgroundColor: C.border }} />
            <TermRow label="Proposal deadline" value={job.deadline} />
            <View style={{ height: 1, backgroundColor: C.border }} />
            <TermRow label="Location" value={job.city} />
            <View style={{ height: 1, backgroundColor: C.border }} />
            <TermRow label="Languages" value={job.language} />
            <View style={{ height: 1, backgroundColor: C.border }} />
            <TermRow label="Usage rights" value={usageRightsLabel(sourceJob?.usageRights)} />
            <View style={{ height: 1, backgroundColor: C.border }} />
            <TermRow label="Payment" value="Escrow before you start" accent />
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <SectionTitle>ABOUT THE BRAND</SectionTitle>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderRadius: 22, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface }}>
            <Avatar name={job.category || 'Brand'} size={54} />
            <View style={{ flex: 1, gap: 4 }}>
              <T size={14} w="semi" color={C.text}>Campaign brand</T>
              <T size={12} color={C.muted}>Brand identity is shared when a proposal is accepted.</T>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 18, paddingTop: 12, paddingBottom: 12, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border, gap: 10 }}>
        <T size={12} color={C.muted}>You keep the full price · no platform fee</T>
        <Btn label="Bid on this job" onPress={() => navigation.navigate('CreatorBidForm', { jobId: job.id })} style={{ minHeight: 52, borderRadius: 28 }} />
      </View>
    </View>
  );
}
