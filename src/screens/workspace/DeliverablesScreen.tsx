import React, { useEffect, useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, F, shadowSm } from '../../theme';
import { useApp } from '../../store';
import { Card, Heading, Row, T, statusPill } from '../../components/ui';
import { Page } from './PageLayout';

export function Deliverables({ navigation }: any) {
  const { deliverables, openSheet, refreshOrders, loadOrderDetails, showToast } = useApp();
  const [q, setQ] = useState('');
  useEffect(() => {
    let active = true;
    refreshOrders('brand').then(async (items: any[]) => {
      await Promise.all(items.map((order) => loadOrderDetails(order.id)));
    }).catch((error: unknown) => {
      if (active) showToast(error instanceof Error ? error.message : 'Unable to load deliverables.');
    });
    return () => { active = false; };
  }, []);

  const list = deliverables.filter((d: any) =>
    (d.title + d.by + d.job).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <Page title="Deliverables Library" navigation={navigation}>
      <Heading
        title="Campaign Deliverables"
        sub="Inspect, download, and approve delivered creator assets"
      />

      {/* Search Input */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: C.surface,
          borderRadius: 13,
          borderWidth: 1,
          borderColor: C.border,
          paddingHorizontal: 12,
          gap: 8,
          ...shadowSm,
        }}
      >
        <Ionicons name="search" size={16} color={C.muted} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search delivered videos, creators or jobs…"
          placeholderTextColor={C.muted3}
          underlineColorAndroid="transparent"
          maxFontSizeMultiplier={1.16}
          style={{
            flex: 1,
            paddingVertical: 9.5,
            fontFamily: F.reg,
            fontSize: 13,
            color: C.text,
            backgroundColor: 'transparent',
          }}
        />
        {q ? (
          <Pressable onPress={() => setQ('')} hitSlop={6}>
            <Ionicons name="close-circle" size={15} color={C.muted3} />
          </Pressable>
        ) : null}
      </View>

      <View style={{ gap: 9 }}>
        {list.map((d: any) => (
          <Card
            key={d.id}
            onPress={() => openSheet('deliverable', { id: d.id })}
            style={{ gap: 8, padding: 13 }}
          >
            <Row style={{ gap: 11, alignItems: 'center' }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: C.dark,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...shadowSm,
                }}
              >
                <Ionicons name="play" size={18} color={C.onDark} />
              </View>

              <View style={{ flex: 1, gap: 2 }}>
                <T size={13.5} w="bold" color={C.text}>
                  {d.title}
                </T>
                <T size={11.5} color={C.muted}>
                  By {d.by} · {d.date}
                </T>
                <T size={11} color={C.muted2} numberOfLines={1}>
                  {d.job}
                </T>
              </View>
            </Row>

            <Row style={{ justifyContent: 'space-between', alignItems: 'center', paddingTop: 2 }}>
              {statusPill(d.status)}
              <Row style={{ gap: 3, alignItems: 'center' }}>
                <T size={11} w="semi" color={C.primary}>
                  Preview & Review
                </T>
                <Ionicons name="chevron-forward" size={12} color={C.primary} />
              </Row>
            </Row>
          </Card>
        ))}
      </View>
    </Page>
  );
}
