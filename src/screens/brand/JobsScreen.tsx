import React, { useEffect, useMemo, useState } from 'react';
import { View, Pressable, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { C, F, inr } from '../../theme';
import { useApp } from '../../store';
import { Card, Row, T } from '../../components/ui';
import { creatorById } from '../../data';
import { Screen } from './shared';

type JobTab = 'all' | 'open' | 'progress' | 'completed';

export function Jobs({ navigation }: any) {
  const { jobs, orders, openSheet, closeJob, refreshCampaigns, showToast } = useApp();
  const [tab, setTab] = useState<JobTab>('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [sortAtoZ, setSortAtoZ] = useState(true);

  useEffect(() => {
    refreshCampaigns().catch((error: unknown) => showToast(error instanceof Error ? error.message : 'Unable to load campaigns.'));
  }, [refreshCampaigns, showToast]);

  const counts: Record<JobTab, number> = {
    all: jobs.length,
    open: jobs.filter((job: any) => job.status === 'open').length,
    progress: jobs.filter((job: any) => job.status === 'progress').length,
    completed: jobs.filter((job: any) => job.status === 'completed').length,
  };
  const tabs: { key: JobTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'open', label: 'Open' },
    { key: 'progress', label: 'In progress' },
    { key: 'completed', label: 'Done' },
  ];
  const shown = useMemo(() => {
    const filtered = jobs.filter((job: any) => {
      const matchesTab = tab === 'all' || job.status === tab;
      const matchesSearch = `${job.title} ${job.platform} ${job.deliverables}`.toLowerCase().includes(query.trim().toLowerCase());
      return matchesTab && matchesSearch;
    });
    return [...filtered].sort((a: any, b: any) => {
      const byTitle = String(a.title).localeCompare(String(b.title));
      return sortAtoZ ? byTitle : -byTitle;
    });
  }, [jobs, query, sortAtoZ, tab]);

  return (
    <Screen navigation={navigation}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <T size={30} w="semi" track={-0.8} color={C.text}>Campaigns</T>
        <Row style={{ gap: 12 }}>
          <Pressable onPress={() => setSearchOpen((value) => !value)} hitSlop={8} accessibilityLabel="Search campaigns" style={{ width: 38, height: 38, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="search-outline" size={22} color={C.text} />
          </Pressable>
          <Pressable onPress={() => setSortAtoZ((value) => !value)} hitSlop={8} accessibilityLabel={sortAtoZ ? 'Sort campaigns Z to A' : 'Sort campaigns A to Z'} style={{ width: 38, height: 38, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="swap-vertical-outline" size={22} color={C.text} />
          </Pressable>
        </Row>
      </Row>

      {searchOpen ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 13, borderRadius: 16, borderWidth: 1, borderColor: C.border2, backgroundColor: C.surface }}>
          <Ionicons name="search-outline" size={17} color={C.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search campaigns"
            placeholderTextColor={C.muted3}
            style={{ flex: 1, paddingVertical: 11, fontFamily: F.reg, fontSize: 14, color: C.text }}
          />
          {query ? <Pressable onPress={() => setQuery('')} hitSlop={8}><Ionicons name="close-circle" size={17} color={C.muted3} /></Pressable> : null}
        </View>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
        {tabs.map(({ key, label }) => {
          const active = tab === key;
          return (
            <Pressable
              key={key}
              onPress={() => setTab(key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={{
                minHeight: 40,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 13,
                borderRadius: 13,
                borderWidth: 1,
                borderColor: active ? C.dark : C.border2,
                backgroundColor: active ? C.dark : C.surface,
              }}
            >
              <Row style={{ gap: 6, alignItems: 'center' }}>
                {active ? <Ionicons name="checkmark" size={14} color={C.onDark} /> : null}
                <T size={13} w={active ? 'semi' : 'med'} color={active ? C.onDark : C.text}>{label}</T>
                <T size={11} w="semi" color={active ? C.onDarkMuted : C.muted2}>{counts[key]}</T>
              </Row>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ gap: 0 }}>
        {shown.map((job: any) => {
          const order = orders.find((item: any) => item.title === job.title);
          const status = job.status === 'open' ? 'Open' : job.status === 'progress' ? 'In progress' : 'Done';
          const statusColor = job.status === 'open' ? C.green : job.status === 'progress' ? C.primary : C.muted2;
          const statusBackground = job.status === 'open' ? C.greenBg : job.status === 'progress' ? C.primaryLight : C.surfaceSoft;
          const parsedCloseDate = job.closes ? new Date(job.closes) : null;
          const dateText = job.closes?.startsWith('Closes in ')
            ? job.closes
            : parsedCloseDate && !Number.isNaN(parsedCloseDate.getTime())
              ? `Bids close ${parsedCloseDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
              : job.closes || '';
          const creatorNames = (job.bidders || []).slice(0, 2).map((id: string) => {
            const bid = job.bids?.find((item: any) => item.creatorId === id);
            return bid?.creatorName || creatorById(id).name;
          });
          return (
            <View key={job.id} style={{ paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: C.borderSubtle }}>
              <Pressable onPress={() => openSheet('campaigndetail', { campaignId: job.id })} accessibilityRole="button">
                <Row style={{ alignItems: 'flex-start', gap: 11 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                    <T size={15} w="semi" color={C.pinkText}>
                      {creatorNames[0] ? creatorNames[0].charAt(0) : job.title.charAt(0).toUpperCase()}
                    </T>
                  </View>
                  <View style={{ flex: 1, gap: 5 }}>
                    <T size={14.5} w="semi" color={C.text} numberOfLines={2}>{job.title}</T>
                    <T size={12} color={C.muted2} numberOfLines={1}>
                      {creatorNames.length ? `${creatorNames.join(', ')} · ` : ''}{job.platform}{job.deliverables ? ` · ${job.deliverables}` : ''}
                    </T>
                    <View style={{ alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 99, backgroundColor: statusBackground }}>
                      <T size={11} w="semi" color={statusColor}>{status}</T>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 3, maxWidth: 108 }}>
                    <T size={15} w="semi" color={C.text} numberOfLines={1}>
                      {job.min === job.max ? inr(job.min) : `${inr(job.min)}–${inr(job.max)}`}
                    </T>
                    <T size={11} color={C.muted2} numberOfLines={1}>{dateText || `${job.bidsCount} bids`}</T>
                  </View>
                </Row>
              </Pressable>
              <View style={{ paddingLeft: 51, paddingTop: 10, gap: 9 }}>
                {job.status === 'open' ? (
                  <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <T size={12} w="semi" color={C.text}>{job.bidsCount} proposals</T>
                    <Pressable onPress={() => openSheet('reviewbids', { jobId: job.id })} style={{ paddingHorizontal: 11, paddingVertical: 7, borderRadius: 99, backgroundColor: C.cta }}>
                      <T size={11} w="semi" color={C.onCta}>Review proposals</T>
                    </Pressable>
                  </Row>
                ) : job.status === 'progress' ? (
                  <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <T size={12} color={C.muted2} numberOfLines={1} style={{ flex: 1 }}>{job.hired ? `Creator selected · ${inr(job.escrow || 0)} held` : 'Creator hired'}</T>
                    <Pressable onPress={() => order ? openSheet('order', { orderId: order.id }) : showToast('No order is linked to this campaign yet.')}><T size={12} w="semi" color={C.primary}>Open order</T></Pressable>
                  </Row>
                ) : (
                  <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <T size={12} color={C.muted2}>Campaign complete</T>
                    <T size={12} w="semi" color={C.primary}>Details</T>
                  </Row>
                )}
                {job.status === 'open' ? (
                  <Row style={{ justifyContent: 'flex-end', gap: 8 }}>
                    <Pressable onPress={() => openSheet('postjob', { editId: job.id })} hitSlop={8} accessibilityLabel={`Edit ${job.title}`}><Ionicons name="create-outline" size={18} color={C.muted2} /></Pressable>
                    <Pressable onPress={async () => {
                      try { await closeJob(job.id); showToast('Campaign closed.'); }
                      catch (error) { showToast(error instanceof Error ? error.message : 'Unable to close campaign.'); }
                    }} hitSlop={8} accessibilityLabel={`Close ${job.title} to new bids`}><Ionicons name="archive-outline" size={18} color={C.muted2} /></Pressable>
                  </Row>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
      {!shown.length ? (
        <Card style={{ alignItems: 'center', padding: 22, gap: 7 }}>
          <Ionicons name="briefcase-outline" size={26} color={C.muted3} />
          <T size={14} w="semi" color={C.text}>No campaigns here yet</T>
          <T size={12} color={C.muted2}>Try another tab or post a new campaign.</T>
        </Card>
      ) : null}

      <Pressable onPress={() => openSheet('postjob')} style={{ alignSelf: 'flex-end', width: 58, height: 58, borderRadius: 20, backgroundColor: C.cta, alignItems: 'center', justifyContent: 'center', ...{ elevation: 3 } }} accessibilityRole="button" accessibilityLabel="Post a job">
        <Ionicons name="add" size={27} color={C.onCta} />
      </Pressable>
    </Screen>
  );
}
