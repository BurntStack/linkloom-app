import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { C } from '../../theme';
import { useApp } from '../../store';
import { Btn, Card, Row, T } from '../../components/ui';
import { EmailVerification } from '../../components/ui/EmailVerification';

import { Screen } from './shared';

export function AccountSettings({ navigation }: any) {
  const { brandName, brandProfile, sessionUser, orders, conversations, openSheet, showToast, logout, logoutAll } = useApp();
  const deliverablesToReview = orders.filter((order: any) => order.stage === 'delivered').length;
  const initials = brandName?.trim()?.[0]?.toUpperCase() || 'B';
  const location = [brandProfile?.city, brandProfile?.regionState, brandProfile?.country]
    .filter(Boolean)
    .join(', ');
  const profileRows: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }[] = [
    { icon: 'globe-outline', label: 'Website', value: brandProfile?.brandWebsite || 'Add a website in your brand details' },
    { icon: 'pricetag-outline', label: 'Industry', value: brandProfile?.businessCategory || 'Business category not set' },
    { icon: 'location-outline', label: 'Based in', value: location || 'Location not set' },
  ];
  const contactRows: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }[] = [
    { icon: 'person-outline', label: 'Name', value: [brandProfile?.firstName, brandProfile?.lastName].filter(Boolean).join(' ') || 'Contact name not set' },
    { icon: 'mail-outline', label: 'Email', value: sessionUser?.email || 'Email not provided' },
    { icon: 'call-outline', label: 'Mobile', value: brandProfile?.mobile || 'Mobile number not provided' },
  ];

  const Item = ({ icon, label, note, onPress, danger }: any) => (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: C.ripple, borderless: false }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 4,
        gap: 12,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: danger ? C.redBg : C.primaryLight,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={16} color={danger ? C.red : C.primary} />
      </View>
      <T size={13} w="semi" color={danger ? C.red : C.text} style={{ flex: 1 }}>
        {label}
      </T>
      {note ? (
        <T size={11.5} color={C.muted}>
          {note}
        </T>
      ) : null}
      {!danger ? <Ionicons name="chevron-forward" size={15} color={C.muted3} /> : null}
    </Pressable>
  );

  const Group = ({ title, children }: any) => (
    <View style={{ gap: 5 }}>
      <T size={10.5} w="bold" color={C.muted} track={0.8}>
        {title}
      </T>
      <Card style={{ paddingVertical: 2, paddingHorizontal: 12 }}>{children}</Card>
    </View>
  );

  return (
    <Screen navigation={navigation} account>
      <View style={{ alignItems: 'center', gap: 8, paddingTop: 4, paddingBottom: 8 }}>
        <View style={{ width: 76, height: 76, borderRadius: 24, overflow: 'hidden' }}>
          <LinearGradient
            colors={[C.primaryHover, C.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <T size={35} w="semi" color={C.onPrimary} style={{ fontFamily: 'Georgia' }}>{initials}</T>
          </LinearGradient>
        </View>
        <T size={26} w="semi" track={-0.7} color={C.text} style={{ fontFamily: 'Georgia', textAlign: 'center' }}>
          {brandName || 'Brand profile'}
        </T>
        {brandProfile?.businessCategory ? <T size={13} color={C.muted2}>{brandProfile.businessCategory}</T> : null}
        <Row style={{ gap: 7, flexWrap: 'wrap', justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 99, backgroundColor: C.greenBg }}>
            <Ionicons name="checkmark-circle-outline" size={14} color={C.green} />
            <T size={11} w="semi" color={C.green}>Brand account</T>
          </View>
          <Pressable
            onPress={() => showToast('Upgrade request received — our team will contact you!')}
            style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 99, borderWidth: 1, borderColor: C.border2 }}
          >
            <T size={11} w="semi" color={C.textSecondary}>Free Starter Plan</T>
          </Pressable>
        </Row>
      </View>

      <View style={{ gap: 4 }}>
        <T size={11} w="bold" color={C.muted2} track={0.8} style={{ paddingHorizontal: 2 }}>BRAND PROFILE</T>
        <Card style={{ paddingVertical: 0, paddingHorizontal: 14 }}>
          {profileRows.map((item, index) => (
            <View key={item.label}>
              {index ? <View style={{ height: 1, backgroundColor: C.borderSubtle }} /> : null}
              <Row style={{ gap: 13, paddingVertical: 13 }}>
                <Ionicons name={item.icon} size={20} color={C.muted2} />
                <View style={{ flex: 1, gap: 3 }}>
                  <T size={11} color={C.muted2}>{item.label}</T>
                  <T size={13} w="med" color={C.text}>{item.value}</T>
                </View>
              </Row>
            </View>
          ))}
        </Card>
      </View>

      <View style={{ gap: 4 }}>
        <T size={11} w="bold" color={C.muted2} track={0.8} style={{ paddingHorizontal: 2 }}>CONTACT PERSON</T>
        <Card style={{ paddingVertical: 0, paddingHorizontal: 14 }}>
          {contactRows.map((item, index) => (
            <View key={item.label}>
              {index ? <View style={{ height: 1, backgroundColor: C.borderSubtle }} /> : null}
              <Row style={{ gap: 13, paddingVertical: 13 }}>
                <Ionicons name={item.icon} size={20} color={C.muted2} />
                <View style={{ flex: 1, gap: 3 }}>
                  <T size={11} color={C.muted2}>{item.label}</T>
                  <T size={13} w="med" color={C.text}>{item.value}</T>
                </View>
              </Row>
            </View>
          ))}
        </Card>
      </View>
      <EmailVerification />

      <View style={{ gap: 4 }}>
        <T size={11} w="bold" color={C.muted2} track={0.8} style={{ paddingHorizontal: 2 }}>BILLING</T>
        <Card style={{ paddingVertical: 0, paddingHorizontal: 14 }}>
          <Row style={{ gap: 13, paddingVertical: 13 }}>
            <Ionicons name="receipt-outline" size={20} color={C.muted2} />
            <View style={{ flex: 1, gap: 3 }}>
              <T size={11} color={C.muted2}>{brandProfile?.legalName || brandName || 'Legal business name not set'}</T>
              <T size={13} w="med" color={C.text}>GSTIN {brandProfile?.gstin || 'Not provided'}</T>
            </View>
          </Row>
        </Card>
      </View>

      <Btn label="Post a Campaign Brief" icon="add" onPress={() => openSheet('postjob')} />

      <Group title="CAMPAIGN WORKSPACE">
        <Item
          icon="bookmark-outline"
          label="Shortlists"
          note="Lists"
          onPress={() => navigation.navigate('Lists')}
        />
        <Item
          icon="cart-outline"
          label="Package Cart"
          onPress={() => navigation.navigate('Cart')}
        />
        <Item
          icon="mail-outline"
          label="Collaboration Offers"
          onPress={() => navigation.navigate('Offers')}
        />
        <Item
          icon="film-outline"
          label="Deliverables Library"
          note={`${deliverablesToReview} to review`}
          onPress={() => navigation.navigate('Deliverables')}
        />
        <Item
          icon="stats-chart-outline"
          label="Analytics & Spend"
          onPress={() => navigation.navigate('Reporting')}
        />
        <Item
          icon="chatbubbles-outline"
          label="Direct Messages"
          note={`${conversations.length} conversations`}
          onPress={() => openSheet('messages')}
        />
      </Group>

      <Group title="ACCOUNT & SUPPORT">
        <Item
          icon="settings-outline"
          label="Preferences & Settings"
          onPress={() => showToast('Preferences demo module')}
        />
        <Item
          icon="help-circle-outline"
          label="Help & WhatsApp Support"
          onPress={() => showToast('Our support team will message you on WhatsApp within 15 min')}
        />
        <Item icon="log-out-outline" label="Log Out" danger onPress={logout} />
        <Item icon="phone-portrait-outline" label="Log Out All Devices" danger onPress={async () => {
          try { await logoutAll(); }
          catch (error) { showToast(error instanceof Error ? error.message : 'Unable to log out all sessions.'); }
        }} />
      </Group>
    </Screen>
  );
}
