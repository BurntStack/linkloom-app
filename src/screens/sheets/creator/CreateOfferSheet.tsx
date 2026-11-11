import React, { useState } from 'react';
import { useApp } from '../../../store';
import { Btn, Field, Row, Sheet } from '../../../components/ui';

export function CreateOffer({ creator }: { creator: any }) {
  const { closeSheet, sendOffer, showToast } = useApp();
  const [deliverable, setDeliverable] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [message, setMessage] = useState('');
  const [usageRights, setUsageRights] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const amount = Number(budget);
    const deadlineDate = new Date(deadline);
    if (!deliverable.trim() || !message.trim() || !usageRights.trim()) return showToast('Complete the deliverable, message, and usage rights.');
    if (!Number.isFinite(amount) || amount <= 0) return showToast('Enter a valid offer budget.');
    if (!deadline || Number.isNaN(deadlineDate.getTime())) return showToast('Enter a valid offer deadline.');
    setSaving(true);
    try {
      await sendOffer({
        creatorId: String(creator.id),
        deliverable: deliverable.trim(),
        budget: amount,
        deadline: deadlineDate.toISOString(),
        message: message.trim(),
        usageRights: usageRights.trim(),
      });
      showToast('Offer sent.');
      closeSheet();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to send offer.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      visible
      onClose={closeSheet}
      title={`Offer to ${creator.name}`}
      sub="Send a direct collaboration offer to this creator."
      footer={
        <Row style={{ gap: 8 }}>
          <Btn label="Cancel" variant="outline" onPress={closeSheet} />
          <Btn label={saving ? 'Sending…' : 'Send offer'} flex disabled={saving} onPress={submit} />
        </Row>
      }
    >
      <Field label="Deliverable" value={deliverable} onChangeText={setDeliverable} placeholder="e.g. One Instagram Reel" />
      <Field label="Budget (₹)" value={budget} onChangeText={(value) => setBudget(value.replace(/\D/g, ''))} keyboardType="number-pad" placeholder="e.g. 5000" />
      <Field label="Deadline" value={deadline} onChangeText={setDeadline} placeholder="YYYY-MM-DD" />
      <Field label="Message" value={message} onChangeText={setMessage} multiline placeholder="Describe the collaboration request" />
      <Field label="Usage rights" value={usageRights} onChangeText={setUsageRights} placeholder="e.g. Organic and paid usage for 30 days" />
    </Sheet>
  );
}
