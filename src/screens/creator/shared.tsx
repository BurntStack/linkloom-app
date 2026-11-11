import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Btn, Card, Logo, LogoMark, Row, T, TopBar } from '../../components/ui';
import { Job } from '../../data';
import { C, inr } from '../../theme';
import { useApp } from '../../store';

export type CreatorJob = {
  id: string;
  title: string;
  description: string;
  deliverables: string;
  platform: string;
  category: string;
  city: string;
  language: string;
  minBudget: number;
  maxBudget: number;
  deadline: string;
  bidsCount: number;
  status: Job['status'];
};

export const toCreatorJob = (job: Job): CreatorJob => ({
  id: job.id,
  title: job.title,
  description: job.description || job.deliverables,
  deliverables: job.deliverables,
  platform: job.platform,
  category: job.category || 'Other',
  city: job.city || 'Remote',
  language: job.language || 'Any',
  minBudget: job.min,
  maxBudget: job.max,
  deadline: job.closes || 'Open',
  bidsCount: job.bidsCount,
  status: job.status,
});

export function Page({ navigation, children, showTopBar = true, header }: any) {
  const { openSheet } = useApp();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {header || (showTopBar ? (
        <TopBar
          onAccount={() => navigation.navigate('CreatorAccount')}
          onBell={() => openSheet('notifications')}
        />
      ) : null)}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 16, gap: 14, paddingBottom: 28 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function CreatorHeader({ navigation, title }: { navigation: any; title?: string }) {
  const insets = useSafeAreaInsets();
  const { creatorProfile, openSheet } = useApp();
  return (
    <View style={{ paddingTop: insets.top, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.borderSubtle }}>
      <Row style={{ height: 58, paddingHorizontal: 16, justifyContent: 'space-between' }}>
        <Row style={{ gap: title ? 8 : 5 }}>
          {title ? (
            <>
              <LogoMark size={22} />
              <T size={20} w="semi" color={C.text}>{title}</T>
            </>
          ) : <Logo size={17} />}
        </Row>
        <Row style={{ gap: 14 }}>
          {!title ? (
            <Pressable onPress={() => navigation.navigate('CreatorMessages')} accessibilityLabel="Messages" hitSlop={8}>
              <Ionicons name="chatbubble-ellipses-outline" size={23} color={C.text} />
            </Pressable>
          ) : null}
          <Pressable onPress={() => openSheet('notifications')} accessibilityLabel="Notifications" hitSlop={8}>
            <Ionicons name="notifications-outline" size={23} color={C.text} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('CreatorAccount')} accessibilityLabel="Creator profile" hitSlop={6}>
            <Avatar
              name={creatorProfile?.name || 'Creator'}
              size={38}
              photo={creatorProfile?.photoUrl ? { uri: creatorProfile.photoUrl } : undefined}
            />
          </Pressable>
        </Row>
      </Row>
    </View>
  );
}

export function formatHomeDate(date: Date) {
  return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' }).toUpperCase();
}

export function greetingForHour(hour: number) {
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

export function dueDateParts(value: string) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return { day: '•', month: 'NOW' };
  return {
    day: String(date.getDate()),
    month: date.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase(),
  };
}

export function JobCard({ job, onPress }: { job: CreatorJob; onPress: () => void }) {
  return (
    <Card onPress={onPress} style={{ gap: 10, padding: 14 }}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <View style={{ flex: 1, gap: 4 }}>
          <T size={15} w="bold" color={C.text}>{job.title}</T>
          <T size={11.5} color={C.muted}>{job.category} · {job.platform}</T>
        </View>
        <Ionicons name="chevron-forward" size={17} color={C.muted3} />
      </Row>
      <T size={12} color={C.muted} numberOfLines={2}>{job.deliverables}</T>
      <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: 2 }}>
          <T size={10.5} color={C.muted}>CAMPAIGN BUDGET</T>
          <T size={14} w="bold" color={C.primary}>{inr(job.minBudget)}–{inr(job.maxBudget)}</T>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 2 }}>
          <T size={11} color={C.muted}>{job.city}</T>
          <T size={10.5} color={C.muted}>{job.bidsCount} proposals · {job.deadline}</T>
        </View>
      </Row>
    </Card>
  );
}

export function Info({ label, value }: { label: string; value: string }) {
  return <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}><T size={12} color={C.muted}>{label}</T><T size={12} w="semi" color={C.text} style={{ flex: 1, textAlign: 'right' }}>{value}</T></Row>;
}

export function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.surfaceSubtle, borderRadius: 12, padding: 10, gap: 4 }}>
      <T size={10.5} color={C.muted}>{label}</T>
      <T size={14} w="bold" color={C.text}>{value}</T>
    </View>
  );
}

export function Empty({ icon, title, body, action, onPress }: { icon: any; title: string; body: string; action?: string; onPress?: () => void }) {
  return (
    <Card style={{ alignItems: 'center', gap: 9, paddingVertical: 24 }}>
      <Ionicons name={icon} size={28} color={C.primary} />
      <T size={15} w="bold" color={C.text}>{title}</T>
      <T size={12} color={C.muted} style={{ textAlign: 'center', lineHeight: 18 }}>{body}</T>
      {action && onPress ? <Btn label={action} onPress={onPress} variant="outline" /> : null}
    </Card>
  );
}
