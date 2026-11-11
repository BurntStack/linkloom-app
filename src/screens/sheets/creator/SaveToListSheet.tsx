import React, { useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../../theme';
import { useApp } from '../../../store';
import { Card, Row, Sheet, T } from '../../../components/ui';

export function SaveToList({ creatorId }: { creatorId: string }) {
  const { closeSheet, lists, saveCreator, showToast, creatorSearchResults } = useApp();
  const c = creatorSearchResults.find((creator: any) => creator.id === creatorId);
  const [, setSavingId] = useState<string | null>(null);

  return (
    <Sheet
      visible
      onClose={closeSheet}
      title="Add to Shortlist"
      sub={`Select a list to bookmark ${c?.name || 'this creator'}`}
    >
      <View style={{ gap: 8 }}>
        {lists.map((l: any) => (
          <Card
            key={l.id}
            onPress={async () => {
              setSavingId(l.id);
              try {
                await saveCreator(creatorId, l.id);
                closeSheet();
              } catch (error) {
                showToast(error instanceof Error ? error.message : 'Unable to save creator to shortlist.');
              } finally {
                setSavingId(null);
              }
            }}
            style={{ padding: 12 }}
          >
            <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ gap: 1 }}>
                <T size={13.5} w="bold" color={C.text}>
                  {l.name}
                </T>
                <T size={11} color={C.muted}>
                  {l.count} creators currently shortlisted
                </T>
              </View>
              <Ionicons name="add-circle-outline" size={20} color={C.primary} />
            </Row>
          </Card>
        ))}
      </View>
    </Sheet>
  );
}
