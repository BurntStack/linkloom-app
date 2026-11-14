import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppearanceToggle, Avatar, Btn, Card, Heading, Row, StackHeader, T } from '../../../components/ui';
import { C } from '../../../theme';
import { useApp } from '../../../store';
import { Info } from '../shared';

export function CreatorAccount({ navigation }: any) {
  const { creatorProfile, orders } = useApp();
  const releasedOrders = orders.filter((order: any) => order.stage === 'released').length;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StackHeader
        title="My profile"
        onBack={() => navigation.goBack()}
        right={
          <Pressable
            onPress={() => navigation.navigate('CreatorSettings')}
            accessibilityRole="button"
            accessibilityLabel="Creator settings"
            hitSlop={8}
            style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="settings-outline" size={20} color={C.text} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ padding: 18, gap: 14, paddingBottom: 30 }}>
        <Card style={{ alignItems: 'center', gap: 10 }}>
          <Avatar name={creatorProfile?.name || 'Creator'} size={82} photo={creatorProfile?.photoUrl ? { uri: creatorProfile.photoUrl } : undefined} />
          <View style={{ alignItems: 'center', gap: 4 }}>
            <T size={21} w="bold" color={C.text}>{creatorProfile?.name || 'Creator profile'}</T>
            <Row style={{ alignItems: 'center', gap: 5 }}>
              <Ionicons name="location-outline" size={14} color={C.muted} />
              <T size={12} color={C.muted}>{creatorProfile?.city || 'Add your city'}</T>
            </Row>
          </View>
          {creatorProfile?.bio ? <T size={12} color={C.textSecondary} style={{ textAlign: 'center', lineHeight: 19 }}>{creatorProfile.bio}</T> : null}
          <Row style={{ width: '100%', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: C.border, paddingTop: 13, marginTop: 2 }}>
            <View style={{ alignItems: 'center', gap: 3 }}>
              <T size={16} w="bold" color={C.text}>{releasedOrders}</T>
              <T size={10} color={C.muted}>Released orders</T>
            </View>
            <View style={{ width: 1, backgroundColor: C.border }} />
            <View style={{ alignItems: 'center', gap: 3 }}>
              <T size={16} w="bold" color={C.text}>{creatorProfile?.categories?.length || 0}</T>
              <T size={10} color={C.muted}>Categories</T>
            </View>
            <View style={{ width: 1, backgroundColor: C.border }} />
            <View style={{ alignItems: 'center', gap: 3 }}>
              <T size={16} w="bold" color={C.text}>{creatorProfile?.platforms?.length || 0}</T>
              <T size={10} color={C.muted}>Platforms</T>
            </View>
          </Row>
        </Card>
        <AppearanceToggle />
        <Heading title="Creator profile" sub="This information helps brands understand your work and content." />
        <Card style={{ gap: 11 }}>
          <Info label="Categories" value={creatorProfile?.categories?.join(', ') || 'Not added'} />
          <Info label="Languages" value={creatorProfile?.languages?.join(', ') || 'Not added'} />
          <Info label="Typical reply time" value={creatorProfile?.repliesWithin ? `${creatorProfile.repliesWithin} hours` : 'Not added'} />
          {(creatorProfile?.platforms || []).map((platform) => <Info key={platform.name} label={platform.name} value={platform.handle || 'Handle not added'} />)}
        </Card>
        <Btn label="Edit profile" icon="create-outline" onPress={() => navigation.navigate('CreatorSetup', { edit: true })} />
        <Pressable
          onPress={() => navigation.navigate('CreatorSettings')}
          style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }}
        >
          <Ionicons name="settings-outline" size={17} color={C.muted} />
          <T size={12} w="semi" color={C.muted}>Profile settings</T>
        </Pressable>
      </ScrollView>
    </View>
  );
}
