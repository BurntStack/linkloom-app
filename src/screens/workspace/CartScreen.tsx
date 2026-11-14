import React, { useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, inr } from '../../theme';
import { useApp } from '../../store';
import { Avatar, Btn, Card, Heading, Row, T } from '../../components/ui';
import { Page } from './PageLayout';

export function Cart({ navigation }: any) {
  const { cart, refreshCart, removeCartEntry, checkout, showToast } = useApp();
  const [busy, setBusy] = useState(false);
  const total = cart.reduce((sum: number, item: any) => sum + Number(item.price || 0), 0);

  useEffect(() => {
    refreshCart().catch((error: unknown) => showToast(error instanceof Error ? error.message : 'Unable to load cart.'));
  }, []);

  const completeCheckout = async () => {
    if (!cart.length) return showToast('Your cart is empty.');
    setBusy(true);
    try {
      await checkout();
      showToast('Checkout session created.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to complete checkout.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page title="Hiring cart" navigation={navigation}>
      <Heading title={`${cart.length} ${cart.length === 1 ? 'package' : 'packages'}`} sub="Review your selected creator packages before checkout." />
      {cart.map((item: any) => (
        <Card key={String(item.id)} style={{ gap: 12, padding: 15 }}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <Row style={{ flex: 1, gap: 10, alignItems: 'center' }}>
              <Avatar name={item.creatorName || 'Creator'} size={42} />
              <View style={{ flex: 1, gap: 3 }}>
                <T size={14} w="semi" color={C.text} numberOfLines={1}>{item.creatorName || 'Creator'}</T>
                <T size={12} color={C.muted2} numberOfLines={1}>{item.package?.title || item.title || 'Creator package'}</T>
              </View>
            </Row>
            <Pressable
              onPress={async () => {
                try {
                  await removeCartEntry(String(item.id));
                } catch (error) {
                  showToast(error instanceof Error ? error.message : 'Unable to remove cart item.');
                }
              }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${item.creatorName || 'creator'} package from cart`}
            >
              <Ionicons name="close" size={20} color={C.muted2} />
            </Pressable>
          </Row>
          {item.brief ? <T size={12} color={C.muted2} style={{ lineHeight: 18 }}>{item.brief}</T> : null}
          <View style={{ height: 1, backgroundColor: C.borderSubtle }} />
          <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <T size={12} color={C.muted2}>Package price</T>
            <T size={18} w="semi" color={C.text}>{inr(item.price || 0)}</T>
          </Row>
        </Card>
      ))}
      {!cart.length ? <Card><T size={12} color={C.muted}>Your cart is empty. Open a creator profile to add one of their packages.</T></Card> : null}
      {cart.length ? (
        <>
          <Card style={{ gap: 12, padding: 15 }}>
            <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <T size={13} color={C.muted2}>Subtotal · {cart.length} {cart.length === 1 ? 'package' : 'packages'}</T>
              <T size={20} w="semi" color={C.text}>{inr(total)}</T>
            </Row>
            <View style={{ height: 1, backgroundColor: C.borderSubtle }} />
            <T size={12} color={C.muted2} style={{ lineHeight: 18 }}>Payment is held securely and released only after you approve the completed work.</T>
          </Card>
          <Btn label={busy ? 'Creating checkout…' : 'Continue to checkout'} icon="lock-closed-outline" disabled={busy} onPress={completeCheckout} />
          <T size={11} color={C.muted} style={{ textAlign: 'center' }}>You won’t be charged until checkout is complete.</T>
        </>
      ) : null}
    </Page>
  );
}
