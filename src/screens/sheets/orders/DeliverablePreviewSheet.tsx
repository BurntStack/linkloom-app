import React from 'react';
import { View, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, shadowSm } from '../../../theme';
import { useApp } from '../../../store';
import { Btn, Row, Sheet, T, statusPill } from '../../../components/ui';

export function DeliverablePreview({ id }: { id: string }) {
  const { closeSheet, deliverables, showToast } = useApp();
  const d = deliverables.find((x: any) => x.id === id);
  if (!d) return null;

  return (
    <Sheet
      visible
      onClose={closeSheet}
      title={d.title}
      sub={`${d.job} · By ${d.by} · Delivered ${d.date}`}
    >
      <View
        style={{
          height: 190,
          borderRadius: 14,
          backgroundColor: C.dark,
          alignItems: 'center',
          justifyContent: 'center',
          ...shadowSm,
        }}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: C.darkAccent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="play" size={24} color={C.onDark} />
        </View>
        <T size={11} color={C.onDarkMuted} style={{ marginTop: 8 }}>
          {d.contentUrl ? 'Open the submitted deliverable link' : 'No content URL was submitted'}
        </T>
      </View>

      <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <T size={12} color={C.muted}>
          Status: {d.status}
        </T>
        {statusPill(d.status)}
      </Row>

      <Btn
        label="Open deliverable link"
        icon="open-outline"
        disabled={!d.contentUrl}
        onPress={async () => {
          try {
            await Linking.openURL(d.contentUrl);
          } catch (error) {
            showToast(error instanceof Error ? error.message : 'Unable to open deliverable link.');
          }
        }}
      />
    </Sheet>
  );
}
