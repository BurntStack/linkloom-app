import React, { useState } from 'react';
import { useApp } from '../../../store';
import { Btn, Field, Row, Sheet } from '../../../components/ui';

export function NewList() {
  const { closeSheet, addList, showToast } = useApp();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim()) return showToast('Give your shortlist a name');
    setSaving(true);
    try {
      await addList(name.trim());
      closeSheet();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to create shortlist.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      visible
      onClose={closeSheet}
      title="Create Creator Shortlist"
      sub="Bookmark creators into curated groups for campaign planning"
      footer={
        <Row style={{ gap: 8 }}>
          <Btn label="Cancel" variant="outline" onPress={closeSheet} />
          <Btn
            label={saving ? 'Creating…' : 'Create Shortlist'}
            flex
            disabled={saving}
            onPress={submit}
          />
        </Row>
      }
    >
      <Field
        label="Shortlist Name"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Skincare Micro-Influencers Q4"
      />
    </Sheet>
  );
}
