import React, { useEffect, useState } from 'react';
import { Share, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Btn, Card, Field, Heading, Row, T } from '../../../components/ui';
import { C, inr } from '../../../theme';
import { useApp } from '../../../store';
import { CreatorHeader, Empty, Page } from '../shared';
import { exportTransactionsReport, getCreatorWallet, requestCreatorWithdrawal } from '../../../api';

export function CreatorEarnings({ navigation }: any) {
  const { orders, showToast } = useApp();
  const [wallet, setWallet] = useState<any>(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<'upi' | 'bank_transfer'>('upi');
  const [destination, setDestination] = useState('');
  const [savingWithdrawal, setSavingWithdrawal] = useState(false);
  const refreshWallet = async () => {
    const response = await getCreatorWallet();
    setWallet(response.wallet || response);
  };
  useEffect(() => {
    refreshWallet().catch((error: unknown) => showToast(error instanceof Error ? error.message : 'Unable to load wallet.'));
  }, []);
  const releasedOrders = orders.filter((order: any) => order.stage === 'released');
  const activeOrders = orders.filter((order: any) => order.stage !== 'released');
  const earned = releasedOrders.reduce((total: number, order: any) => total + (order.fee || 0), 0);
  const escrow = activeOrders.reduce((total: number, order: any) => total + (order.held || 0), 0);
  const amountInRupees = (value: any) => {
    const amount = typeof value === 'object' && value !== null ? value.amount : value;
    return Number(amount || 0) / 100;
  };
  const availableBalance = amountInRupees(wallet?.availableBalance ?? wallet?.available_balance);
  const pendingEscrow = amountInRupees(wallet?.pendingEscrowBalance ?? wallet?.pending_escrow_balance);
  const totalEarnings = amountInRupees(wallet?.totalEarnings ?? wallet?.total_earnings);
  const withdraw = async () => {
    const amount = Number(withdrawalAmount);
    if (!Number.isFinite(amount) || amount < 500) return showToast('Minimum withdrawal is ₹500.');
    if (amount > availableBalance) return showToast('Withdrawal amount exceeds your available balance.');
    if (!destination.trim()) return showToast('Enter your payout destination.');
    setSavingWithdrawal(true);
    try {
      await requestCreatorWithdrawal({ amount, payoutMethod, destination: destination.trim() });
      setWithdrawalAmount('');
      await refreshWallet();
      showToast('Withdrawal request submitted.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to request withdrawal.');
    } finally {
      setSavingWithdrawal(false);
    }
  };
  const exportTransactions = async () => {
    try {
      const csv = await exportTransactionsReport();
      await Share.share({ title: 'transactions.csv', message: csv });
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to export transactions.');
    }
  };

  return (
    <Page navigation={navigation} showTopBar={false} header={<CreatorHeader navigation={navigation} title="Earnings" />}>
      <View style={{ gap: 5 }}>
        <T size={29} w="semi" track={-0.8} color={C.text}>Your earnings</T>
        <T size={13} color={C.muted}>Order payments and escrow at a glance.</T>
      </View>
      <Card style={{ gap: 16, padding: 18, backgroundColor: C.text }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <View style={{ flex: 1, gap: 6 }}>
            <T size={12} color={C.onDarkMuted}>Released order value</T>
            <T size={30} w="bold" track={-0.8} color={C.onDark}>{inr(earned)}</T>
          </View>
          <View style={{ width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: C.darkAccent }}>
            <Ionicons name="wallet-outline" size={21} color={C.onDark} />
          </View>
        </Row>
        <Row style={{ justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: C.darkDivider, paddingTop: 13 }}>
          <T size={11} color={C.onDarkMuted}>{releasedOrders.length} released {releasedOrders.length === 1 ? 'order' : 'orders'}</T>
          <T size={11} w="semi" color={C.onDark}>Escrowed · {inr(escrow)}</T>
        </Row>
      </Card>
      {wallet ? (
        <>
          <Card style={{ gap: 10, padding: 15 }}>
            <Heading title="Creator wallet" sub="Balances and payout requests from your wallet." />
            <Row style={{ justifyContent: 'space-between' }}>
              <T size={12} color={C.muted}>Available to withdraw</T>
              <T size={13} w="semi" color={C.text}>{inr(availableBalance)}</T>
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <T size={12} color={C.muted}>Pending escrow</T>
              <T size={13} w="semi" color={C.text}>{inr(pendingEscrow)}</T>
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <T size={12} color={C.muted}>Total earnings</T>
              <T size={13} w="semi" color={C.text}>{inr(totalEarnings)}</T>
            </Row>
          </Card>
          <Card style={{ gap: 11, padding: 15 }}>
            <T size={15} w="semi" color={C.text}>Request a payout</T>
            <Field label="Amount (minimum ₹500)" value={withdrawalAmount} onChangeText={(value) => setWithdrawalAmount(value.replace(/[^\d.]/g, ''))} placeholder="500" keyboardType="decimal-pad" />
            <Row style={{ gap: 8 }}>
              {(['upi', 'bank_transfer'] as const).map((method) => (
                <Btn
                  key={method}
                  flex
                  small
                  variant={payoutMethod === method ? 'dark' : 'outline'}
                  label={method === 'upi' ? 'UPI' : 'Bank transfer'}
                  onPress={() => setPayoutMethod(method)}
                />
              ))}
            </Row>
            <Field label={payoutMethod === 'upi' ? 'UPI ID' : 'Bank payout destination'} value={destination} onChangeText={setDestination} placeholder={payoutMethod === 'upi' ? 'name@bank' : 'Account details / beneficiary'} />
            <Btn label={savingWithdrawal ? 'Submitting…' : 'Request withdrawal'} onPress={withdraw} loading={savingWithdrawal} />
          </Card>
          <Btn label="Share transactions CSV" icon="download-outline" variant="outline" onPress={exportTransactions} />
          {(wallet.withdrawals || wallet.withdrawalHistory || wallet.withdrawal_history || []).length ? (
            <Card style={{ gap: 10, padding: 14 }}>
              <T size={14} w="semi" color={C.text}>Withdrawal history</T>
              {(wallet.withdrawals || wallet.withdrawalHistory || wallet.withdrawal_history).map((item: any, index: number) => (
                <Row key={String(item.id || index)} style={{ justifyContent: 'space-between' }}>
                  <T size={12} color={C.muted}>{item.status || item.payoutMethod || item.payout_method || 'Withdrawal'}</T>
                  <T size={12} w="semi" color={C.text}>{inr(amountInRupees(item.amount))}</T>
                </Row>
              ))}
            </Card>
          ) : null}
        </>
      ) : null}
      <Row style={{ gap: 10 }}>
        <Card style={{ flex: 1, gap: 7, padding: 14 }}>
          <T size={11} color={C.muted}>Released orders</T>
          <T size={20} w="bold" color={C.text}>{releasedOrders.length}</T>
          <T size={10} color={C.muted}>Order value: {inr(earned)}</T>
        </Card>
        <Card style={{ flex: 1, gap: 7, padding: 14 }}>
          <T size={11} color={C.muted}>In progress</T>
          <T size={20} w="bold" color={C.text}>{activeOrders.length}</T>
          <T size={10} color={C.muted}>Held in escrow: {inr(escrow)}</T>
        </Card>
      </Row>
      <Heading title="Order activity" sub="Values reflect your campaign orders, not bank withdrawals." />
      {orders.length ? [...orders].sort((a: any, b: any) => {
        const orderTime = (value: string) => {
          const parsed = Date.parse(value || '');
          return Number.isNaN(parsed) ? 0 : parsed;
        };
        return orderTime(b.deliveredOn || b.paidOn) - orderTime(a.deliveredOn || a.paidOn);
      }).map((order: any) => {
        const isReleased = order.stage === 'released';
        const value = isReleased ? order.fee || 0 : order.held || order.fee || 0;
        return (
          <Card key={order.id} style={{ gap: 10, padding: 14 }}>
            <Row style={{ alignItems: 'flex-start', gap: 10 }}>
              <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: isReleased ? C.emeraldBg : C.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={isReleased ? 'checkmark-circle-outline' : 'lock-closed-outline'} size={19} color={isReleased ? C.emerald : C.pinkText} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <T size={13} w="semi" color={C.text} numberOfLines={2}>{order.title}</T>
                <T size={11} color={C.muted}>{order.kind || 'Campaign order'} · {order.code || 'Order'}</T>
              </View>
              <T size={13} w="semi" color={C.text}>{inr(value)}</T>
            </Row>
            <Row style={{ justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: C.border, paddingTop: 9 }}>
              <T size={11} color={isReleased ? C.emerald : C.pinkText}>{isReleased ? 'Released by brand' : 'In escrow'}</T>
              <T size={10} color={C.muted}>{order.deliveredOn || order.paidOn || ''}</T>
            </Row>
          </Card>
        );
      }) : (
        <Empty
          icon="wallet-outline"
          title="No order activity yet"
          body="Accepted campaign orders and released payments will appear here."
          action="Browse campaigns"
          onPress={() => navigation.navigate('FindJobs')}
        />
      )}
      <Card style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 9, padding: 13 }}>
        <Ionicons name="information-circle-outline" size={17} color={C.muted} />
        <T size={11} color={C.muted} style={{ flex: 1, lineHeight: 16 }}>
          Released means the brand released the order funds; your wallet balance and payout history are shown separately above.
        </T>
      </Card>
    </Page>
  );
}
