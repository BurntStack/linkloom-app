import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';

import { Btn, Card, Field, Heading, Row, Select, StackHeader, T } from '../../components/ui';

import { C, inr } from '../../theme';
import { useApp } from '../../store';

export function CreatorPackages({ navigation }: any) {
  const { creatorPackages, refreshCreatorPackages, createPackage, updatePackage, removePackage, showToast } = useApp();
  const [selectedId, setSelectedId] = useState('');
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [deliverables, setDeliverables] = useState('');
  const [price, setPrice] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    refreshCreatorPackages().catch((error: unknown) => showToast(error instanceof Error ? error.message : 'Unable to load packages.'));
  }, []);

  const clearForm = () => {
    setSelectedId('');
    setTitle('');
    setPlatform('Instagram');
    setDeliverables('');
    setPrice('');
    setDeliveryDays('');
  };
  const submit = async () => {
    const amount = Number(price);
    const days = Number(deliveryDays);
    if (!title.trim() || !deliverables.trim()) return showToast('Enter a package title and deliverables.');
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(days) || days < 1) return showToast('Enter a valid price and delivery time.');
    setSaving(true);
    try {
      const input = { title: title.trim(), platform, deliverables: deliverables.trim(), price: amount, deliveryDays: days };
      if (selectedId) await updatePackage(selectedId, input);
      else await createPackage(input);
      showToast(selectedId ? 'Package updated.' : 'Package created.');
      clearForm();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to save package.');
    } finally { setSaving(false); }
  };
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StackHeader title="Creator packages" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 18, gap: 12, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        <Heading title={selectedId ? 'Edit package' : 'Create a package'} sub="Set a clear service, price, and delivery time." />
        <Field label="Package title" value={title} onChangeText={setTitle} placeholder="e.g. Instagram Reel" />
        <Select label="Platform" value={platform} options={['Instagram', 'YouTube', 'TikTok', 'Other']} onChange={setPlatform} />
        <Field label="Deliverables" value={deliverables} onChangeText={setDeliverables} multiline placeholder="What the brand will receive" />
        <Field label="Price (₹)" value={price} onChangeText={(value) => setPrice(value.replace(/\D/g, ''))} keyboardType="number-pad" placeholder="5000" />
        <Field label="Delivery days" value={deliveryDays} onChangeText={(value) => setDeliveryDays(value.replace(/\D/g, ''))} keyboardType="number-pad" placeholder="7" />
        <Btn label={saving ? 'Saving…' : selectedId ? 'Update package' : 'Create package'} disabled={saving} onPress={submit} />
        {selectedId ? <Btn label="Cancel edit" variant="ghost" onPress={clearForm} /> : null}
        <Heading title={`Your packages (${creatorPackages.length})`} />
        {creatorPackages.map((item: any) => (
          <Card key={item.id} style={{ gap: 7 }}>
            <T size={14} w="bold" color={C.text}>{item.title}</T>
            <T size={12} color={C.muted}>{item.platform} · {item.deliverables} · {item.deliveryDays} days</T>
            <T size={14} w="bold" color={C.primary}>{inr(item.price)}</T>
            <Row style={{ gap: 8 }}>
              <Btn label="Edit" variant="outline" small flex onPress={() => {
                setSelectedId(item.id);
                setTitle(item.title);
                setPlatform(item.platform);
                setDeliverables(item.deliverables);
                setPrice(String(item.price));
                setDeliveryDays(String(item.deliveryDays));
              }} />
              <Btn label="Delete" variant="danger" small flex disabled={saving} onPress={async () => {
                setSaving(true);
                try { await removePackage(item.id); showToast('Package deleted.'); }
                catch (error) { showToast(error instanceof Error ? error.message : 'Unable to delete package.'); }
                finally { setSaving(false); }
              }} />
            </Row>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}
