import React, { useEffect, useMemo, useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { C, inr, shadowSm } from '../../theme';
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
  const displayBrandName = brandName?.trim() || 'Brand';

  return (
    <Screen navigation={navigation}>
      {/* Brand & Greeting Header */}
      <View style={{ gap: 6, paddingTop: 4 }}>
        <Row style={{ gap: 6, alignItems: 'center' }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary }} />
          <T size={11.5} w="semi" track={0.8} color={C.muted}>
            {brandName?.trim().toUpperCase() || 'BRAND WORKSPACE'}
          </T>
        </Row>
        <T size={30} w="bold" track={-0.8} color={C.text} accessibilityRole="header">
          {greeting}, {displayBrandName}.
        </T>
      </View>

      {/* Needs Attention */}
      <View style={{ gap: 12 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <T size={20} w="bold" color={C.text} accessibilityRole="header">Needs your review</T>
          <Pressable onPress={() => navigation.navigate('Jobs')} hitSlop={8} accessibilityRole="button">
            <T size={13} w="semi" color={C.primary}>All campaigns →</T>
          </Pressable>
        </Row>
        {needsAttention.length ? (
          <View style={{ gap: 10 }}>
            {needsAttention.map((item) => (
              <Pressable
                key={item.id}
                onPress={item.action}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}. ${item.subtitle}`}
                style={({ pressed }) => ({
                  padding: 14,
                  borderRadius: 18,
                  backgroundColor: C.surfaceSoft,
                  borderWidth: 1,
                  borderColor: C.border,
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                })}
              >
                <Row style={{ gap: 14, alignItems: 'center' }}>
                  <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border }}>
                    <Ionicons name={item.icon as any} size={20} color={C.primary} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <T size={14.5} w="semi" color={C.text}>{item.title}</T>
                    <T size={12.5} color={C.muted2} numberOfLines={1}>{item.subtitle}</T>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={C.muted3} />
                </Row>
              </Pressable>
            ))}
          </View>
        ) : (
          <Card style={{ padding: 16, backgroundColor: C.surfaceSoft, borderColor: C.borderSubtle }}>
            <Row style={{ gap: 10, alignItems: 'center' }}>
              <Ionicons name="checkmark-circle-outline" size={20} color={C.green} />
              <T size={13.5} color={C.muted2}>You’re all caught up · New proposals and cuts will show here.</T>
            </Row>
          </Card>
        )}
      </View>

      {/* Quick Actions */}
      <View style={{ gap: 12 }}>
        <T size={20} w="bold" color={C.text} accessibilityRole="header">Quick actions</T>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable
            onPress={() => openSheet('postjob')}
            accessibilityRole="button"
            accessibilityLabel="Post a campaign brief"
            style={({ pressed }) => ({
              flex: 1,
              minHeight: 118,
              padding: 16,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: C.border,
              backgroundColor: C.surface,
              justifyContent: 'space-between',
              transform: [{ scale: pressed ? 0.985 : 1 }],
              ...shadowSm,
            })}
          >
            <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: C.amberBg, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="add-circle" size={20} color={C.amber} />
            </View>
            <View style={{ gap: 3 }}>
              <T size={14.5} w="bold" color={C.text}>Post a brief</T>
              <T size={12} color={C.muted2}>Set terms &amp; budget</T>
            </View>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Search')}
            accessibilityRole="button"
            accessibilityLabel="Find and shortlist creators"
            style={({ pressed }) => ({
              flex: 1,
              minHeight: 118,
              padding: 16,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: C.border,
              backgroundColor: C.surface,
              justifyContent: 'space-between',
              transform: [{ scale: pressed ? 0.985 : 1 }],
              ...shadowSm,
            })}
          >
            <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="people" size={19} color={C.primary} />
            </View>
            <View style={{ gap: 3 }}>
              <T size={14.5} w="bold" color={C.text}>Find creators</T>
              <T size={12} color={C.muted2}>Explore talent directory</T>
            </View>
          </Pressable>
        </View>
      </View>

      {/* Campaign & Escrow Overview */}
      <Pressable
        onPress={() => navigation.navigate('Orders')}
        accessibilityRole="button"
        accessibilityLabel="View campaign and payment overview"
        style={({ pressed }) => ({
          transform: [{ scale: pressed ? 0.99 : 1 }],
        })}
      >
        <View style={{ padding: 22, borderRadius: 24, backgroundColor: C.dark, gap: 18 }}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Row style={{ gap: 8, alignItems: 'center' }}>
              <LogoMark size={22} />
              <T size={11.5} w="semi" track={0.8} color={C.onDarkMuted}>ESCROW &amp; OVERVIEW</T>
            </Row>
            <Row style={{ gap: 4, alignItems: 'center' }}>
              <T size={12} w="semi" color={C.onDarkMuted}>Payments</T>
              <Ionicons name="chevron-forward" size={15} color={C.onDarkMuted} />
            </Row>
          </Row>

          <View style={{ gap: 4 }}>
            <T size={12.5} color={C.onDarkMuted}>Held securely in escrow</T>
            <T size={36} w="bold" color={C.onDark}>{inr(escrowTotal)}</T>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1, padding: 12, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', gap: 3 }}>
              <T size={22} w="bold" color={C.onDark}>{hiredCount}</T>
              <T size={11.5} color={C.onDarkMuted}>Creators hired</T>
            </View>
            <View style={{ flex: 1, padding: 12, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', gap: 3 }}>
              <T size={22} w="bold" color={C.onDark}>{activeCampaignCount}</T>
              <T size={11.5} color={C.onDarkMuted}>Active campaigns</T>
            </View>
          </View>
        </View>
      </Pressable>

      {/* Creators to Consider */}
      <View style={{ gap: 14 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <T size={20} w="bold" color={C.text} accessibilityRole="header">Featured creators</T>
          <Pressable onPress={() => navigation.navigate('Search')} hitSlop={8} accessibilityRole="button" accessibilityLabel="See all creators">
            <T size={13} w="semi" color={C.primary}>Browse all →</T>
          </Pressable>
        </Row>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
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
          <T size={12.5} color={C.muted}>
            {loadingCreators ? 'Loading creator profiles…' : 'No public creator profiles are available yet.'}
          </T>
        ) : null}
      </View>

    </Screen>
  );
}
