import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Btn, Card, Row, T } from '../../components/ui';
import { Job } from '../../data';
import { C, inr } from '../../theme';
import { useApp } from '../../store';
import { CreatorHeader, Page, JobCard, toCreatorJob, formatHomeDate, greetingForHour, dueDateParts } from './shared';

export function CreatorHome({ navigation }: any) {
  const { creatorProfile, creatorBids, jobs, orders, refreshCampaigns, showToast, openSheet } = useApp();
  const [loadingCampaigns, setLoadingCampaigns] = useState(jobs.length === 0);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let active = true;
    setLoadingCampaigns(true);
    refreshCampaigns().catch((error: unknown) => {
      if (active) showToast(error instanceof Error ? error.message : 'Unable to load campaigns.');
    }).finally(() => {
      if (active) setLoadingCampaigns(false);
    });
    return () => { active = false; };
  }, [refreshCampaigns, showToast]);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const myBids = creatorBids.filter((bid: any) => bid.creatorId === creatorProfile?.creatorId);
  const activeOrders = orders.filter((order: any) => order.stage !== 'released');
  const earned = orders.filter((order: any) => order.stage === 'released').reduce((total: number, order: any) => total + (order.fee || 0), 0);
  const clearing = activeOrders.reduce((total: number, order: any) => total + (order.fee || 0), 0);
  const escrow = activeOrders.reduce((total: number, order: any) => total + (order.held || 0), 0);
  const recommendations = jobs.filter((job: Job) => job.status === 'open').map(toCreatorJob);
  const name = creatorProfile?.name || 'Creator';
  return (
    <Page navigation={navigation} header={<CreatorHeader navigation={navigation} />}>
      <View style={{ gap: 6, paddingTop: 4 }}>
        <T size={11} w="semi" track={1} color={C.muted}>{formatHomeDate(now)}</T>
        <T size={28} w="bold" track={-0.6} color={C.text} accessibilityRole="header">{greetingForHour(now.getHours())}, {name.split(' ')[0]}.</T>
      </View>

      {/* Needs Attention */}
      <View style={{ gap: 12, marginTop: 6 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <T size={20} w="bold" color={C.text} accessibilityRole="header">Needs your attention</T>
          {activeOrders.length ? (
            <View style={{ backgroundColor: C.pinkBg, paddingHorizontal: 8, paddingVertical: 2.5, borderRadius: 99 }}>
              <T size={11} w="semi" color={C.pinkText}>{activeOrders.length} active</T>
            </View>
          ) : null}
        </Row>
        {activeOrders.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {activeOrders.map((order: any) => (
              <Card key={order.id} style={{ width: 310, gap: 12, borderColor: C.border, padding: 16 }}>
                <Row style={{ justifyContent: 'space-between', gap: 8 }}>
                  <Row style={{ gap: 10, flex: 1 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                      <T size={15} w="semi" color={C.primary}>{(order.title || 'B').slice(0, 1).toUpperCase()}</T>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <T size={13.5} w="semi" color={C.text} numberOfLines={1}>{order.title}</T>
                      <T size={11} color={C.muted2}>{order.stage === 'delivered' ? 'Approval pending' : 'Active job'}</T>
                    </View>
                  </Row>
                  <View style={{ borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4, backgroundColor: C.cta }}>
                    <T size={10.5} w="semi" color={C.onCta}>Your move</T>
                  </View>
                </Row>
                <T size={15} w="semi" color={C.text} numberOfLines={2}>{order.stage === 'delivered' ? 'Your work is submitted and awaiting brand review' : order.title}</T>
                <T size={12} color={C.muted2} numberOfLines={2}>{order.kind || 'Open your active job to review deliverable details.'}</T>
                <Btn label="Open job" small onPress={() => openSheet('order', { orderId: order.id })} style={{ alignSelf: 'flex-start', paddingHorizontal: 16 }} />
              </Card>
            ))}
          </ScrollView>
        ) : (
          <Card style={{ gap: 10, padding: 16 }}>
            <T size={13} color={C.muted2}>{loadingCampaigns ? 'Loading your active jobs…' : 'Nothing needs your attention right now.'}</T>
            <Btn label="Explore jobs" small variant="outline" onPress={() => navigation.navigate('FindJobs')} style={{ alignSelf: 'flex-start' }} />
          </Card>
        )}
      </View>

      {/* Upcoming Deadlines */}
      <View style={{ gap: 12, marginTop: 6 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <T size={20} w="bold" color={C.text} accessibilityRole="header">Upcoming deadlines</T>
          <Pressable onPress={() => navigation.navigate('CreatorMain', { screen: 'ActiveJobs' })} accessibilityRole="button">
            <T size={13} w="semi" color={C.primary}>Active jobs →</T>
          </Pressable>
        </Row>
        {activeOrders.length ? activeOrders.slice(0, 3).map((order: any) => {
          const due = dueDateParts(order.draftDue);
          return (
            <Card
              key={order.id}
              onPress={() => openSheet('order', { orderId: order.id })}
              style={{ padding: 14 }}
            >
              <Row style={{ alignItems: 'center', gap: 14 }}>
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.surfaceSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <T size={17} w="bold" color={C.text}>{due.day}</T>
                  <T size={9.5} w="semi" color={C.muted2}>{due.month}</T>
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <T size={13.5} w="semi" color={C.text}>{order.stage === 'delivered' ? 'Brand approval due' : 'Draft submission due'}</T>
                  <T size={12} color={C.muted2} numberOfLines={1}>{order.title}</T>
                </View>
                <View style={{ borderRadius: 12, backgroundColor: C.accentSoft, paddingVertical: 5, paddingHorizontal: 10 }}>
                  <T size={12} w="semi" color={C.pinkText}>{inr(order.fee || 0)}</T>
                </View>
              </Row>
            </Card>
          );
        }) : (
          <T size={12.5} color={C.muted2}>{loadingCampaigns ? 'Loading your active work…' : 'Your upcoming job deadlines will show here.'}</T>
        )}
      </View>

      {/* Open Campaigns */}
      <View style={{ gap: 12, marginTop: 6 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <T size={20} w="bold" color={C.text} accessibilityRole="header">Open campaigns</T>
          <Pressable onPress={() => navigation.navigate('FindJobs')} accessibilityRole="button">
            <T size={13} w="semi" color={C.primary}>See all →</T>
          </Pressable>
        </Row>
        {recommendations.length ? recommendations.slice(0, 3).map((job) => (
          <JobCard key={job.id} job={job} onPress={() => navigation.navigate('CreatorJobDetail', { jobId: job.id })} />
        )) : (
          <Card><T size={12.5} color={C.muted2}>{loadingCampaigns ? 'Loading brand campaigns…' : 'No open campaigns are available right now.'}</T></Card>
        )}
      </View>

      {/* Earnings & Escrow */}
      <View style={{ gap: 12, marginTop: 6 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <T size={20} w="bold" color={C.text} accessibilityRole="header">Earnings &amp; escrow</T>
          <Pressable onPress={() => navigation.navigate('CreatorMain', { screen: 'Earnings' })} accessibilityRole="button">
            <T size={13} w="semi" color={C.primary}>Wallet →</T>
          </Pressable>
        </Row>
        <View style={{ flexDirection: 'row', backgroundColor: C.surface, borderRadius: 20, borderWidth: 1, borderColor: C.border, overflow: 'hidden' }}>
          <MoneyMetric label="Ready" amount={earned} note="Released" />
          <MoneyMetric label="Clearing" amount={clearing} note="In progress" />
          <MoneyMetric label="Escrow" amount={escrow} note={`${activeOrders.length} jobs`} accent />
        </View>
      </View>

      <View style={{ gap: 10, marginTop: 4, paddingBottom: 10 }}>
        <T size={11.5} color={C.muted2} style={{ textAlign: 'center' }}>Direct deals · Zero platform fee</T>
        <Btn label={`View offers${myBids.length ? ` (${myBids.length} bids)` : ''}`} icon="mail-outline" onPress={() => navigation.navigate('Offers')} variant="outline" />
      </View>
    </Page>
  );
}

function MoneyMetric({ label, amount, note, accent = false }: { label: string; amount: number; note: string; accent?: boolean }) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 11, paddingVertical: 14, gap: 5, borderRightWidth: 1, borderRightColor: C.border }}>
      <T size={11} w="med" color={accent ? C.pinkText : C.muted}>{label}</T>
      <T size={18} w="semi" color={C.text}>{inr(amount)}</T>
      <T size={9} color={C.muted} numberOfLines={1}>{note}</T>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.surfaceSubtle, borderRadius: 12, padding: 10, gap: 4 }}>
      <T size={10.5} color={C.muted}>{label}</T>
      <T size={14} w="bold" color={C.text}>{value}</T>
    </View>
  );
}
