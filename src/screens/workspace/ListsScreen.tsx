import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../theme';
import { useApp } from '../../store';
import { Btn, Card, Heading, Row, T } from '../../components/ui';
import { Page } from './PageLayout';

export function Lists({ navigation }: any) {
  const { lists, openSheet } = useApp();

  return (
    <Page title="Favourites" navigation={navigation}>
      <Heading
        title={`Your shortlists (${lists.length})`}
        sub="Keep saved creators organized and compare them for each campaign."
      />

      <Btn label="Create New List" icon="add" onPress={() => openSheet('newlist')} />

      <View style={{ gap: 8 }}>
        {lists.map((l: any) => (
          <Card
            key={l.id}
            onPress={() => navigation.navigate('CreatorListDetail', { listId: l.id })}
            style={{ gap: 4, padding: 13 }}
          >
            <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <T size={14} w="bold" color={C.text} style={{ flex: 1 }}>
                {l.name}
              </T>
              <Ionicons name="chevron-forward" size={16} color={C.muted3} />
            </Row>
            <Row style={{ gap: 6, alignItems: 'center' }}>
              <View
                style={{
                  backgroundColor: C.primaryLight,
                  paddingHorizontal: 6,
                  paddingVertical: 1.5,
                  borderRadius: 6,
                }}
              >
                <T size={10} w="bold" color={C.primary}>
                  {l.count} creators
                </T>
              </View>
              <T size={11} color={C.muted}>
                · {l.updated}
              </T>
            </Row>
          </Card>
        ))}
      </View>
    </Page>
  );
}
