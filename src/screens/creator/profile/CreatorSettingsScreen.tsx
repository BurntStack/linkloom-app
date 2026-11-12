import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Card, StackHeader, T } from '../../../components/ui';
import { EmailVerification } from '../../../components/ui/EmailVerification';
import { C } from '../../../theme';
import { useApp } from '../../../store';

export function CreatorSettings({ navigation }: any) {
  const { creatorProfile, logout, openSheet } = useApp();

  const SettingRow = ({ icon, label, detail, onPress, danger = false }: any) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{ minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 11 }}
    >
      <View style={{
        width: 36,
        height: 36,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: danger ? C.redBg : C.primaryLight,
      }}>
        <Ionicons name={icon} size={17} color={danger ? C.red : C.primary} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <T size={12.5} w="semi" color={danger ? C.red : C.text}>{label}</T>
        {detail ? <T size={10.5} color={C.muted}>{detail}</T> : null}
      </View>
      {!danger ? <Ionicons name="chevron-forward" size={16} color={C.muted3} /> : null}
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StackHeader title="Settings" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 18, gap: 16, paddingBottom: 32 }}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15 }}>
          <Avatar name={creatorProfile?.name || 'Creator'} size={48} photo={creatorProfile?.photoUrl ? { uri: creatorProfile.photoUrl } : undefined} />
          <View style={{ flex: 1, gap: 4 }}>
            <T size={14} w="semi" color={C.text}>{creatorProfile?.name || 'Creator profile'}</T>
            <T size={11} color={C.muted} numberOfLines={1}>{creatorProfile?.email || creatorProfile?.mobile || 'Update your profile details'}</T>
          </View>
        </Card>
        <EmailVerification />
        <View style={{ gap: 7 }}>
          <T size={10.5} w="bold" color={C.muted} track={0.7}>PROFILE</T>
          <Card style={{ paddingVertical: 5, paddingHorizontal: 13 }}>
            <SettingRow
              icon="person-outline"
              label="Edit creator profile"
              detail="Bio, platforms, location and response time"
              onPress={() => navigation.navigate('CreatorSetup', { edit: true })}
            />
            <View style={{ height: 1, backgroundColor: C.border }} />
            <SettingRow
              icon="pricetag-outline"
              label="Manage packages"
              detail="Review your creator packages"
              onPress={() => navigation.navigate('CreatorPackages')}
            />
            <View style={{ height: 1, backgroundColor: C.border }} />
            <SettingRow
              icon="mail-outline"
              label="Offers"
              detail="View your campaign offers"
              onPress={() => navigation.navigate('Offers')}
            />
          </Card>
        </View>
        <View style={{ gap: 7 }}>
          <T size={10.5} w="bold" color={C.muted} track={0.7}>PREFERENCES</T>
          <Card style={{ paddingVertical: 5, paddingHorizontal: 13 }}>
            <SettingRow
              icon="notifications-outline"
              label="Notifications"
              detail="Review campaign and account updates"
              onPress={() => openSheet('notifications')}
            />
          </Card>
        </View>
        <Card style={{ paddingVertical: 5, paddingHorizontal: 13 }}>
          <SettingRow icon="log-out-outline" label="Log out" onPress={logout} danger />
        </Card>
        <T size={10} color={C.muted} style={{ textAlign: 'center' }}>Linkloom creator account</T>
      </ScrollView>
    </View>
  );
}
