import React, { useEffect, useState } from 'react';
import { View, Pressable, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, inr } from '../../../theme';
import { useApp } from '../../../store';
import { Avatar, Btn, Card, Row, Sheet, T } from '../../../components/ui';
import { CREATORS, creatorById } from '../../../data';

export function ReviewBids({ jobId }: { jobId: string }) {
  const { closeSheet, jobs, hireBid, startConversation, openSheet, loadCampaignBids, showToast } = useApp();
  const job = jobs.find((j: any) => j.id === jobId);
  const [hiringBidId, setHiringBidId] = useState<string | null>(null);
  const [selectedBidIds, setSelectedBidIds] = useState<string[]>([]);
  const [confirmBidId, setConfirmBidId] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);

  useEffect(() => {
    loadCampaignBids(jobId).catch((error: unknown) => showToast(error instanceof Error ? error.message : 'Unable to load proposals.'));
  }, [jobId]);

  if (!job) return null;
  const confirmBid = job.bids.find((bid: any) => bid.id === confirmBidId);
  const comparedBids = job.bids.filter((bid: any) => selectedBidIds.includes(bid.id)).slice(0, 3);

  const confirmHiring = async () => {
    if (!confirmBid) return;
    setHiringBidId(confirmBid.id);
    try {
      await hireBid(job.id, confirmBid);
      setConfirmBidId(null);
      closeSheet();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to accept proposal.');
    } finally {
      setHiringBidId(null);
    }
  };

  const toggleBid = (bidId: string) => {
    setSelectedBidIds((previous) => previous.includes(bidId)
      ? previous.filter((id) => id !== bidId)
      : previous.length < 3 ? [...previous, bidId] : previous);
    if (!selectedBidIds.includes(bidId) && selectedBidIds.length >= 3) showToast('Compare up to three bids at a time.');
  };

  return (
    <Sheet
      visible
      onClose={closeSheet}
      title={job.title}
      sub={`${job.bidsCount} bids · ${inr(job.min)}–${inr(job.max)}`}
      footer={selectedBidIds.length > 1 ? (
        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ gap: 2 }}>
            <T size={13} w="semi" color={C.text}>{selectedBidIds.length} selected</T>
            <T size={11} color={C.muted2}>Select bids to compare</T>
          </View>
          <Btn label="Compare" icon="grid-outline" onPress={() => setCompareOpen(true)} />
        </Row>
      ) : <Btn label="Done" onPress={closeSheet} />}
    >
      {compareOpen ? (
        <View style={{ gap: 13 }}>
          <View style={{ gap: 3 }}>
            <T size={24} w="semi" color={C.text}>Compare bids</T>
            <T size={12} color={C.muted2}>{job.title} · budget {inr(job.max)}</T>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <Row style={{ alignItems: 'stretch' }}>
                <View style={{ width: 86 }} />
                {comparedBids.map((bid: any) => {
                  const creator = creatorById(bid.creatorId);
                  const creatorName = bid.creatorName || creator.name;
                  return (
                    <View key={bid.id} style={{ width: 125, alignItems: 'center', gap: 6, padding: 10, borderRadius: 16, backgroundColor: C.primaryLight }}>
                      <Avatar name={creatorName} size={44} photo={bid.creatorPhotoUrl ? { uri: bid.creatorPhotoUrl } : creator.photo} />
                      <T size={12} w="semi" color={C.text} numberOfLines={1}>{creatorName}</T>
                      <T size={10} w="semi" color={C.primary}>BIDDER</T>
                    </View>
                  );
                })}
              </Row>
              {[
                ['Price', (bid: any) => inr(bid.price)],
                ['Est. views', (bid: any) => bid.expectedViews ? String(bid.expectedViews) : 'Not provided'],
                ['Followers', (bid: any) => CREATORS.find((creator) => creator.id === bid.creatorId)?.followers || 'Not provided'],
                ['Engagement', (bid: any) => CREATORS.find((creator) => creator.id === bid.creatorId)?.eng || 'Not provided'],
                ['Rating', (bid: any) => {
                  const rating = CREATORS.find((creator) => creator.id === bid.creatorId)?.rating;
                  return rating ? `★ ${rating.toFixed(1)}` : 'Not provided';
                }],
                ['Delivery', (bid: any) => bid.deliveryDays ? `${bid.deliveryDays} days` : 'Not provided'],
              ].map(([label, value]: any) => (
                <Row key={label} style={{ alignItems: 'stretch', borderTopWidth: 1, borderTopColor: C.border, paddingVertical: 11 }}>
                  <T size={11} color={C.muted2} style={{ width: 86, paddingTop: 2 }}>{label}</T>
                  {comparedBids.map((bid: any) => (
                    <T key={bid.id} size={12} w={label === 'Price' ? 'semi' : 'reg'} color={C.text} style={{ width: 125, textAlign: 'center' }}>{value(bid)}</T>
                  ))}
                </Row>
              ))}
              <Row style={{ marginTop: 10 }}>
                <View style={{ width: 86 }} />
                {comparedBids.map((bid: any) => (
                  <View key={bid.id} style={{ width: 125, paddingHorizontal: 6 }}>
                    <Btn label="Confirm" small variant="dark" onPress={() => { setCompareOpen(false); setConfirmBidId(bid.id); }} />
                  </View>
                ))}
              </Row>
            </View>
          </ScrollView>
          <Btn label="Back to bids" variant="outline" onPress={() => setCompareOpen(false)} />
        </View>
      ) : job.bids.length === 0 ? (
        <T color={C.muted}>No proposals received for this campaign brief yet.</T>
      ) : null}

      {!compareOpen ? job.bids.map((b: any) => {
        const c = creatorById(b.creatorId);
        const creatorName = b.creatorName || c.name;
        const selected = selectedBidIds.includes(b.id);
        return (
          <Card key={b.id} style={{ gap: 10, padding: 14, borderWidth: selected ? 2 : 1, borderColor: selected ? C.primary : C.border }}>
            <Row style={{ gap: 10, alignItems: 'center' }}>
              <Pressable onPress={() => toggleBid(b.id)} hitSlop={6} accessibilityRole="checkbox" accessibilityState={{ checked: selected }}>
                <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: selected ? 0 : 1.5, borderColor: C.border2, backgroundColor: selected ? C.primary : C.surface, alignItems: 'center', justifyContent: 'center' }}>
                  {selected ? <Ionicons name="checkmark" size={16} color={C.onPrimary} /> : null}
                </View>
              </Pressable>
              <Avatar name={creatorName} size={38} photo={b.creatorPhotoUrl ? { uri: b.creatorPhotoUrl } : c.photo} ring />
              <View style={{ flex: 1 }}>
                <T size={14} w="semi" color={C.text}>
                  {creatorName}
                </T>
                <T size={11} color={C.muted}>
                  {b.creatorName ? 'Creator proposal' : `${c.followers} · ${c.platform} · ★ ${c.rating.toFixed(1)}`}
                </T>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 2 }}>
                <T size={19} w="semi" color={C.text}>{inr(b.price)}</T>
                <T size={10} color={C.muted2}>{b.submittedAt ? 'New proposal' : 'Bid'}</T>
              </View>
            </Row>

            {b.proposal || b.note ? (
              <T size={13} color={C.textSecondary} style={{ lineHeight: 19 }} numberOfLines={3}>
                {b.proposal || b.note}
              </T>
            ) : null}

            <Row style={{ gap: 14 }}>
              <Row style={{ gap: 5 }}>
                <Ionicons name="eye-outline" size={15} color={C.muted2} />
                <T size={11} color={C.muted2}>{b.expectedViews ? `~${b.expectedViews} views` : 'Views not listed'}</T>
              </Row>
              <Row style={{ gap: 5 }}>
                <Ionicons name="calendar-outline" size={15} color={C.muted2} />
                <T size={11} color={C.muted2}>{b.deliveryDays ? `${b.deliveryDays} day delivery` : 'Date not listed'}</T>
              </Row>
            </Row>

            <Row style={{ gap: 8, justifyContent: 'space-between' }}>
              <Btn
                label={selected ? 'Selected' : 'Compare'}
                small
                variant={selected ? 'secondary' : 'outline'}
                icon={selected ? 'checkmark' : 'grid-outline'}
                onPress={() => toggleBid(b.id)}
              />
              <Btn
                label="Message"
                small
                variant="ghost"
                icon="chatbubble-outline"
                onPress={async () => {
                  try {
                    const conversationId = await startConversation({
                    creatorId: b.creatorId,
                    creatorName,
                    creatorPhotoUrl: b.creatorPhotoUrl,
                    jobId: job.id,
                    jobTitle: job.title,
                    });
                    if (conversationId) openSheet('messages', { conversationId });
                  } catch (error) {
                    showToast(error instanceof Error ? error.message : 'Unable to start conversation.');
                  }
                }}
              />
              <Btn label="Confirm" small variant="dark" disabled={hiringBidId === b.id} onPress={() => setConfirmBidId(b.id)} />
            </Row>
          </Card>
        );
      }) : null}

      <Modal visible={!!confirmBid} transparent animationType="fade" onRequestClose={() => setConfirmBidId(null)}>
        <View style={{ flex: 1, justifyContent: 'center', padding: 22, backgroundColor: C.overlay }}>
          <View style={{ backgroundColor: C.surface, borderRadius: 28, padding: 20, gap: 16 }}>
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Ionicons name="checkmark-circle-outline" size={30} color={C.text} />
              <T size={21} w="semi" color={C.text} style={{ textAlign: 'center' }}>
                Confirm {confirmBid?.creatorName || creatorById(confirmBid?.creatorId || '').name} for this job?
              </T>
            </View>
            {confirmBid ? (
              <Card style={{ padding: 12 }}>
                <Row style={{ gap: 10, alignItems: 'center' }}>
                  <Avatar name={confirmBid.creatorName || creatorById(confirmBid.creatorId).name} size={42} photo={confirmBid.creatorPhotoUrl ? { uri: confirmBid.creatorPhotoUrl } : creatorById(confirmBid.creatorId).photo} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <T size={14} w="semi" color={C.text}>{confirmBid.creatorName || creatorById(confirmBid.creatorId).name}</T>
                    <T size={11} color={C.muted2}>{job.deliverables} · {confirmBid.deliveryDays ? `${confirmBid.deliveryDays} days` : 'Delivery date to be agreed'}</T>
                  </View>
                  <T size={17} w="semi" color={C.text}>{inr(confirmBid.price)}</T>
                </Row>
              </Card>
            ) : null}
            <Row style={{ gap: 9, alignItems: 'flex-start' }}>
              <Ionicons name="lock-closed-outline" size={17} color={C.muted2} />
              <T size={12} color={C.textSecondary} style={{ flex: 1, lineHeight: 18 }}>Confirming selects this bid and creates the campaign order. The order’s payment and escrow status will be shown in Payments.</T>
            </Row>
            <Btn label={hiringBidId ? 'Confirming…' : 'Confirm & hire'} icon="lock-closed-outline" disabled={!!hiringBidId} onPress={confirmHiring} />
            <Pressable onPress={() => setConfirmBidId(null)} disabled={!!hiringBidId} style={{ alignItems: 'center', paddingVertical: 5 }}>
              <T size={13} w="semi" color={C.text}>Not yet</T>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Sheet>
  );
}
