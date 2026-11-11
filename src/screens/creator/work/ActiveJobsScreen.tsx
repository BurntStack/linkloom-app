import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Row, T } from '../../../components/ui';
import { C, inr } from '../../../theme';
import { useApp } from '../../../store';
import { CreatorHeader, Empty, Page } from '../shared';

type ActiveFilter = 'all' | 'yourMove' | 'withBrand' | 'inProgress';

function canCreatorAct(order: any) {
  const actions = (order?.allowedActions || []).map((action: any) =>
    String(typeof action === 'string' ? action : action.code || action.name || action.action || '')
      .toLowerCase().replace(/[_\s-]/g, ''),
  );
  return actions.some((action: string) => ['deliverable', 'submitcontent'].some((key) => action.includes(key))) ||
    String(order?.status || '').toLowerCase().includes('revision');
}

function orderFilter(order: any): ActiveFilter {
  if (canCreatorAct(order)) return 'yourMove';
  if (order.stage === 'delivered') return 'withBrand';
  return 'inProgress';
}

function Milestones({ order }: { order: any }) {
  const inRevision = String(order?.status || '').toLowerCase().includes('revision');
  const labels = inRevision ? ['Funded', 'Draft', 'Revision', 'Review', 'Paid'] : ['Funded', 'Draft', 'Review', 'Paid'];
  const current = order.stage === 'released'
    ? labels.length - 1
    : inRevision
      ? 2
      : order.stage === 'delivered' ? 2 : 1;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 6 }}>
      {labels.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <React.Fragment key={label}>
            <View style={{ alignItems: 'center', gap: 5 }}>
              <View style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: done ? 0 : active ? 5 : 2,
                borderColor: active ? C.creatorAccent : C.border2,
                backgroundColor: done ? C.text : C.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {done ? <Ionicons name={index === 0 ? 'lock-closed' : 'checkmark'} size={12} color={C.surface} /> : null}
              </View>
              <T size={10} w={active ? 'semi' : 'reg'} color={active ? C.text : C.muted}>{label}</T>
            </View>
            {index < labels.length - 1 ? (
              <View style={{ flex: 1, height: 2, marginTop: 10, backgroundColor: done ? C.text : C.border2 }} />
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );
}

function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        minHeight: 40,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: selected ? C.text : C.border2,
        backgroundColor: selected ? C.text : C.surface,
        justifyContent: 'center',
      }}
    >
      <T size={12} w="semi" color={selected ? C.surface : C.text}>{label}</T>
    </Pressable>
  );
}

function ActiveOrderCard({ order, onPress }: { order: any; onPress: () => void }) {
  const actionNeeded = canCreatorAct(order);
  const stageLabel = actionNeeded ? 'Your move' : order.stage === 'delivered' ? 'With the brand' : 'In progress';
  const due = order.draftDue ? new Date(order.draftDue) : null;
  const dueLabel = due && !Number.isNaN(due.getTime())
    ? `Due ${due.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}`
    : '';
  return (
    <Card onPress={onPress} style={{
      gap: 12,
      padding: 14,
      borderWidth: actionNeeded ? 1.5 : 1,
      borderColor: actionNeeded ? C.creatorAccent : C.border,
    }}>
      <Row style={{ alignItems: 'flex-start', gap: 10 }}>
        <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
          <T size={16} w="semi" color={C.primary}>{String(order.title || 'B').slice(0, 1).toUpperCase()}</T>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <T size={15} w="semi" color={C.text} numberOfLines={2}>{order.title}</T>
          <T size={11} color={C.muted}>{order.brand?.name || order.brandName || 'Campaign'} · {order.kind || 'Creator campaign'}</T>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 6, backgroundColor: C.accentSoft }}>
          <Ionicons name="lock-closed-outline" size={13} color={C.pinkText} />
          <T size={11} w="semi" color={C.pinkText}>{inr(order.held || order.fee || 0)}</T>
        </View>
      </Row>
      <Milestones order={order} />
      <Row style={{ justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: C.border, gap: 8 }}>
        <T size={12} w={actionNeeded ? 'semi' : 'reg'} color={actionNeeded ? C.pinkText : C.text} style={{ flex: 1 }}>
          {stageLabel}
        </T>
        <T size={11} color={C.muted}>{dueLabel}</T>
      </Row>
    </Card>
  );
}

export function CreatorActiveJobs({ navigation }: any) {
  const { orders, openSheet } = useApp();
  const [filter, setFilter] = useState<ActiveFilter>('all');
  const activeOrders = orders.filter((order: any) => order.stage !== 'released');
  const shownOrders = useMemo(
    () => filter === 'all' ? activeOrders : activeOrders.filter((order: any) => orderFilter(order) === filter),
    [activeOrders, filter],
  );
  const escrow = activeOrders.reduce((total: number, order: any) => total + (order.held || 0), 0);
  const tabs: { key: ActiveFilter; label: string }[] = [
    { key: 'all', label: `All ${activeOrders.length}` },
    { key: 'yourMove', label: `Your move ${activeOrders.filter(canCreatorAct).length}` },
    { key: 'withBrand', label: `With brand ${activeOrders.filter((order: any) => order.stage === 'delivered' && !canCreatorAct(order)).length}` },
    { key: 'inProgress', label: 'In progress' },
  ];

  return (
    <Page navigation={navigation} showTopBar={false} header={<CreatorHeader navigation={navigation} title="Active jobs" />}>
      <View style={{ gap: 5 }}>
        <T size={30} w="semi" track={-0.8} color={C.text}>Active jobs</T>
        <T size={13} color={C.muted}><T size={13} w="semi" color={C.pinkText}>{inr(escrow)} in escrow</T> · {activeOrders.length} jobs</T>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {tabs.map((tab) => (
          <FilterChip key={tab.key} label={tab.label} selected={filter === tab.key} onPress={() => setFilter(tab.key)} />
        ))}
      </ScrollView>
      {shownOrders.length ? shownOrders.map((order: any) => (
        <ActiveOrderCard key={order.id} order={order} onPress={() => openSheet('order', { orderId: order.id })} />
      )) : (
        <Empty
          icon="briefcase-outline"
          title={activeOrders.length ? 'No jobs in this view' : 'No active jobs'}
          body={activeOrders.length ? 'Try another filter to see your active campaign work.' : 'Accepted proposals and active order work will appear here.'}
          action={activeOrders.length ? undefined : 'Browse campaigns'}
          onPress={() => navigation.navigate('FindJobs')}
        />
      )}
    </Page>
  );
}
