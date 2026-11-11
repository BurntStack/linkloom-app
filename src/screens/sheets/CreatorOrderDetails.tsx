import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, inr } from '../../theme';
import { Avatar, Btn, Card, Field, Row, Sheet, T, statusPill } from '../../components/ui';

function OrderMilestones({ order }: { order: any }) {
  const inRevision = String(order?.status || '').toLowerCase().includes('revision');
  const labels = inRevision ? ['Funded', 'Draft', 'Revision', 'Review', 'Paid'] : ['Funded', 'Draft', 'Review', 'Paid'];
  const active = order.stage === 'released'
    ? labels.length - 1
    : inRevision
      ? 2
      : order.stage === 'delivered' ? 2 : 1;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
      {labels.map((label, index) => {
        const complete = order.stage === 'released' || index < active;
        const current = index === active;
        return (
          <React.Fragment key={label}>
            <View style={{ alignItems: 'center', gap: 5 }}>
              <View style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: complete ? 0 : current ? 5 : 2,
                borderColor: current ? C.creatorAccent : C.border2,
                backgroundColor: complete ? C.text : C.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {complete ? <Ionicons name={index === 0 ? 'lock-closed' : 'checkmark'} size={12} color={C.surface} /> : null}
              </View>
              <T size={10} w={current ? 'semi' : 'reg'} color={current ? C.text : C.muted}>{label}</T>
            </View>
            {index < labels.length - 1 ? (
              <View style={{ flex: 1, height: 2, marginTop: 10, backgroundColor: complete ? C.text : C.border2 }} />
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );
}

export function CreatorOrderDetails({
  order,
  creatorPhotoUrl,
  orderDeliverables,
  canSubmit,
  canRevise,
  canApprove,
  canCancel,
  canDispute,
  canReview,
  saving,
  setSaving,
  uploadVisible,
  setUploadVisible,
  deliveryUrl,
  setDeliveryUrl,
  deliveryNote,
  setDeliveryNote,
  feedback,
  setFeedback,
  reason,
  setReason,
  reviewText,
  setReviewText,
  stars,
  setStars,
  submitDeliverable,
  requestRevision,
  approveOrder,
  cancelOrder,
  disputeOrder,
  reviewOrder,
  closeSheet,
  showToast,
}: any) {
  const brandName = order.brand?.displayName || order.brand?.display_name || order.brand?.name ||
    order.brandName || order.brand_name || 'Campaign brand';
  const brief = order.campaign?.brief || order.brief || order.description || order.campaignDescription || '';
  const usage = order.usageRights || order.usage_rights || order.campaign?.usageRights || order.campaign?.usage_rights;
  const usageLabel = typeof usage === 'string'
    ? usage
    : usage?.duration
      ? `Repost for ${String(usage.duration).replace(/_/g, ' ')}`
      : 'As agreed in the campaign brief';
  const language = order.languages || order.language || order.campaign?.language || 'As agreed';
  const due = order.draftDue ? new Date(order.draftDue) : null;
  const dueLabel = due && !Number.isNaN(due.getTime())
    ? due.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
    : order.draftDue || 'As agreed';
  const revision = order.revisionRequest || order.revision_request || order.latestRevision || order.latest_revision;
  const revisionText = typeof revision === 'string' ? revision : revision?.message || revision?.note || revision?.feedback;

  return (
    <Sheet visible onClose={closeSheet} title={order.title} sub={`${brandName} · ${order.kind || 'Campaign'}`}>
      <Row style={{ alignItems: 'center', gap: 10 }}>
        <Avatar name={brandName} size={42} photo={creatorPhotoUrl ? { uri: creatorPhotoUrl } : undefined} />
        <View style={{ flex: 1, gap: 3 }}>
          <T size={14} w="semi" color={C.text}>{brandName}</T>
          <T size={11} color={C.muted}>{order.kind || 'Creator campaign'}</T>
        </View>
        <View style={{ borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: C.accentSoft }}>
          <T size={11} w="semi" color={C.pinkText}>Held in escrow</T>
        </View>
      </Row>

      <View style={{ gap: 7 }}>
        <T size={26} w="semi" track={-0.7} color={C.text}>{order.title}</T>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <T size={21} w="semi" color={C.text}>{inr(order.fee || 0)}</T>
          <T size={12} color={C.muted}>Order {order.code}</T>
        </Row>
      </View>

      <Card style={{ gap: 13, padding: 14 }}>
        <OrderMilestones order={order} />
        <View style={{ height: 1, backgroundColor: C.border }} />
        <Row style={{ justifyContent: 'space-between', gap: 10 }}>
          <T size={11.5} color={C.muted}>Released to you when the brand approves</T>
          <T size={11.5} color={C.muted}>Due {dueLabel}</T>
        </Row>
      </Card>

      {revisionText ? (
        <Card style={{ gap: 9, borderWidth: 1.5, borderColor: C.creatorAccent }}>
          <Row style={{ gap: 9, alignItems: 'center' }}>
            <Avatar name={brandName} size={34} photo={creatorPhotoUrl ? { uri: creatorPhotoUrl } : undefined} />
            <View style={{ flex: 1 }}>
              <T size={13} w="semi" color={C.text}>{brandName} asked for a change</T>
              <T size={11} color={C.muted}>{revision?.createdAt || revision?.created_at || ''}</T>
            </View>
          </Row>
          <View style={{ padding: 12, borderRadius: 16, backgroundColor: C.primaryLight }}>
            <T size={13} color={C.text} style={{ lineHeight: 20 }}>{revisionText}</T>
          </View>
          <Row style={{ gap: 7 }}>
            <Ionicons name="checkmark-circle-outline" size={17} color={C.green} />
            <T size={11.5} color={C.muted}>Your submitted work remains in the order history.</T>
          </Row>
        </Card>
      ) : null}

      <View style={{ gap: 9 }}>
        <T size={11} w="bold" track={1} color={C.muted}>THE BRIEF</T>
        <T size={14} color={C.text} style={{ lineHeight: 21 }}>{brief || order.kind || 'Campaign details are available in your order.'}</T>
      </View>

      <View style={{ gap: 9 }}>
        <T size={11} w="bold" track={1} color={C.muted}>DELIVERABLES AND TERMS</T>
        <View style={{ paddingHorizontal: 13, borderRadius: 18, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface }}>
          <Row style={{ justifyContent: 'space-between', gap: 10, paddingVertical: 12 }}>
            <T size={12} color={C.muted}>Deliverables</T>
            <T size={12} w="semi" color={C.text} style={{ flex: 1, textAlign: 'right' }}>{order.kind || order.deliverables || 'As agreed'}</T>
          </Row>
          <View style={{ height: 1, backgroundColor: C.border }} />
          <Row style={{ justifyContent: 'space-between', gap: 10, paddingVertical: 12 }}>
            <T size={12} color={C.muted}>Languages</T>
            <T size={12} w="semi" color={C.text} style={{ flex: 1, textAlign: 'right' }}>{Array.isArray(language) ? language.join(', ') : language}</T>
          </Row>
          <View style={{ height: 1, backgroundColor: C.border }} />
          <Row style={{ justifyContent: 'space-between', gap: 10, paddingVertical: 12 }}>
            <T size={12} color={C.muted}>Usage</T>
            <T size={12} w="semi" color={C.text} style={{ flex: 1, textAlign: 'right' }}>{usageLabel}</T>
          </Row>
        </View>
      </View>

      <View style={{ gap: 9 }}>
        <T size={11} w="bold" track={1} color={C.muted}>PAYOUT IF APPROVED</T>
        <View style={{ padding: 15, borderRadius: 20, backgroundColor: C.dark, gap: 13 }}>
          <View style={{ alignSelf: 'flex-start', borderRadius: 18, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: C.darkSurface }}>
            <T size={11} w="semi" color={C.onDark}>Held in escrow since {order.paidOn || 'order start'}</T>
          </View>
          <Row style={{ justifyContent: 'space-between' }}>
            <T size={12} color={C.darkMuted}>Agreed price</T>
            <T size={12} color={C.onDark}>{inr(order.fee || 0)}</T>
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <T size={12} color={C.darkMuted}>Platform fee</T>
            <T size={12} color={C.onDark}>None · Creator plan</T>
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <T size={12} color={C.darkMuted}>Tax / withholding</T>
            <T size={12} color={C.onDark}>As per confirmed rules</T>
          </Row>
          <View style={{ height: 1, backgroundColor: C.darkDivider }} />
          <Row style={{ justifyContent: 'space-between' }}>
            <T size={12} color={C.darkMuted}>You receive</T>
            <T size={21} w="semi" color={C.cta}>{inr(order.fee || 0)}</T>
          </Row>
        </View>
      </View>

      {orderDeliverables.length ? (
        <View style={{ gap: 9 }}>
          <T size={11} w="bold" track={1} color={C.muted}>YOUR UPLOADS</T>
          {orderDeliverables.map((item: any) => (
            <Card key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
              <View style={{ width: 48, height: 54, borderRadius: 11, backgroundColor: C.dark, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="play-outline" size={22} color={C.onDark} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <T size={12.5} w="semi" color={C.text} numberOfLines={1}>{item.title}</T>
                <T size={11} color={C.muted}>{item.note || item.date}</T>
              </View>
              {statusPill(item.status)}
            </Card>
          ))}
        </View>
      ) : null}

      {canSubmit ? (
        <View style={{ gap: 10 }}>
          <T size={12} color={C.muted}>Upload a new version using a secure HTTPS link. Earlier versions stay in the order history.</T>
          <Btn label="Upload new cut" icon="cloud-upload-outline" onPress={() => setUploadVisible(true)} style={{ minHeight: 50, borderRadius: 26 }} />
        </View>
      ) : null}

      {canRevise ? (
        <Field label="Revision feedback" value={feedback} onChangeText={setFeedback} multiline placeholder="Describe the changes needed" />
      ) : null}
      {canRevise || canApprove ? (
        <Row style={{ gap: 8 }}>
          {canRevise ? (
            <Btn label="Request Changes" variant="outline" flex disabled={saving || !feedback.trim()} onPress={async () => {
              setSaving(true);
              try { await requestRevision(order.id, feedback.trim()); closeSheet(); }
              catch (error) { showToast(error instanceof Error ? error.message : 'Unable to request a revision.'); }
              finally { setSaving(false); }
            }} />
          ) : null}
          {canApprove ? (
            <Btn label="Approve & Release Payment" flex disabled={saving} onPress={async () => {
              setSaving(true);
              try { await approveOrder(order.id); closeSheet(); }
              catch (error) { showToast(error instanceof Error ? error.message : 'Unable to approve the order.'); }
              finally { setSaving(false); }
            }} />
          ) : null}
        </Row>
      ) : null}
      {canCancel || canDispute ? <Field label="Reason" value={reason} onChangeText={setReason} multiline placeholder="Explain the reason" /> : null}
      {canCancel ? <Btn label="Cancel order" variant="danger" disabled={saving || !reason.trim()} onPress={async () => {
        setSaving(true);
        try { await cancelOrder(order.id, reason.trim()); showToast('Order cancelled.'); closeSheet(); }
        catch (error) { showToast(error instanceof Error ? error.message : 'Unable to cancel order.'); }
        finally { setSaving(false); }
      }} /> : null}
      {canDispute ? <Btn label="Open dispute" variant="outline" disabled={saving || !reason.trim()} onPress={async () => {
        setSaving(true);
        try { await disputeOrder(order.id, reason.trim()); showToast('Dispute submitted.'); closeSheet(); }
        catch (error) { showToast(error instanceof Error ? error.message : 'Unable to submit dispute.'); }
        finally { setSaving(false); }
      }} /> : null}
      {canReview ? <>
        <Field label="Review stars (1–5)" value={stars} onChangeText={(value) => setStars(value.replace(/\D/g, '').slice(0, 1))} keyboardType="number-pad" />
        <Field label="Review" value={reviewText} onChangeText={setReviewText} multiline placeholder="Share your experience" />
        <Btn label="Submit review" disabled={saving || Number(stars) < 1 || Number(stars) > 5 || !reviewText.trim()} onPress={async () => {
          setSaving(true);
          try { await reviewOrder(order.id, Number(stars), reviewText.trim()); showToast('Review submitted.'); closeSheet(); }
          catch (error) { showToast(error instanceof Error ? error.message : 'Unable to submit review.'); }
          finally { setSaving(false); }
        }} />
      </> : null}

      {canSubmit ? (
        <Sheet
          visible={uploadVisible}
          onClose={() => setUploadVisible(false)}
          title="Upload new cut"
          sub={`Share a secure link for ${order.title}.`}
          footer={<Btn
            label={saving ? 'Submitting…' : 'Send new version'}
            disabled={saving || !/^https:\/\/\S+/i.test(deliveryUrl.trim())}
            onPress={async () => {
              setSaving(true);
              try {
                await submitDeliverable(order.id, deliveryUrl.trim(), deliveryNote.trim());
                showToast('Deliverable submitted.');
                setDeliveryUrl('');
                setDeliveryNote('');
                setUploadVisible(false);
              } catch (error) {
                showToast(error instanceof Error ? error.message : 'Unable to submit deliverable.');
              } finally {
                setSaving(false);
              }
            }}
          />}
        >
          <Card style={{ gap: 6 }}>
            <Row style={{ alignItems: 'center', gap: 8 }}>
              <Ionicons name="cloud-upload-outline" size={20} color={C.primary} />
              <T size={12} w="semi" color={C.text}>Secure file link</T>
            </Row>
            <Field label="HTTPS link" value={deliveryUrl} onChangeText={setDeliveryUrl} placeholder="https://…" keyboardType="url" />
            <T size={11} color={C.muted}>Upload your file to a shareable service first, then paste its HTTPS link here.</T>
          </Card>
          <Field label="Note for the brand (optional)" value={deliveryNote} onChangeText={setDeliveryNote} multiline placeholder="What changed in this version?" />
          <Row style={{ gap: 8 }}>
            <Ionicons name="information-circle-outline" size={17} color={C.muted} />
            <T size={11} color={C.muted} style={{ flex: 1, lineHeight: 17 }}>Previous versions remain in the order history for review.</T>
          </Row>
        </Sheet>
      ) : null}
    </Sheet>
  );
}
