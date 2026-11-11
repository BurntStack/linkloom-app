import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, inr } from '../../theme';
import { useApp } from '../../store';
import { Card, Row, T } from '../../components/ui';
import { Page } from './PageLayout';

export function Reporting({ navigation }: any) {
  const { orders, refreshOrders, showToast } = useApp();
  const totalOrderValue = orders.reduce((total: number, order: any) => total + (order.held || 0), 0);
  const releasedValue = orders.filter((order: any) => order.stage === 'released').reduce((total: number, order: any) => total + (order.held || 0), 0);
  const escrowValue = orders.filter((order: any) => order.stage !== 'released').reduce((total: number, order: any) => total + (order.held || 0), 0);
  const awaitingReview = orders.filter((order: any) => order.stage === 'delivered').length;
  const releasedPercent = totalOrderValue ? Math.round((releasedValue / totalOrderValue) * 100) : 0;
  const escrowPercent = totalOrderValue ? 100 - releasedPercent : 0;

  useEffect(() => {
    refreshOrders('brand').catch((error: unknown) => showToast(error instanceof Error ? error.message : 'Unable to load order totals.'));
  }, []);

  return (
    <Page title="Reports" navigation={navigation}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <T size={12} color={C.muted2}>Based on {orders.length} campaign {orders.length === 1 ? 'order' : 'orders'}</T>
        <View style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: C.border2, backgroundColor: C.surface }}>
          <T size={11} w="semi" color={C.text}>All orders</T>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Card style={{ flex: 1, minHeight: 112, justifyContent: 'space-between', padding: 14 }}>
          <Row style={{ gap: 6 }}>
            <Ionicons name="cash-outline" size={15} color={C.muted2} />
            <T size={11} color={C.muted2}>Total order value</T>
          </Row>
          <T size={21} w="semi" color={C.text}>{inr(totalOrderValue)}</T>
          <T size={10.5} color={C.muted}>{orders.length} campaign orders</T>
        </Card>
        <Card style={{ flex: 1, minHeight: 112, justifyContent: 'space-between', padding: 14 }}>
          <Row style={{ gap: 6 }}>
            <Ionicons name="checkmark-circle-outline" size={15} color={C.green} />
            <T size={11} color={C.muted2}>Released</T>
          </Row>
          <T size={21} w="semi" color={C.text}>{inr(releasedValue)}</T>
          <T size={10.5} color={C.muted}>Paid to creators</T>
        </Card>
      </View>
      <Card style={{ gap: 14, padding: 15 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <T size={15} w="semi" color={C.text}>Order value</T>
          <T size={11} color={C.muted2}>All time</T>
        </Row>
        <T size={27} w="semi" color={C.text}>{inr(totalOrderValue)}</T>
        <View style={{ height: 9, flexDirection: 'row', overflow: 'hidden', borderRadius: 99, backgroundColor: C.surfaceSoft }}>
          {releasedPercent ? <View style={{ width: `${releasedPercent}%`, backgroundColor: C.green }} /> : null}
          {escrowPercent ? <View style={{ width: `${escrowPercent}%`, backgroundColor: C.primary }} /> : null}
        </View>
        <View style={{ gap: 10 }}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Row style={{ gap: 8, alignItems: 'center' }}>
              <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: C.green }} />
              <T size={12} color={C.text}>Released to creators</T>
            </Row>
            <T size={12} w="semi" color={C.text}>{inr(releasedValue)}</T>
          </Row>
          <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Row style={{ gap: 8, alignItems: 'center' }}>
              <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: C.primary }} />
              <T size={12} color={C.text}>Still in escrow</T>
            </Row>
            <T size={12} w="semi" color={C.text}>{inr(escrowValue)}</T>
          </Row>
          <View style={{ height: 1, backgroundColor: C.borderSubtle }} />
          <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <T size={12} color={C.textSecondary}>Deliveries awaiting review</T>
            <T size={12} w="semi" color={C.text}>{awaitingReview}</T>
          </Row>
        </View>
      </Card>
      <T size={11} color={C.muted} style={{ lineHeight: 17 }}>
        Totals are calculated from your live campaign orders. Reach analytics and report exports aren’t available here yet.
      </T>
    </Page>
  );
}
