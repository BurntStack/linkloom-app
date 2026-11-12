import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, inr } from '../../../theme';
import { useApp } from '../../../store';
import { Avatar, Btn, Card, Field, Row, Sheet, T, statusPill } from '../../../components/ui';
import { creatorById } from '../../../data';
import { CreatorOrderDetails } from '../CreatorOrderDetails';

function allowsOrderAction(order: any, keywords: string[]) {
  const actions = (order?.allowedActions || []).map((action: any) =>
    String(typeof action === 'string' ? action : action.code || action.name || action.action || '').toLowerCase().replace(/[_\s-]/g, ''),
  );
  return actions.some((action: string) => keywords.some((keyword) => action.includes(keyword)));
}

export function OrderDetails({ orderId }: { orderId: string }) {
  const {
    closeSheet, accountRole, orders, deliverables, approveOrder, requestRevision, openSheet, startConversation, showToast,
    loadOrderDetails, submitDeliverable, cancelOrder, disputeOrder, reviewOrder,
  } = useApp();
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [deliveryUrl, setDeliveryUrl] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [reason, setReason] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [stars, setStars] = useState('5');
  const [uploadVisible, setUploadVisible] = useState(false);
  const o = orders.find((x: any) => x.id === orderId);

  useEffect(() => {
    loadOrderDetails(orderId).catch((error: unknown) => showToast(error instanceof Error ? error.message : 'Unable to load order details.'));
  }, [orderId]);

  if (!o) {
    return <Sheet visible onClose={closeSheet} title="Order details"><T size={12} color={C.muted}>Loading order…</T></Sheet>;
  }

  const creator = creatorById(o.creatorId);
  const c = creator;
  const orderDeliverables = deliverables.filter((item: any) => item.orderId === orderId);
  const canApprove = allowsOrderAction(o, ['approve']);
  const canRevise = allowsOrderAction(o, ['revision']);
  const canSubmit = allowsOrderAction(o, ['deliverable', 'submitcontent']);
  const canCancel = allowsOrderAction(o, ['cancel']);
  const canDispute = allowsOrderAction(o, ['dispute']);
  const canReview = allowsOrderAction(o, ['review']);

  const creatorName = o.creator?.displayName || o.creator?.display_name || o.creator?.name || creatorById(o.creatorId).name;
  const creatorPhotoUrl = o.creator?.avatarUrl || o.creator?.avatar_url || o.creatorPhotoUrl || o.creator_photo_url;

  if (accountRole === 'creator') {
    return (
      <CreatorOrderDetails
        order={o}
        creatorPhotoUrl={o.brand?.avatarUrl || o.brand?.avatar_url || o.brandPhotoUrl || o.brand_photo_url}
        orderDeliverables={orderDeliverables}
        canSubmit={canSubmit}
        canRevise={canRevise}
        canApprove={canApprove}
        canCancel={canCancel}
        canDispute={canDispute}
        canReview={canReview}
        saving={saving}
        setSaving={setSaving}
        uploadVisible={uploadVisible}
        setUploadVisible={setUploadVisible}
        deliveryUrl={deliveryUrl}
        setDeliveryUrl={setDeliveryUrl}
        deliveryNote={deliveryNote}
        setDeliveryNote={setDeliveryNote}
        feedback={feedback}
        setFeedback={setFeedback}
        reason={reason}
        setReason={setReason}
        reviewText={reviewText}
        setReviewText={setReviewText}
        stars={stars}
        setStars={setStars}
        submitDeliverable={submitDeliverable}
        requestRevision={requestRevision}
        approveOrder={approveOrder}
        cancelOrder={cancelOrder}
        disputeOrder={disputeOrder}
        reviewOrder={reviewOrder}
        closeSheet={closeSheet}
        showToast={showToast}
      />
    );
  }

  const steps = [
    { t: 'Paid into Escrow', s: `${o.paidOn} · ${inr(o.held)} securely locked`, ok: true },
    { t: 'Creator Working', s: `Draft scheduled by ${o.draftDue}`, ok: true },
    {
      t: 'Content Delivered',
      s: o.deliveredOn ? `${o.deliveredOn} · Draft 1 ready for review` : 'Waiting for creator delivery',
      ok: o.stage !== 'working',
    },
    {
      t: 'Payment Released',
      s: o.stage === 'released' ? 'Transferred to creator wallet' : 'Transferred after you approve',
      ok: o.stage === 'released',
    },
  ];

  return (
    <Sheet
      visible
      onClose={closeSheet}
      title={`Order ${o.code}`}
      sub={`${o.title} · ${o.kind}`}
    >
      <Row style={{ gap: 10, alignItems: 'center' }}>
        <Avatar name={creatorName} size={40} photo={creatorPhotoUrl ? { uri: creatorPhotoUrl } : c.photo} ring />
        <View style={{ flex: 1 }}>
          <T size={14} w="bold" color={C.text}>
            {creatorName}
          </T>
          <T size={11.5} color={C.muted}>
            {c.city} · {c.cat} · {c.followers} followers
          </T>
        </View>
        {statusPill(o.stage === 'working' ? 'In progress' : o.stage === 'delivered' ? 'Needs review' : 'Approved')}
      </Row>

      {/* Milestone Progress Tracker */}
      <View style={{ gap: 0, paddingVertical: 4 }}>
        {steps.map((s, i) => (
          <Row key={s.t} style={{ alignItems: 'flex-start', gap: 10 }}>
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: s.ok ? C.emerald : C.border2,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {s.ok ? <Ionicons name="checkmark" size={13} color={C.onPrimary} /> : null}
              </View>
              {i < steps.length - 1 ? (
                <View
                  style={{
                    width: 2,
                    height: 26,
                    backgroundColor: steps[i + 1].ok ? C.emerald : C.border,
                  }}
                />
              ) : null}
            </View>
            <View style={{ paddingBottom: 10, flex: 1 }}>
              <T size={12.5} w="semi" color={C.text}>
                {s.t}
              </T>
              <T size={11} color={C.muted}>
                {s.s}
              </T>
            </View>
          </Row>
        ))}
      </View>

      <Card style={{ gap: 10, padding: 15, backgroundColor: C.primaryLight, borderColor: C.primaryBorder }}>
        <T size={10} w="bold" track={0.8} color={C.primary}>ESCROW STATUS</T>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <T size={25} w="semi" color={C.primary}>{inr(o.held)}</T>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 99, backgroundColor: C.surface }}>
            <Ionicons name={o.stage === 'released' ? 'checkmark-circle-outline' : 'lock-closed-outline'} size={14} color={C.primary} />
            <T size={11} w="semi" color={C.primary}>{o.stage === 'released' ? 'Released' : 'Held by Linkloom'}</T>
          </View>
        </Row>
      </Card>

      {/* Escrow Fee Breakdown */}
      <Card style={{ gap: 10, padding: 14 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <T size={12} color={C.muted2}>Agreed price · {creatorName}</T>
          <T size={12} w="semi" color={C.text}>{inr(o.fee)}</T>
        </Row>
        <View style={{ height: 1, backgroundColor: C.borderSubtle }} />
        <Row style={{ justifyContent: 'space-between' }}>
          <T size={12} color={C.muted2}>Platform fee</T>
          <T size={12} w="semi" color={o.platformFee ? C.text : C.green}>
            {o.platformFee ? inr(o.platformFee) : 'None'}
          </T>
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <T size={12} color={C.muted2}>Taxes</T>
          <T size={12} w="semi" color={C.text}>{o.gst ? inr(o.gst) : 'As per confirmed rules'}</T>
        </Row>
        <View style={{ height: 1, backgroundColor: C.borderSubtle }} />
        <T size={11} color={C.muted2} style={{ lineHeight: 17 }}>
          Released to {creatorName} only after you approve the completed work.
        </T>
      </Card>

      {orderDeliverables.map((item: any) => (
        <Card key={item.id} style={{ gap: 6 }}>
          <T size={13} w="bold" color={C.text}>{item.title}</T>
          <T size={11} color={C.muted}>{item.note || item.date}</T>
          {item.contentUrl ? <T size={11} color={C.primary}>{item.contentUrl}</T> : null}
        </Card>
      ))}
      {canSubmit ? (
        <>
          <Field label="Deliverable HTTPS URL" value={deliveryUrl} onChangeText={setDeliveryUrl} placeholder="https://…" keyboardType="url" />
          <Field label="Note (optional)" value={deliveryNote} onChangeText={setDeliveryNote} multiline placeholder="Add a note about this delivery" />
          <Btn label={saving ? 'Submitting…' : 'Submit deliverable'} disabled={saving || !/^https:\/\/\S+/i.test(deliveryUrl.trim())} onPress={async () => {
            setSaving(true);
            try {
              await submitDeliverable(o.id, deliveryUrl.trim(), deliveryNote.trim());
              showToast('Deliverable submitted.');
              setDeliveryUrl('');
              setDeliveryNote('');
            } catch (error) {
              showToast(error instanceof Error ? error.message : 'Unable to submit deliverable.');
            } finally { setSaving(false); }
          }} />
        </>
      ) : null}
      {canRevise ? (
        <Field label="Revision feedback" value={feedback} onChangeText={setFeedback} multiline placeholder="Describe the changes needed" />
      ) : null}
      {canRevise || canApprove ? (
        <Row style={{ gap: 8 }}>
          {canRevise ? (
            <Btn label="Request Changes" variant="outline" flex disabled={saving || !feedback.trim()} onPress={async () => {
              setSaving(true);
              try {
                await requestRevision(o.id, feedback.trim());
                closeSheet();
              } catch (error) {
                showToast(error instanceof Error ? error.message : 'Unable to request a revision.');
              } finally {
                setSaving(false);
              }
            }} />
          ) : null}
          {canApprove ? (
            <Btn label="Approve & Release Payment" flex disabled={saving} onPress={async () => {
              setSaving(true);
              try {
                await approveOrder(o.id);
                closeSheet();
              } catch (error) {
                showToast(error instanceof Error ? error.message : 'Unable to approve the order.');
              } finally {
                setSaving(false);
              }
            }} />
          ) : null}
        </Row>
      ) : null}
      {canCancel || canDispute ? <Field label="Reason" value={reason} onChangeText={setReason} multiline placeholder="Explain the reason" /> : null}
      {canCancel ? <Btn label="Cancel order" variant="danger" disabled={saving || !reason.trim()} onPress={async () => {
        setSaving(true);
        try { await cancelOrder(o.id, reason.trim()); showToast('Order cancelled.'); closeSheet(); }
        catch (error) { showToast(error instanceof Error ? error.message : 'Unable to cancel order.'); }
        finally { setSaving(false); }
      }} /> : null}
      {canDispute ? <Btn label="Open dispute" variant="outline" disabled={saving || !reason.trim()} onPress={async () => {
        setSaving(true);
        try { await disputeOrder(o.id, reason.trim()); showToast('Dispute submitted.'); closeSheet(); }
        catch (error) { showToast(error instanceof Error ? error.message : 'Unable to submit dispute.'); }
        finally { setSaving(false); }
      }} /> : null}
      {canReview ? <>
        <Field label="Review stars (1–5)" value={stars} onChangeText={(value) => setStars(value.replace(/\D/g, '').slice(0, 1))} keyboardType="number-pad" />
        <Field label="Review" value={reviewText} onChangeText={setReviewText} multiline placeholder="Share your experience" />
        <Btn label="Submit review" disabled={saving || Number(stars) < 1 || Number(stars) > 5 || !reviewText.trim()} onPress={async () => {
          setSaving(true);
          try { await reviewOrder(o.id, Number(stars), reviewText.trim()); showToast('Review submitted.'); closeSheet(); }
          catch (error) { showToast(error instanceof Error ? error.message : 'Unable to submit review.'); }
          finally { setSaving(false); }
        }} />
      </> : null}

      {accountRole === 'brand' ? (
        <Btn
          label="Message Creator"
          variant="outline"
          icon="chatbubble-outline"
          onPress={async () => {
            try {
              const conversationId = await startConversation({
              creatorId: o.creatorId,
              creatorName,
              creatorPhotoUrl,
              jobId: String(o.campaign?.id || o.campaignId || o.campaign_id || o.id),
              jobTitle: o.title,
              });
              if (conversationId) openSheet('messages', { conversationId });
            } catch (error) {
              showToast(error instanceof Error ? error.message : 'Unable to start conversation.');
            }
          }}
        />
      ) : null}
    </Sheet>
  );
}
