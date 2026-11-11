import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { C, inr } from '../../theme';
import { useApp } from '../../store';
import { Avatar, Card, Heading, Row, T } from '../../components/ui';
import { creatorById } from '../../data';
import { Screen } from './shared';

export function Orders({ navigation }: any) {
  const { orders, openSheet } = useApp();
  const awaiting = orders.filter((o: any) => o.stage === 'delivered').length;
  const stage = (s: string) =>
    s === 'working' ? 'In progress' : s === 'delivered' ? 'Needs review' : 'Released';

  const totalHeld = orders
    .filter((o: any) => o.stage !== 'released')
    .reduce((sum: number, o: any) => sum + o.held, 0);
  const released = orders
    .filter((o: any) => o.stage === 'released')
    .reduce((sum: number, o: any) => sum + o.held, 0);
  const awaitingTotal = orders
    .filter((o: any) => o.stage === 'delivered')
    .reduce((sum: number, o: any) => sum + o.held, 0);

  return (
    <Screen navigation={navigation}>
      <Heading title="Payments" />

      <Card style={{ gap: 12, padding: 16, backgroundColor: C.primary, borderColor: C.primary, overflow: 'hidden' }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Row style={{ gap: 7, alignItems: 'center' }}>
            <Ionicons name="lock-closed-outline" size={16} color={C.onPrimary} />
            <T size={12} w="semi" color={C.onPrimary}>Held in escrow</T>
          </Row>
          <Ionicons name="shield-checkmark-outline" size={18} color={C.onPrimary} />
        </Row>
        <T size={34} w="semi" color={C.onPrimary}>{inr(totalHeld)}</T>
        <T size={12} color={C.onPrimary}>Released only when you approve</T>
        <Row style={{ gap: 8 }}>
          <View style={{ flex: 1, gap: 3, padding: 10, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.16)' }}>
            <T size={13} w="semi" color={C.onPrimary}>{inr(awaitingTotal)}</T>
            <T size={10.5} color={C.onPrimary}>{awaiting} to review</T>
          </View>
          <View style={{ flex: 1, gap: 3, padding: 10, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.16)' }}>
            <T size={13} w="semi" color={C.onPrimary}>{inr(released)}</T>
            <T size={10.5} color={C.onPrimary}>Released</T>
          </View>
        </Row>
      </Card>

      <View style={{ gap: 3 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center', paddingBottom: 7 }}>
          <T size={11} w="bold" track={0.7} color={C.muted2}>CAMPAIGN ORDERS</T>
          <T size={11} color={C.muted2}>{orders.length}</T>
        </Row>
        {orders.map((o: any) => {
          const c = creatorById(o.creatorId);
          return (
            <Pressable
              key={o.id}
              onPress={() => openSheet('order', { orderId: o.id })}
              accessibilityRole="button"
              style={({ pressed }) => ({
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: C.borderSubtle,
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <Row style={{ alignItems: 'flex-start', gap: 11 }}>
                <Avatar name={c.name} size={42} photo={c.photo} />
                <View style={{ flex: 1, gap: 5 }}>
                  <T size={14} w="semi" color={C.text} numberOfLines={2}>{o.title}</T>
                  <T size={12} color={C.textSecondary}>{c.name} · {o.kind}</T>
                  <View style={{ alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 99, backgroundColor: o.stage === 'delivered' ? C.amberBg : o.stage === 'released' ? C.greenBg : C.primaryLight }}>
                    <T size={11} w="semi" color={o.stage === 'delivered' ? C.amber : o.stage === 'released' ? C.green : C.primary}>{stage(o.stage)}</T>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <T size={15} w="semi" color={C.text}>{inr(o.held)}</T>
                  <T size={11} color={C.muted2}>{o.stage === 'delivered' ? o.deliveredOn : o.paidOn}</T>
                </View>
              </Row>
            </Pressable>
          );
        })}
      </View>
      {!orders.length ? (
        <Card style={{ alignItems: 'center', gap: 7, padding: 22 }}>
          <Ionicons name="wallet-outline" size={25} color={C.muted3} />
          <T size={14} w="semi" color={C.text}>No payments yet</T>
          <T size={12} color={C.muted2}>Campaign orders will appear here once a creator is hired.</T>
        </Card>
      ) : null}
    </Screen>
  );
}
