import React, { useCallback, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Btn, Card, Field, Heading, Row, T } from '../../../components/ui';
import { C, inr } from '../../../theme';
import { useApp } from '../../../store';
import { Empty, Page } from '../shared';

type BidFilter = 'waiting' | 'won' | 'closed';

function bidGroup(status: unknown): BidFilter {
  const value = String(status || '').toLowerCase().replace(/[\s-]+/g, '_');
  if (['accepted', 'hired', 'won', 'selected', 'awarded', 'confirmed', 'pending_payment', 'awaiting_payment'].some((word) => value.includes(word))) return 'won';
  if (['rejected', 'declined', 'withdrawn', 'cancelled', 'closed', 'not_picked', 'not_selected', 'unsuccessful', 'completed', 'approved', 'released', 'paid', 'expired'].some((word) => value.includes(word))) return 'closed';
  return 'waiting';
}

function statusLabel(status: unknown) {
  const value = String(status || '').toLowerCase().replace(/[\s-]+/g, '_');
  if (['pending_payment', 'awaiting_payment'].some((word) => value.includes(word))) return 'Accepted · awaiting brand payment';
  if (['accepted', 'hired', 'won', 'selected', 'awarded', 'confirmed'].some((word) => value.includes(word))) return 'Accepted by brand';
  if (value === 'paid') return 'Paid';
  if (['completed', 'approved', 'released'].some((word) => value.includes(word))) return 'Completed';
  if (value.includes('withdraw')) return 'Withdrawn';
  if (value.includes('reject') || value.includes('declin') || value.includes('not_picked') || value.includes('not picked')) return 'Not picked';
  if (value.includes('cancel')) return 'Cancelled';
  if (value.includes('view')) return 'Viewed by brand';
  return String(status || 'Closed');
}

