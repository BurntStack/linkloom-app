import React, { useState } from 'react';
import { useApp } from '../../../store';
import { Btn, Field, Row, Sheet } from '../../../components/ui';

export function AddToCart({ packageId, title }: { packageId: string; title: string }) {
  const { closeSheet, addPackageToCart, showToast } = useApp();
  const [brief, setBrief] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!packageId || !brief.trim()) return showToast('Enter a brief for this package.');
    setSaving(true);
    try {
      await addPackageToCart(packageId, brief.trim());
      showToast('Package added to cart.');
      closeSheet();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to add package to cart.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      visible
      onClose={closeSheet}
      title="Add package to cart"
      sub={title || 'Creator package'}
      footer={
        <Row style={{ gap: 8 }}>
          <Btn label="Cancel" variant="outline" onPress={closeSheet} />
          <Btn label={saving ? 'Adding…' : 'Add to cart'} flex disabled={saving} onPress={submit} />
        </Row>
      }
    >
      <Field label="Campaign brief" value={brief} onChangeText={setBrief} multiline placeholder="Tell the creator what you need" />
    </Sheet>
  );
}
