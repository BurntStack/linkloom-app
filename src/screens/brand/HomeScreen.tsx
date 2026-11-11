import React, { useEffect, useMemo, useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { C, inr } from '../../theme';
import { useApp } from '../../store';
import { Card, CreatorCard, LogoMark, Row, T, useGridWidth } from '../../components/ui';
import { Screen } from './shared';

export function Home({ navigation }: any) {
  const {
    openCreator, brandName, creatorSearchResults, searchCreators, showToast,
    jobs, orders, openSheet,
  } = useApp();
  const creatorWidth = useGridWidth();
  const [loadingCreators, setLoadingCreators] = useState(creatorSearchResults.length === 0);

  useEffect(() => {
    let active = true;
    setLoadingCreators(true);
    searchCreators().catch((error: unknown) => {
      if (active) showToast(error instanceof Error ? error.message : 'Unable to load creators.');
    }).finally(() => {
      if (active) setLoadingCreators(false);
    });
    return () => { active = false; };
  }, [searchCreators, showToast]);

  const needsAttention = useMemo(() => [
    ...orders.filter((order: any) => order.stage === 'delivered').map((order: any) => ({
      id: `order-${order.id}`,
      title: `Review ${order.creatorName || 'creator'}’s final cut`,
      subtitle: order.title,
      icon: 'play-circle-outline',
      action: () => openSheet('order', { orderId: order.id }),
    })),
    ...jobs.filter((job: any) => job.status === 'open' && job.bidsCount > 0).map((job: any) => ({
      id: `job-${job.id}`,
      title: `${job.bidsCount} bids to review`,
      subtitle: job.title,
      icon: 'briefcase-outline',
      action: () => openSheet('reviewbids', { jobId: job.id }),
    })),
  ].slice(0, 3), [jobs, orders, openSheet]);

  const hiredCount = orders.length;
  const activeCampaignCount = jobs.filter((job: any) => job.status !== 'completed').length;
  const escrowTotal = orders.filter((order: any) => order.stage !== 'released').reduce(
    (sum: number, order: any) => sum + (order.held || 0), 0,
  );
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <Screen navigation={navigation}>
      <View style={{ gap: 7, paddingTop: 1 }}>
        <T size={11} w="bold" track={0.9} color={C.muted2}>{brandName?.toUpperCase() || 'BRAND WORKSPACE'}</T>
        <T size={31} w="semi" track={-1} color={C.text} style={{ fontFamily: 'Georgia' }}>
          {greeting}, {brandName}.
        </T>
      </View>

      <Pressable onPress={() => navigation.navigate('Orders')} accessibilityRole="button">
        <View style={{ padding: 18, borderRadius: 22, backgroundColor: C.dark, gap: 17 }}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Row style={{ gap: 9, alignItems: 'center' }}>
              <LogoMark size={24} />
              <T size={11} w="semi" track={0.8} color={C.onDarkMuted}>CAMPAIGN OVERVIEW</T>
            </Row>
            <Ionicons name="chevron-forward" size={18} color={C.onDarkMuted} />
          </Row>
          <View style={{ gap: 4 }}>
            <T size={11.5} color={C.onDarkMuted}>Held safely in escrow</T>
            <T size={34} w="semi" color={C.onDark}>{inr(escrowTotal)}</T>
            <T size={11.5} color={C.onDarkMuted}>Released only when you approve</T>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1, padding: 10, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.12)', gap: 3 }}>
              <T size={16} w="semi" color={C.onDark}>{hiredCount}</T>
              <T size={10.5} color={C.onDarkMuted}>Creators hired</T>
            </View>
            <View style={{ flex: 1, padding: 10, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.12)', gap: 3 }}>
              <T size={16} w="semi" color={C.onDark}>{activeCampaignCount}</T>
              <T size={10.5} color={C.onDarkMuted}>Active campaigns</T>
            </View>
          </View>
        </View>
      </Pressable>

      <View style={{ gap: 9 }}>
        <T size={22} w="semi" color={C.text} style={{ fontFamily: 'Georgia' }}>Start here</T>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable
            onPress={() => navigation.navigate('Search')}
            style={{ flex: 1, minHeight: 112, padding: 13, borderRadius: 18, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface, justifyContent: 'space-between' }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="people-outline" size={18} color={C.primary} />
            </View>
            <View style={{ gap: 3 }}>
              <T size={13} w="semi" color={C.text}>Find creators</T>
              <T size={10.5} color={C.muted2}>Browse and shortlist</T>
            </View>
          </Pressable>
          <Pressable
            onPress={() => openSheet('postjob')}
            style={{ flex: 1, minHeight: 112, padding: 13, borderRadius: 18, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface, justifyContent: 'space-between' }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: C.amberBg, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="briefcase-outline" size={18} color={C.amber} />
            </View>
            <View style={{ gap: 3 }}>
              <T size={13} w="semi" color={C.text}>Post a campaign</T>
              <T size={10.5} color={C.muted2}>Share a brief and budget</T>
            </View>
          </Pressable>
        </View>
      </View>

      <View style={{ gap: 7 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <T size={23} w="semi" color={C.text} style={{ fontFamily: 'Georgia' }}>Needs you</T>
          <Pressable onPress={() => navigation.navigate('Jobs')} hitSlop={8}>
            <T size={12} w="semi" color={C.primary}>All campaigns</T>
          </Pressable>
        </Row>
        {needsAttention.length ? needsAttention.map((item) => (
          <Pressable key={item.id} onPress={item.action} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.borderSubtle }}>
            <Row style={{ gap: 12, alignItems: 'center' }}>
              <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: C.surfaceSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={item.icon as any} size={19} color={C.text} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <T size={14} w="semi" color={C.text}>{item.title}</T>
                <T size={12} color={C.muted2} numberOfLines={1}>{item.subtitle}</T>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.muted2} />
            </Row>
          </Pressable>
        )) : (
          <Card style={{ padding: 15 }}>
            <T size={13} color={C.muted2}>You’re all caught up. New bids and delivered work will show up here.</T>
          </Card>
        )}
      </View>

      <View style={{ gap: 10 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <T size={23} w="semi" color={C.text} style={{ fontFamily: 'Georgia' }}>Creators for you</T>
          <Pressable onPress={() => navigation.navigate('Search')} hitSlop={8}>
            <T size={13} w="semi" color={C.text}>See all</T>
          </Pressable>
        </Row>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {creatorSearchResults.slice(0, 6).map((creator: any) => (
            <CreatorCard
              key={creator.id}
              c={creator}
              width={creatorWidth}
              onPress={() => openCreator(creator.id)}
              showBadge
            />
          ))}
        </ScrollView>
        {!creatorSearchResults.length ? (
          <T size={12} color={C.muted}>
            {loadingCreators ? 'Loading creator profiles…' : 'No public creator profiles are available yet.'}
          </T>
        ) : null}
      </View>

    </Screen>
  );
}