function BidProgress({ status }: { status: unknown }) {
  const value = String(status || '').toLowerCase();
  const viewed = value.includes('view');
  const decided = bidGroup(value) !== 'waiting';
  const currentStep = decided ? 2 : viewed ? 1 : 0;
  const steps = ['Sent', 'Viewed', 'Decision'];

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 12 }}>
      {steps.map((step, index) => {
        const done = index < currentStep;
        const current = index === currentStep;
        return (
          <React.Fragment key={step}>
            <View style={{ alignItems: 'center', gap: 5 }}>
              <View style={{
                width: 23,
                height: 23,
                borderRadius: 12,
                borderWidth: done ? 0 : current ? 5 : 2,
                borderColor: current ? C.pinkText : C.border2,
                backgroundColor: done ? C.text : C.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {done ? <Ionicons name="checkmark" size={14} color={C.surface} /> : null}
              </View>
              <T size={10.5} w={current ? 'semi' : 'reg'} color={current ? C.text : C.muted}>{step}</T>
            </View>
            {index < steps.length - 1 ? (
              <View style={{ flex: 1, height: 2, marginTop: 10, borderStyle: done ? 'solid' : 'dashed', backgroundColor: done ? C.text : C.border2 }} />
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );
}

function BidCard({
  bid,
  busy,
  onEdit,
  onWithdraw,
  children,
}: {
  bid: any;
  busy: boolean;
  onEdit: () => void;
  onWithdraw: () => void;
  children?: React.ReactNode;
}) {
  const group = bidGroup(bid.status);
  const submittedLabel = bid.submittedAt ? `Sent ${new Date(bid.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : 'Waiting for the brand';
  const isEditable = ['pending', 'submitted'].includes(String(bid.status).toLowerCase());
  const isWithdrawable = group === 'waiting';

  if (group === 'closed') {
    const label = statusLabel(bid.status);
    const paid = label === 'Paid';
    const priceStyle = label === 'Not picked' || label === 'Withdrawn'
      ? { color: C.muted3, textDecorationLine: 'line-through' as const }
      : { color: C.text };
    return (
      <View style={{ paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.border, gap: 10 }}>
        <Row style={{ alignItems: 'flex-start', gap: 10 }}>
          <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
            <T size={16} w="semi" color={C.primary}>{String(bid.jobTitle || 'C').slice(0, 1).toUpperCase()}</T>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <T size={14} w="semi" color={C.text} numberOfLines={2}>{bid.jobTitle}</T>
            <T size={11} color={C.muted}>
              {[bid.brandName || bid.brand?.name, bid.platform || bid.kind, bid.closedAt && `closed ${new Date(bid.closedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`]
                .filter(Boolean).join(' · ') || submittedLabel}
            </T>
          </View>
          <T size={16} w="semi" style={priceStyle}>{inr(bid.price)}</T>
        </Row>
        <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 18, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: paid ? C.greenBg : C.surfaceSubtle }}>
          {paid ? <Ionicons name="checkmark" size={14} color={C.green} /> : null}
          <T size={11.5} w="semi" color={paid ? C.green : C.muted2}>{label}</T>
        </View>
        {isEditable ? <Btn label="Edit proposal" variant="outline" small onPress={onEdit} /> : null}
        {isWithdrawable && !paid ? <Btn label={busy ? 'Withdrawing…' : 'Withdraw proposal'} variant="ghost" small disabled={busy} onPress={onWithdraw} /> : null}
        {children}
      </View>
    );
  }

  return (
    <Card style={{ gap: 10, borderColor: group === 'waiting' ? C.creatorAccent : C.border, borderWidth: group === 'waiting' ? 1.5 : 1 }}>
      <Row style={{ alignItems: 'flex-start', gap: 10 }}>
        <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
          <T size={16} w="semi" color={C.primary}>{String(bid.jobTitle || 'C').slice(0, 1).toUpperCase()}</T>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <T size={14} w="semi" color={C.text} numberOfLines={2}>{bid.jobTitle}</T>
          <T size={11} color={C.muted}>Campaign proposal</T>
        </View>
        <T size={17} w="semi" color={C.text}>{inr(bid.price)}</T>
      </Row>
      <BidProgress status={bid.status} />
      {bid.proposal ? <T size={12} color={C.muted} numberOfLines={3} style={{ lineHeight: 18 }}>{bid.proposal}</T> : null}
      {bid.postDate ? <T size={11} color={C.muted}>Post date · {bid.postDate}</T> : null}
      <Row style={{ justifyContent: 'space-between', alignItems: 'center', paddingTop: 9, borderTopWidth: 1, borderTopColor: C.border }}>
        <T size={11.5} color={C.muted}>{submittedLabel}</T>
        <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 18, backgroundColor: group === 'waiting' ? C.pinkBg : C.surfaceSubtle }}>
          <T size={11} w="semi" color={group === 'waiting' ? C.pinkText : C.muted2}>{group === 'won' ? 'Won' : 'Sent'}</T>
        </View>
      </Row>
      {children}
      {isEditable ? <Btn label="Edit proposal" variant="outline" small onPress={onEdit} /> : null}
      {isWithdrawable ? <Btn label={busy ? 'Withdrawing…' : 'Withdraw proposal'} variant="ghost" small disabled={busy} onPress={onWithdraw} /> : null}
    </Card>
  );
}

export function MyBids({ navigation }: any) {
  const { creatorProfile, creatorBids, refreshCreatorBids, withdrawBid, updateBid, showToast } = useApp();
  const myBids = creatorBids.filter((bid: any) => bid.creatorId === creatorProfile?.creatorId);
  const [refreshing, setRefreshing] = useState(false);
  const refreshInFlight = useRef(false);
  const refreshErrorShown = useRef(false);
  const [busyBid, setBusyBid] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editViews, setEditViews] = useState('');
  const [editDays, setEditDays] = useState('');
  const refreshBids = useCallback(async () => {
    if (refreshInFlight.current) return;
    refreshInFlight.current = true;
    setRefreshing(true);
    try {
      await refreshCreatorBids();
      refreshErrorShown.current = false;
    } catch (error) {
      if (!refreshErrorShown.current) {
        showToast(error instanceof Error ? error.message : 'Unable to refresh your bids.');
        refreshErrorShown.current = true;
      }
    } finally {
      refreshInFlight.current = false;
      setRefreshing(false);
    }
  }, [refreshCreatorBids, showToast]);

  useFocusEffect(useCallback(() => {
    void refreshBids();
    const interval = setInterval(() => {
      if (AppState.currentState === 'active') void refreshBids();
    }, 30_000);
    return () => clearInterval(interval);
  }, [refreshBids]));
  const [filter, setFilter] = useState<BidFilter>('waiting');
  const tabs: { key: BidFilter; label: string }[] = [
    { key: 'waiting', label: 'Waiting' },
    { key: 'won', label: 'Won' },
    { key: 'closed', label: 'Closed' },
  ];
  const filteredBids = myBids.filter((bid: any) => bidGroup(bid.status) === filter);

  const editForm = (bid: any) => (
    <View style={{ gap: 9 }}>
      <Field label="Price (₹)" value={editPrice} onChangeText={(value) => setEditPrice(value.replace(/\D/g, ''))} keyboardType="number-pad" />
      <Field label="Proposal message" value={editMessage} onChangeText={setEditMessage} multiline />
      <Field label="Expected views" value={editViews} onChangeText={(value) => setEditViews(value.replace(/\D/g, ''))} keyboardType="number-pad" />
      <Field label="Delivery days" value={editDays} onChangeText={(value) => setEditDays(value.replace(/\D/g, ''))} keyboardType="number-pad" />
      <Row style={{ gap: 8 }}>
        <Btn label="Cancel" variant="outline" flex onPress={() => setEditingId(null)} />
        <Btn label={busyBid === bid.id ? 'Saving…' : 'Save proposal'} flex disabled={busyBid === bid.id} onPress={async () => {
          if (!Number(editPrice) || !editMessage.trim() || !Number(editDays)) return showToast('Enter a price, message, and delivery time.');
          setBusyBid(bid.id);
          try {
            await updateBid(bid.jobId, bid.id, {
              price: Number(editPrice),
              message: editMessage.trim(),
              ...(editViews ? { expectedViews: Number(editViews) } : {}),
              deliveryDays: Number(editDays),
            });
            showToast('Proposal updated.');
            setEditingId(null);
          } catch (error) {
            showToast(error instanceof Error ? error.message : 'Unable to update proposal.');
          } finally {
            setBusyBid(null);
          }
        }} />
      </Row>
    </View>
  );

  return (
    <Page navigation={navigation}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Heading title="My bids" />
        <Btn
          label={refreshing ? 'Refreshing…' : 'Refresh'}
          icon="refresh-outline"
          variant="outline"
          small
          disabled={refreshing}
          onPress={() => void refreshBids()}
        />
      </Row>
      <Row style={{ borderBottomWidth: 1, borderBottomColor: C.border }}>
        {tabs.map((tab) => {
          const count = myBids.filter((bid: any) => bidGroup(bid.status) === tab.key).length;
          const active = filter === tab.key;
          return (
            <Btn
              key={tab.key}
              label={`${tab.label}  ${count}`}
              variant="ghost"
              onPress={() => setFilter(tab.key)}
              style={{ flex: 1, borderRadius: 0, borderBottomWidth: active ? 3 : 0, borderBottomColor: C.text }}
            />
          );
        })}
      </Row>
      {filteredBids.length ? filteredBids.map((bid: any) => (
        <BidCard
          key={bid.id}
          bid={bid}
          busy={busyBid === bid.id}
          onEdit={() => {
            setEditingId(bid.id);
            setEditPrice(String(bid.price));
            setEditMessage(bid.proposal || '');
            setEditViews(String(bid.expectedViews || ''));
            setEditDays(String(bid.deliveryDays || ''));
          }}
          onWithdraw={async () => {
            setBusyBid(bid.id);
            try {
              await withdrawBid(bid.jobId, bid.id);
              showToast('Proposal withdrawn.');
            } catch (error) {
              showToast(error instanceof Error ? error.message : 'Unable to withdraw proposal.');
            } finally {
              setBusyBid(null);
            }
          }}
        >
          {editingId === bid.id ? editForm(bid) : null}
        </BidCard>
      )) : (
        <Empty
          icon="paper-plane-outline"
          title={filter === 'waiting' ? 'No bids waiting' : filter === 'won' ? 'No won bids yet' : 'No closed bids'}
          body="Your proposals in this category will appear here."
          action="Find jobs"
          onPress={() => navigation.navigate('FindJobs')}
        />
      )}
      {filter === 'closed' && filteredBids.length ? (
        <T size={11.5} color={C.muted} style={{ textAlign: 'center', paddingVertical: 8 }}>Closed bids stay here for 12 months.</T>
      ) : null}
    </Page>
  );
}
