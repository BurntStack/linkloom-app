import React, { useEffect, useState } from 'react';
import { C, inr } from '../../theme';
import { useApp } from '../../store';
import { Btn, Card, Heading, Row, T } from '../../components/ui';
import { Page } from './PageLayout';

export function Offers({ navigation }: any) {
  const { accountRole, offers, refreshOffers, respondOffer, withdrawCreatorOffer, showToast } = useApp();
  const [busyId, setBusyId] = useState('');

  useEffect(() => {
    refreshOffers(accountRole).catch((error: unknown) => showToast(error instanceof Error ? error.message : 'Unable to load offers.'));
  }, [accountRole]);

  return (
    <Page title="Offers" navigation={navigation}>
      <Heading title={accountRole === 'creator' ? 'Offers to you' : 'Sent offers'} sub="Track direct collaboration offers." />
      {offers.map((offer: any) => (
        <Card key={offer.id} style={{ gap: 7 }}>
          <Row style={{ justifyContent: 'space-between', gap: 8 }}>
            <T size={14} w="bold" color={C.text}>{offer.deliverable}</T>
            <T size={11} w="semi" color={C.primary}>{offer.status}</T>
          </Row>
          <T size={12} color={C.muted}>{accountRole === 'brand' ? offer.creatorName : offer.message}</T>
          <T size={12} color={C.muted}>{inr(offer.budget)} · {offer.deadline}</T>
          {accountRole === 'creator' && String(offer.status).toLowerCase() === 'pending' ? (
            <Row style={{ gap: 8 }}>
              {(['accepted', 'rejected'] as const).map((status) => (
                <Btn
                  key={status}
                  label={status === 'accepted' ? 'Accept' : 'Reject'}
                  flex
                  variant={status === 'rejected' ? 'outline' : 'primary'}
                  disabled={busyId === offer.id}
                  onPress={async () => {
                    setBusyId(offer.id);
                    try {
                      await respondOffer(offer.id, status);
                      showToast(`Offer ${status}.`);
                    } catch (error) {
                      showToast(error instanceof Error ? error.message : 'Unable to respond to offer.');
                    } finally {
                      setBusyId('');
                    }
                  }}
                />
              ))}
            </Row>
          ) : null}
          {accountRole === 'brand' && String(offer.status).toLowerCase() === 'pending' ? (
            <Btn
              label="Withdraw offer"
              variant="outline"
              small
              disabled={busyId === offer.id}
              onPress={async () => {
                setBusyId(offer.id);
                try {
                  await withdrawCreatorOffer(offer.id);
                  showToast('Offer withdrawn.');
                } catch (error) {
                  showToast(error instanceof Error ? error.message : 'Unable to withdraw offer.');
                } finally {
                  setBusyId('');
                }
              }}
            />
          ) : null}
        </Card>
      ))}
      {!offers.length ? <Card><T size={12} color={C.muted}>No offers yet.</T></Card> : null}
    </Page>
  );
}
