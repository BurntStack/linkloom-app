import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Btn, Card, Field, Row, Sheet, T } from '../../components/ui';
import { Job } from '../../data';
import { C, F, inr } from '../../theme';
import { useApp } from '../../store';
import { CreatorHeader, Page, type CreatorJob, toCreatorJob } from './shared';

export function FindJobs({ navigation }: any) {
  const { jobs, refreshCampaigns, showToast } = useApp();
  const [loadingCampaigns, setLoadingCampaigns] = useState(jobs.length === 0);
  const [filtersVisible, setFiltersVisible] = useState(false);
  useEffect(() => {
    let active = true;
    setLoadingCampaigns(true);
    refreshCampaigns().catch((error: unknown) => {
      if (active) showToast(error instanceof Error ? error.message : 'Unable to load campaigns.');
    }).finally(() => {
      if (active) setLoadingCampaigns(false);
    });
    return () => { active = false; };
  }, [refreshCampaigns, showToast]);
  const campaigns = useMemo(() => jobs.filter((job: Job) => job.status === 'open').map(toCreatorJob), [jobs]);
  const [query, setQuery] = useState('');
  const cityOptions = ['All cities', ...Array.from(new Set<string>(campaigns.map((job) => job.city).filter(Boolean)))];
  const platformOptions = ['All platforms', ...Array.from(new Set<string>(campaigns.map((job) => job.platform).filter(Boolean)))];
  const categoryOptions = ['All categories', ...Array.from(new Set<string>(campaigns.map((job) => job.category).filter(Boolean)))];
  const [city, setCity] = useState('All cities');
  const [platform, setPlatform] = useState('All platforms');
  const [category, setCategory] = useState('All categories');
  const [minimum, setMinimum] = useState('');
  const activeFilterCount = [city !== 'All cities', platform !== 'All platforms', category !== 'All categories', Boolean(minimum)].filter(Boolean).length;

  const filtered = useMemo(() => campaigns.filter((job) => {
    const matchesText = `${job.title} ${job.description} ${job.category} ${job.platform} ${job.city}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesCity = city === 'All cities' || job.city === city;
    const matchesPlatform = platform === 'All platforms' || job.platform === platform;
    const matchesCategory = category === 'All categories' || job.category === category;
    const matchesBudget = !minimum || job.maxBudget >= Number(minimum);
    return matchesText && matchesCity && matchesPlatform && matchesCategory && matchesBudget;
  }), [campaigns, query, city, platform, category, minimum]);

  const clearFilters = () => {
    setQuery('');
    setCity('All cities');
    setPlatform('All platforms');
    setCategory('All categories');
    setMinimum('');
  };

  return (
    <Page navigation={navigation} showTopBar={false} header={<CreatorHeader navigation={navigation} title="Find jobs" />}>
      <View style={{ gap: 12, marginTop: 1 }}>
        <View style={{ height: 50, borderRadius: 28, backgroundColor: C.surfaceSoft, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 11 }}>
          <Ionicons name="search" size={21} color={C.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search briefs, brands, cities"
            placeholderTextColor={C.muted}
            autoCapitalize="none"
            style={{ flex: 1, fontFamily: F.reg, fontSize: 14, color: C.text, padding: 0 }}
          />
          {query ? <Pressable onPress={() => setQuery('')} hitSlop={8}><Ionicons name="close-circle" size={19} color={C.muted} /></Pressable> : null}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
          <Pressable
            onPress={() => setFiltersVisible(true)}
            style={{ height: 39, borderRadius: 11, borderWidth: 1, borderColor: C.border2, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 7 }}
          >
            <Ionicons name="options-outline" size={17} color={C.text} />
            <T size={12} w="semi" color={C.text}>Filters</T>
            {activeFilterCount ? <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: C.text, alignItems: 'center', justifyContent: 'center' }}><T size={10} w="bold" color={C.surface}>{activeFilterCount}</T></View> : null}
          </Pressable>
          <QuickFilterChip
            label={city === 'All cities' ? 'City' : city}
            selected={city !== 'All cities'}
            onPress={() => setCity(city === 'All cities' ? cityOptions[1] || 'All cities' : 'All cities')}
          />
          <QuickFilterChip
            label={platform === 'All platforms' ? 'Platform' : platform}
            selected={platform !== 'All platforms'}
            onPress={() => setPlatform(platform === 'All platforms' ? platformOptions[1] || 'All platforms' : 'All platforms')}
          />
        </ScrollView>
        <Row style={{ justifyContent: 'space-between' }}>
          <T size={11} color={C.muted}>{filtered.length} open briefs</T>
          <T size={11} color={C.muted}>Open campaign details</T>
        </Row>
      </View>

      {filtered.length ? filtered.map((job) => (
        <FindJobRow key={job.id} job={job} onPress={() => navigation.navigate('CreatorJobDetail', { jobId: job.id })} />
      )) : (
        <Card style={{ marginTop: 8 }}><T size={13} color={C.muted}>
          {loadingCampaigns
            ? 'Loading campaigns posted by brands…'
            : campaigns.length
              ? 'No campaigns match these filters. Try changing or clearing your filters.'
              : 'No open campaigns from brands are available right now.'}
        </T></Card>
      )}
      <FilterSheet
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        onClear={clearFilters}
        onApply={() => setFiltersVisible(false)}
        city={city}
        cityOptions={cityOptions}
        setCity={setCity}
        platform={platform}
        platformOptions={platformOptions}
        setPlatform={setPlatform}
        category={category}
        categoryOptions={categoryOptions}
        setCategory={setCategory}
        minimum={minimum}
        setMinimum={setMinimum}
        resultCount={filtered.length}
      />
    </Page>
  );
}

function QuickFilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ height: 39, borderRadius: 11, borderWidth: 1, borderColor: selected ? C.text : C.border2, backgroundColor: selected ? C.text : C.surface, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' }}
    >
      <T size={12} w="med" color={selected ? C.surface : C.text}>{label}</T>
    </Pressable>
  );
}

function FindJobRow({ job, onPress }: { job: CreatorJob; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: C.border, flexDirection: 'row', alignItems: 'flex-start', gap: 13 }}>
      <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
        <T size={17} w="semi" color={C.primary}>{job.category.slice(0, 1).toUpperCase()}</T>
      </View>
      <View style={{ flex: 1, gap: 5 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <T size={14} w="semi" color={C.text} style={{ flex: 1, lineHeight: 19 }}>{job.title}</T>
          <T size={16} w="med" color={C.text}>{inr(job.maxBudget)}</T>
        </Row>
        <T size={11} color={C.muted} numberOfLines={1}>{job.category} · {job.platform} · {job.city}</T>
        <Row style={{ gap: 7, flexWrap: 'wrap' }}>
          <View style={{ backgroundColor: C.pinkBg, borderRadius: 18, paddingHorizontal: 9, paddingVertical: 5 }}>
              <T size={10} w="semi" color={C.pinkText}>{job.bidsCount} bids</T>
          </View>
          <T size={10} color={C.muted}>{job.deadline}</T>
        </Row>
      </View>
    </Pressable>
  );
}

function FilterSheet({
  visible,
  onClose,
  onClear,
  onApply,
  city,
  cityOptions,
  setCity,
  platform,
  platformOptions,
  setPlatform,
  category,
  categoryOptions,
  setCategory,
  minimum,
  setMinimum,
  resultCount,
}: {
  visible: boolean;
  onClose: () => void;
  onClear: () => void;
  onApply: () => void;
  city: string;
  cityOptions: string[];
  setCity: (value: string) => void;
  platform: string;
  platformOptions: string[];
  setPlatform: (value: string) => void;
  category: string;
  categoryOptions: string[];
  setCategory: (value: string) => void;
  minimum: string;
  setMinimum: (value: string) => void;
  resultCount: number;
}) {
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Filters"
      footer={<Btn label={`Show ${resultCount} briefs`} onPress={onApply} style={{ minHeight: 48, borderRadius: 28 }} />}
    >
      <View style={{ gap: 9 }}>
        <FilterGroup label="City" options={cityOptions} selected={city} onSelect={setCity} />
        <View style={{ height: 1, backgroundColor: C.border }} />
        <FilterGroup label="Platform" options={platformOptions} selected={platform} onSelect={setPlatform} />
        <View style={{ height: 1, backgroundColor: C.border }} />
        <FilterGroup label="Category" options={categoryOptions} selected={category} onSelect={setCategory} />
        <View style={{ height: 1, backgroundColor: C.border }} />
        <Row style={{ justifyContent: 'space-between' }}>
          <T size={13} w="semi" color={C.text}>Budget at least</T>
          <T size={13} w="semi" color={C.text}>{minimum ? inr(Number(minimum)) : 'Any'}</T>
        </Row>
        <Field
          value={minimum}
          onChangeText={(value) => setMinimum(value.replace(/\D/g, ''))}
          placeholder="Any minimum budget"
          prefix="₹"
          keyboardType="number-pad"
        />
        <Pressable onPress={onClear} style={{ alignSelf: 'flex-end', paddingVertical: 5 }}>
          <T size={12} w="semi" color={C.text}>Clear all</T>
        </Pressable>
      </View>
    </Sheet>
  );
}

function FilterGroup({ label, options, selected, onSelect }: { label: string; options: string[]; selected: string; onSelect: (value: string) => void }) {
  return (
    <View style={{ gap: 9, paddingVertical: 6 }}>
      <T size={13} w="semi" color={C.text}>{label}</T>
      <Row style={{ gap: 8, flexWrap: 'wrap' }}>
        {options.map((option) => {
          const active = selected === option;
          return (
              <Pressable
                key={option}
                onPress={() => onSelect(option)}
                style={{ borderRadius: 10, borderWidth: 1, borderColor: active ? C.text : C.border2, backgroundColor: active ? C.text : C.surface, paddingHorizontal: 12, paddingVertical: 8 }}
              >
                <T size={12} w="med" color={active ? C.surface : C.text}>{option.replace(/^All /, 'Any ')}</T>
              </Pressable>
          );
        })}
      </Row>
    </View>
  );
}


function Info({ label, value }: { label: string; value: string }) {
  return <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}><T size={12} color={C.muted}>{label}</T><T size={12} w="semi" color={C.text} style={{ flex: 1, textAlign: 'right' }}>{value}</T></Row>;
}
