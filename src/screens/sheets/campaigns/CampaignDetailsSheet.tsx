import React, { useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, inr } from '../../../theme';
import { useApp } from '../../../store';
import { Btn, Card, Row, Sheet, T } from '../../../components/ui';
import { formatCampaignUsageRights } from '../campaignUtils';

export function CampaignDetails({ campaignId }: { campaignId: string }) {
  const { closeSheet, openSheet, jobs, loadCampaignDetail, closeJob, showToast } = useApp();
  const campaign = jobs.find((item: any) => item.id === campaignId);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadCampaignDetail(campaignId).catch((error: unknown) => showToast(error instanceof Error ? error.message : 'Unable to load campaign.'));
  }, [campaignId]);

  if (!campaign) return <Sheet visible onClose={closeSheet} title="Campaign"><T size={12} color={C.muted}>Loading campaign…</T></Sheet>;

  const stageIndex = campaign.status === 'open' ? (campaign.bidsCount ? 1 : 0) : campaign.status === 'progress' ? 2 : 3;
  const stages = ['Posted', 'Proposals', 'Creator selected', 'Complete'];
  const statusLabel = campaign.status === 'open' ? 'Open for proposals' : campaign.status === 'progress' ? 'In progress' : 'Completed';
  const statusColor = campaign.status === 'open' ? C.green : campaign.status === 'progress' ? C.primary : C.muted2;
  const statusBg = campaign.status === 'open' ? C.greenBg : campaign.status === 'progress' ? C.primaryLight : C.surfaceSoft;

  return (
    <Sheet visible onClose={closeSheet} title="Campaign" sub={`${statusLabel} · ${campaign.platform}`}>
      <View style={{ gap: 14 }}>
        <View style={{ gap: 12 }}>
          <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7, paddingHorizontal: 11, borderRadius: 99, backgroundColor: statusBg }}>
            <Ionicons name={campaign.status === 'open' ? 'time-outline' : campaign.status === 'progress' ? 'sync-outline' : 'checkmark-circle-outline'} size={15} color={statusColor} />
            <T size={12} w="semi" color={statusColor}>{statusLabel}</T>
          </View>
          <T size={25} w="semi" track={-0.7} color={C.text} style={{ fontFamily: 'Georgia', lineHeight: 31 }}>
            {campaign.title}
          </T>
          <Row style={{ gap: 8, flexWrap: 'wrap' }}>
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={campaign.platform === 'YouTube' ? 'logo-youtube' : 'logo-instagram'} size={16} color={C.pinkText} />
            </View>
            <T size={12} color={C.textSecondary} style={{ flex: 1 }}>{campaign.platform}{campaign.deliverables ? ` · ${campaign.deliverables}` : ''}</T>
          </Row>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingTop: 4 }}>
          {stages.map((stage, index) => {
            const complete = index < stageIndex;
            const current = index === stageIndex;
            return (
              <View key={stage} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                <View style={{ width: 25, height: 25, borderRadius: 13, borderWidth: current ? 0 : 1.5, borderColor: complete ? C.dark : C.border2, backgroundColor: complete ? C.dark : current ? C.primary : C.surface, alignItems: 'center', justifyContent: 'center' }}>
                  {complete ? <Ionicons name="checkmark" size={14} color={C.onDark} /> : current ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.onPrimary }} /> : null}
                </View>
                <T size={9.5} w={current ? 'semi' : 'reg'} color={current ? C.text : C.muted2} style={{ textAlign: 'center' }}>{stage}</T>
              </View>
            );
          })}
        </View>

        <Card style={{ gap: 13, padding: 15 }}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <View style={{ gap: 3, flex: 1 }}>
              <T size={11} color={C.muted2}>Budget range</T>
              <T size={22} w="semi" color={C.text}>{inr(campaign.min)}–{inr(campaign.max)}</T>
            </View>
            {campaign.status === 'open' ? (
              <Pressable onPress={() => openSheet('postjob', { editId: campaign.id })} hitSlop={8} style={{ paddingVertical: 7, paddingHorizontal: 10, borderRadius: 99, backgroundColor: C.surfaceSoft }}>
                <T size={12} w="semi" color={C.primary}>Edit brief</T>
              </Pressable>
            ) : null}
          </Row>
          <View style={{ height: 1, backgroundColor: C.borderSubtle }} />
          <View style={{ gap: 4 }}>
            <T size={11} color={C.muted2}>What you asked for</T>
            <T size={13} w="semi" color={C.text}>{campaign.deliverables || 'Not specified'}</T>
          </View>
          {campaign.description ? (
            <>
              <View style={{ height: 1, backgroundColor: C.borderSubtle }} />
              <View style={{ gap: 4 }}>
                <T size={11} color={C.muted2}>Campaign brief</T>
                <T size={12.5} color={C.textSecondary} style={{ lineHeight: 19 }}>{campaign.description}</T>
              </View>
            </>
          ) : null}
        </Card>

        <Card style={{ gap: 7, padding: 15, backgroundColor: C.surfaceSubtle }}>
          <T size={11} color={C.muted2}>Usage rights</T>
          <T size={12} w="semi" color={C.text}>{formatCampaignUsageRights(campaign.usageRights)}</T>
        </Card>
      </View>
      {campaign.status === 'open' ? (
        <Btn label={`Review ${campaign.bidsCount} proposals`} icon="people-outline" onPress={() => openSheet('reviewbids', { jobId: campaign.id })} />
      ) : null}
      {campaign.status === 'open' ? (
        <Btn
          label={busy ? 'Closing…' : 'Close campaign'}
          variant="outline"
          disabled={busy}
          onPress={async () => {
            setBusy(true);
            try {
              await closeJob(campaign.id);
              showToast('Campaign closed.');
              closeSheet();
            } catch (error) {
              showToast(error instanceof Error ? error.message : 'Unable to close campaign.');
            } finally {
              setBusy(false);
            }
          }}
        />
      ) : null}
    </Sheet>
  );
}
