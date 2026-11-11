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
      <View style={{ gap: 6, paddingTop: 1 }}>
        <T size={11} w="semi" track={1.1} color={C.muted}>{formatHomeDate(now)}</T>
        <T size={32} w="semi" track={-1} color={C.text}>{greetingForHour(now.getHours())}, {name.split(' ')[0]}.</T>
      </View>

      <Row style={{ justifyContent: 'space-between', alignItems: 'baseline', marginTop: 3 }}>
        <T size={22} w="semi" track={-0.6} color={C.text}>Needs you</T>
        <T size={12} w="semi" color={C.muted}>{activeOrders.length}</T>
      </Row>
      {activeOrders.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {activeOrders.map((order: any) => (
            <Card key={order.id} style={{ width: 300, gap: 12, borderColor: C.creatorAccent, borderWidth: 1.4, padding: 14 }}>
              <Row style={{ justifyContent: 'space-between', gap: 8 }}>
                <Row style={{ gap: 9, flex: 1 }}>
                  <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                    <T size={15} w="semi" color={C.primary}>{(order.title || 'B').slice(0, 1).toUpperCase()}</T>
                  </View>
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <T size={12} w="semi" color={C.text} numberOfLines={1}>{order.title}</T>
                    <T size={10} color={C.muted}>{order.stage === 'delivered' ? 'Approval pending' : 'Active job'}</T>
                  </View>
                </Row>
                <View style={{ borderRadius: 15, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: C.cta }}>
                  <T size={10} w="semi" color={C.onCta}>Your move</T>
                </View>
              </Row>
              <T size={16} w="semi" color={C.text} numberOfLines={2}>{order.stage === 'delivered' ? 'Your work is ready for review' : order.title}</T>
              <T size={12} color={C.muted} numberOfLines={2}>{order.kind || 'Open your active job to review its details.'}</T>
              <Btn label="Open job" onPress={() => openSheet('order', { orderId: order.id })} style={{ alignSelf: 'flex-start', minHeight: 40, paddingHorizontal: 18 }} />
            </Card>
          ))}
        </ScrollView>
      ) : (
        <Card style={{ gap: 10 }}>
          <T size={13} color={C.muted}>{loadingCampaigns ? 'Loading your active jobs…' : 'Nothing needs your attention right now.'}</T>
          <Btn label="Find jobs" small variant="outline" onPress={() => navigation.navigate('FindJobs')} style={{ alignSelf: 'flex-start' }} />
        </Card>
      )}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 5 }}>
        {activeOrders.slice(0, 2).map((order: any, index: number) => (
          <View key={order.id} style={{ width: index === 0 ? 17 : 6, height: 6, borderRadius: 4, backgroundColor: index === 0 ? C.text : C.border2 }} />
        ))}
      </View>

      <Row style={{ justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
        <T size={22} w="semi" track={-0.6} color={C.text}>Money</T>
        <Pressable onPress={() => navigation.navigate('CreatorMain', { screen: 'Earnings' })}>
          <T size={12} w="semi" color={C.text}>Earnings</T>
        </Pressable>
      </Row>
      <View style={{ flexDirection: 'row', backgroundColor: C.surface, borderRadius: 18, borderWidth: 1, borderColor: C.border, overflow: 'hidden' }}>
        <MoneyMetric label="Ready" amount={earned} note="Released" />
        <MoneyMetric label="Clearing" amount={clearing} note="In progress" />
        <MoneyMetric label="Escrow" amount={escrow} note={`${activeOrders.length} active jobs`} accent />
      </View>

      <Row style={{ justifyContent: 'space-between', alignItems: 'baseline', marginTop: 5 }}>
        <T size={22} w="semi" track={-0.6} color={C.text}>Coming up</T>
        <Pressable onPress={() => navigation.navigate('CreatorMain', { screen: 'ActiveJobs' })}>
          <T size={12} w="semi" color={C.text}>Active jobs</T>
        </Pressable>
      </Row>
      {activeOrders.length ? activeOrders.slice(0, 3).map((order: any) => {
        const due = dueDateParts(order.draftDue);
        return (
          <Pressable key={order.id} onPress={() => openSheet('order', { orderId: order.id })} style={{ paddingVertical: 10, borderBottomWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 42, alignItems: 'center' }}>
              <T size={19} w="semi" color={C.text}>{due.day}</T>
              <T size={9} w="semi" color={C.muted}>{due.month}</T>
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <T size={12} w="semi" color={C.text}>{order.stage === 'delivered' ? 'Brand approval due' : 'Active job'}</T>
              <T size={11} color={C.muted} numberOfLines={1}>{order.title}</T>
            </View>
            <View style={{ borderRadius: 20, backgroundColor: C.accentSoft, paddingVertical: 6, paddingHorizontal: 9 }}>
              <T size={11} w="semi" color={C.pinkText}>{inr(order.fee || 0)}</T>
            </View>
          </Pressable>
        );
      }) : (
        <T size={12} color={C.muted}>{loadingCampaigns ? 'Loading active jobs…' : 'Your upcoming job deadlines will show here.'}</T>
      )}

      <Row style={{ justifyContent: 'space-between', alignItems: 'baseline', marginTop: 7 }}>
        <T size={22} w="semi" track={-0.6} color={C.text}>Picked for you</T>
        <Pressable onPress={() => navigation.navigate('FindJobs')}>
          <T size={12} w="semi" color={C.text}>See all</T>
        </Pressable>
      </Row>
      {recommendations.length ? recommendations.slice(0, 3).map((job) => (
        <JobCard key={job.id} job={job} onPress={() => navigation.navigate('CreatorJobDetail', { jobId: job.id })} />
      )) : (
        <Card><T size={12} color={C.muted}>{loadingCampaigns ? 'Loading brand campaigns…' : 'No open campaigns are available right now.'}</T></Card>
      )}
      <T size={11} color={C.muted} style={{ textAlign: 'center', paddingVertical: 6 }}>Creator plan · no fee on any deal</T>
      <Btn label={`View offers${myBids.length ? ` · ${myBids.length} bids` : ''}`} icon="mail-outline" onPress={() => navigation.navigate('Offers')} variant="outline" />
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
