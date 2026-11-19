import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { C, shadowSm, TYPO } from '../../theme';
import { useApp } from '../../store';
import { Card, Row, T } from '../../components/ui';

import { Screen, Grid } from './shared';

export function Dashboard({ navigation }: any) {
  const { brandName, openSheet, jobs, orders } = useApp();
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const jobsForReview = jobs.filter((job: any) => job.status === 'open' && job.bidsCount > 0);
  const ordersForApproval = orders.filter((order: any) => order.stage === 'delivered');
  const attentionCount = jobsForReview.length + ordersForApproval.length;
  const activeJobs = jobs.filter((job: any) => job.status === 'open' || job.status === 'progress').length;

  const Stat = ({
    label,
    value,
    icon,
    to,
  }: {
    label: string;
    value: string | number;
    icon: any;
    to: string;
  }) => (
    <Card onPress={() => navigation.navigate(to)} style={{ flex: 1, gap: 8, padding: 14 }}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <T size={12} w="med" color={C.muted}>{label}</T>
        <Ionicons name={icon} size={16} color={C.primary} />
      </Row>
      <T size={22} w="bold" color={C.text}>{value}</T>
    </Card>
  );

  return (
    <Screen navigation={navigation}>
      {/* Brand & Greeting Header */}
      <View style={{ gap: 2 }}>
        <Row style={{ gap: 6, alignItems: 'center' }}>
          <T size={11} w="bold" color={C.primary} track={0.5}>
            {greet.toUpperCase()}
          </T>
          <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: C.muted3 }} />
          <T size={11} color={C.muted}>
            CAMPAIGN HUB
          </T>
        </Row>
        <Row style={{ gap: 7, alignItems: 'center' }}>
          <T size={TYPO.h1} w="bold" track={-0.5} color={C.text}>
            {brandName}
          </T>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
              backgroundColor: C.greenBg,
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 6,
            }}
          >
            <Ionicons name="shield-checkmark" size={11} color={C.green} />
            <T size={9.5} w="bold" color={C.green}>
              VERIFIED
            </T>
          </View>
        </Row>
        <T size={TYPO.sub} color={C.muted} style={{ lineHeight: 17 }}>
          Find creators, run bids, and approve live deliverables safely.
        </T>
      </View>

      {/* Primary Action Buttons */}
      <Row style={{ gap: 8 }}>
        <Pressable
          onPress={() => openSheet('postjob')}
          style={({ pressed }) => ({
            flex: 1.25,
            minHeight: 48,
            borderRadius: 13,
            backgroundColor: C.primary,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingHorizontal: 12,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
            <Ionicons name="add-circle-outline" size={17} color={C.onPrimary} />
            <T size={12.5} w="bold" color={C.onPrimary}>
            Post a Brief
          </T>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('Search')}
          style={({ pressed }) => ({
            flex: 1,
            minHeight: 48,
            borderRadius: 13,
            backgroundColor: pressed ? C.surfacePressed : C.primaryLight,
            borderWidth: 1,
            borderColor: C.primaryLight,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingHorizontal: 10,
            transform: [{ scale: pressed ? 0.98 : 1 }],
            ...shadowSm,
          })}
        >
          <Ionicons name="search" size={15} color={C.primary} />
          <T size={12} w="semi" color={C.primary}>
            Find Creators
          </T>
        </Pressable>
      </Row>

      {/* Action Required Alert Banner */}
      {attentionCount > 0 ? (
        <Card
          highlight
          onPress={() => navigation.navigate(jobsForReview.length ? 'Jobs' : 'Orders')}
          style={{ padding: 12, backgroundColor: C.primaryLight, borderLeftWidth: 3, borderLeftColor: C.primary }}
        >
          <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Row style={{ gap: 6, alignItems: 'center' }}>
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: C.primaryLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="notifications-outline" size={14} color={C.primary} />
              </View>
              <T size={12.5} w="bold" color={C.text}>
                {attentionCount} {attentionCount === 1 ? 'item needs' : 'items need'} your review
              </T>
            </Row>
            <View
              style={{
                backgroundColor: C.primaryLight,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 99,
              }}
            >
              <T size={10} w="bold" color={C.primary}>
                VIEW
              </T>
            </View>
          </Row>

        </Card>
      ) : null}

      {/* Key Metrics Stats Grid */}
      <Row style={{ gap: 10 }}>
        <Stat label="Active campaigns" value={activeJobs} icon="megaphone-outline" to="Jobs" />
        <Stat label="Active orders" value={orders.length} icon="briefcase-outline" to="Orders" />
      </Row>

    </Screen>
  );
}
