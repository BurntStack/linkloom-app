import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Btn, Card, Row, T } from '../../../components/ui';
import { C, inr } from '../../../theme';

export function CreatorBidSent({ navigation, route }: any) {
  const { jobTitle, price } = route.params || {};

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, padding: 22, justifyContent: 'space-between' }}>
      <Btn label="Close" icon="close" variant="ghost" onPress={() => navigation.navigate('CreatorMain', { screen: 'MyBids' })} style={{ alignSelf: 'flex-start' }} />
      <View style={{ alignItems: 'center', gap: 18, paddingVertical: 28 }}>
        <View style={{ width: 172, height: 172, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', width: 128, height: 128, borderRadius: 64, borderWidth: 8, borderColor: C.creatorAccent, left: 3 }} />
          <View style={{ position: 'absolute', width: 128, height: 128, borderRadius: 64, borderWidth: 8, borderColor: C.brandAccent, right: 3 }} />
          <View style={{ width: 66, height: 66, borderRadius: 33, backgroundColor: C.cta, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="checkmark" size={34} color={C.text} />
          </View>
        </View>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <T size={12} w="bold" track={1} color={C.muted}>BID SENT · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</T>
          <T size={32} w="semi" track={-0.8} color={C.text} style={{ textAlign: 'center', lineHeight: 39 }}>
            Your bid is with the brand
          </T>
          <T size={14} color={C.muted} style={{ textAlign: 'center', lineHeight: 22 }}>
            {inr(Number(price) || 0)} for {jobTitle || 'this campaign'}. We’ll let you know when the brand responds.
          </T>
        </View>
      </View>

      <Card style={{ gap: 15, padding: 16 }}>
        <T size={14} w="semi" color={C.text}>What happens next</T>
        <ProgressStep complete title="Bid sent" note="You can withdraw it until the brand decides." />
        <ProgressStep current title="Brand reviews bids" note="The brand will review your proposal." />
        <ProgressStep title="They accept and fund escrow" note="Then you can start work." />
      </Card>

      <Row style={{ gap: 9 }}>
        <Btn label="My bids" variant="outline" flex onPress={() => navigation.navigate('CreatorMain', { screen: 'MyBids' })} style={{ borderRadius: 28, minHeight: 52 }} />
        <Btn label="Find more jobs" flex onPress={() => navigation.navigate('CreatorMain', { screen: 'FindJobs' })} style={{ borderRadius: 28, minHeight: 52 }} />
      </Row>
    </View>
  );
}

function ProgressStep({ complete, current, title, note }: { complete?: boolean; current?: boolean; title: string; note: string }) {
  const color = complete ? C.text : current ? C.pinkText : C.border2;
  return (
    <Row style={{ alignItems: 'flex-start', gap: 12 }}>
      <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: current ? 5 : 1.5, borderColor: color, backgroundColor: complete ? C.text : C.surface, alignItems: 'center', justifyContent: 'center' }}>
        {complete ? <Ionicons name="checkmark" size={13} color={C.surface} /> : null}
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <T size={13} w="semi" color={C.text}>{title}</T>
        <T size={12} color={C.muted}>{note}</T>
      </View>
    </Row>
  );
}
