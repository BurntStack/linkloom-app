import React, { useState } from 'react';
import { useApp } from '../../../store';
import { Btn, Field, Row, Select, Sheet } from '../../../components/ui';

export function CreateOffer({ creator }: { creator: any }) {
  const { closeSheet, sendOffer, showToast } = useApp();
  const [deliverable, setDeliverable] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState('');
  const [channelsText, setChannelsText] = useState('');
  const [exclusivity, setExclusivity] = useState('');
  const [territory, setTerritory] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const amount = Number(budget);
    if (!deliverable.trim() || !message.trim() || !duration || !channelsText.trim() || !exclusivity || !territory.trim()) {
      return showToast('Complete the deliverable, message, and usage rights.');
    }
    if (!Number.isFinite(amount) || amount <= 0) return showToast('Enter a valid offer budget.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return showToast('Enter the deadline as YYYY-MM-DD.');
    const channels = channelsText.split(',').map((channel) => channel.trim()).filter(Boolean);
    if (channels.some((channel) => !['organic_social', 'paid_ads'].includes(channel))) {
      return showToast('Use supported channels: organic_social, paid_ads.');
    }
    setSaving(true);
    try {
      await sendOffer({
        creatorId: String(creator.id),
        deliverable: deliverable.trim(),
        budget: amount,
        deadline,
        message: message.trim(),
        usageRights: { duration, channels, exclusivity: exclusivity === 'Yes', territory: territory.trim() },
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
      <Select label="Usage duration" value={duration || 'Choose'} options={['perpetual', '12m', '6m', '3m']} onChange={setDuration} />
      <Field label="Channels (comma separated)" value={channelsText} onChangeText={setChannelsText} placeholder="organic_social, paid_ads" />
      <Select label="Exclusive usage?" value={exclusivity || 'Choose'} options={['No', 'Yes']} onChange={setExclusivity} />
      <Field label="Territory" value={territory} onChangeText={setTerritory} placeholder="e.g. India" />
    </Sheet>
  );
}
