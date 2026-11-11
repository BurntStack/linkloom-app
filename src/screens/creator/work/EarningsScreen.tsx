import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Heading, Row, T } from '../../../components/ui';
import { C, inr } from '../../../theme';
import { useApp } from '../../../store';
import { CreatorHeader, Empty, Page } from '../shared';

export function CreatorEarnings({ navigation }: any) {
  const { orders } = useApp();
  const releasedOrders = orders.filter((order: any) => order.stage === 'released');
  const activeOrders = orders.filter((order: any) => order.stage !== 'released');
  const earned = releasedOrders.reduce((total: number, order: any) => total + (order.fee || 0), 0);
  const escrow = activeOrders.reduce((total: number, order: any) => total + (order.held || 0), 0);

  return (
    <Page navigation={navigation} showTopBar={false} header={<CreatorHeader navigation={navigation} title="Earnings" />}>
      <View style={{ gap: 5 }}>
        <T size={29} w="semi" track={-0.8} color={C.text}>Your earnings</T>
        <T size={13} color={C.muted}>Order payments and escrow at a glance.</T>
      </View>
      <Card style={{ gap: 16, padding: 18, backgroundColor: C.text }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <View style={{ flex: 1, gap: 6 }}>
            <T size={12} color={C.onDarkMuted}>Released order value</T>
            <T size={30} w="bold" track={-0.8} color={C.onDark}>{inr(earned)}</T>
          </View>
          <View style={{ width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: C.darkAccent }}>
            <Ionicons name="wallet-outline" size={21} color={C.onDark} />
          </View>
        </Row>
        <Row style={{ justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: C.darkDivider, paddingTop: 13 }}>
          <T size={11} color={C.onDarkMuted}>{releasedOrders.length} released {releasedOrders.length === 1 ? 'order' : 'orders'}</T>
          <T size={11} w="semi" color={C.onDark}>Escrowed · {inr(escrow)}</T>
        </Row>
      </Card>
      <Row style={{ gap: 10 }}>
        <Card style={{ flex: 1, gap: 7, padding: 14 }}>
          <T size={11} color={C.muted}>Released orders</T>
          <T size={20} w="bold" color={C.text}>{releasedOrders.length}</T>
          <T size={10} color={C.muted}>Order value: {inr(earned)}</T>
        </Card>
        <Card style={{ flex: 1, gap: 7, padding: 14 }}>
          <T size={11} color={C.muted}>In progress</T>
          <T size={20} w="bold" color={C.text}>{activeOrders.length}</T>
          <T size={10} color={C.muted}>Held in escrow: {inr(escrow)}</T>
        </Card>
      </Row>
      <Heading title="Order activity" sub="Values reflect your campaign orders, not bank withdrawals." />
      {orders.length ? [...orders].sort((a: any, b: any) => {
        const orderTime = (value: string) => {
          const parsed = Date.parse(value || '');
          return Number.isNaN(parsed) ? 0 : parsed;
        };
        return orderTime(b.deliveredOn || b.paidOn) - orderTime(a.deliveredOn || a.paidOn);
      }).map((order: any) => {
        const isReleased = order.stage === 'released';
        const value = isReleased ? order.fee || 0 : order.held || order.fee || 0;
        return (
          <Card key={order.id} style={{ gap: 10, padding: 14 }}>
            <Row style={{ alignItems: 'flex-start', gap: 10 }}>
              <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: isReleased ? C.emeraldBg : C.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={isReleased ? 'checkmark-circle-outline' : 'lock-closed-outline'} size={19} color={isReleased ? C.emerald : C.pinkText} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <T size={13} w="semi" color={C.text} numberOfLines={2}>{order.title}</T>
                <T size={11} color={C.muted}>{order.kind || 'Campaign order'} · {order.code || 'Order'}</T>
              </View>
              <T size={13} w="semi" color={C.text}>{inr(value)}</T>
            </Row>
            <Row style={{ justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: C.border, paddingTop: 9 }}>
              <T size={11} color={isReleased ? C.emerald : C.pinkText}>{isReleased ? 'Released by brand' : 'In escrow'}</T>
              <T size={10} color={C.muted}>{order.deliveredOn || order.paidOn || ''}</T>
            </Row>
          </Card>
        );
      }) : (
        <Empty
          icon="wallet-outline"
          title="No order activity yet"
          body="Accepted campaign orders and released payments will appear here."
          action="Browse campaigns"
          onPress={() => navigation.navigate('FindJobs')}
        />
      )}
      <Card style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 9, padding: 13 }}>
        <Ionicons name="information-circle-outline" size={17} color={C.muted} />
        <T size={11} color={C.muted} style={{ flex: 1, lineHeight: 16 }}>
          Bank payout setup and withdrawal tracking are not available yet. Released means the brand released the order funds; it does not confirm a bank transfer.
        </T>
      </Card>
    </Page>
  );
}
