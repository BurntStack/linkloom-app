import React, { useEffect, useState } from 'react';
import { View, ScrollView, Pressable, TextInput, Modal, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { C, F, shadowSm } from '../../theme';
import { useApp } from '../../store';
import { Btn, Card, CreatorCard, Field, Row, Select, T } from '../../components/ui';
import { CREATORS } from '../../data';
import { Screen, Grid } from './shared';

export function Search({ navigation }: any) {
  const { openCreator, creatorSearchResults, searchCreators, showToast, cart } = useApp();
  const { width } = useWindowDimensions();
  const gw = width - 40;
  const [q, setQ] = useState('');
  const [platform, setPlatform] = useState('All');
  const [cat, setCat] = useState('All');
  const [sort, setSort] = useState('Recommended');
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  const cats = ['All', ...Array.from(new Set([
    ...creatorSearchResults.map((creator: any) => creator.cat).filter(Boolean),
    ...CREATORS.map((c) => c.cat),
  ]))];
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      setLoading(true);
      searchCreators({
        ...(q.trim() ? { q: q.trim() } : {}),
        ...(platform !== 'All' ? { platform } : {}),
        ...(cat !== 'All' ? { category: cat } : {}),
        ...(location.trim() ? { location: location.trim() } : {}),
        ...(minPrice ? { minPrice: Number(minPrice) } : {}),
        ...(maxPrice ? { maxPrice: Number(maxPrice) } : {}),
      }).catch((error: unknown) => {
        if (active) showToast(error instanceof Error ? error.message : 'Unable to load creators.');
      }).finally(() => {
        if (active) setLoading(false);
      });
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [q, platform, cat, location, minPrice, maxPrice, searchCreators, showToast]);

  let list = creatorSearchResults;

  if (sort === 'Price: low to high') list = [...list].sort((a, b) => a.price - b.price);
  if (sort === 'Price: high to low') list = [...list].sort((a, b) => b.price - a.price);
  if (sort === 'Rating') list = [...list].sort((a, b) => b.rating - a.rating);

  const clearFilters = () => {
    setQ('');
    setPlatform('All');
    setCat('All');
    setSort('Recommended');
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
  };

  const activeFilterCount = [cat !== 'All', platform !== 'All', !!location, !!minPrice, !!maxPrice].filter(Boolean).length;
  const isFiltered = q || activeFilterCount > 0 || sort !== 'Recommended';

  return (
    <Screen navigation={navigation}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <T size={30} w="semi" track={-0.8} color={C.text}>Find creators</T>
        <Row style={{ gap: 10 }}>
          <Pressable onPress={() => navigation.navigate('Lists')} accessibilityLabel="Open favourites" style={{ width: 38, height: 38, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="heart-outline" size={22} color={C.text} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Cart')} accessibilityLabel="Open hiring cart" style={{ width: 38, height: 38, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="cart-outline" size={22} color={C.text} />
            {cart.length ? (
              <View style={{ position: 'absolute', top: 0, right: -1, minWidth: 17, height: 17, paddingHorizontal: 4, borderRadius: 9, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
                <T size={9} w="bold" color={C.onPrimary}>{cart.length}</T>
              </View>
            ) : null}
          </Pressable>
        </Row>
      </Row>

      {/* Search Input Bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: C.surfaceSoft,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: C.border,
          paddingHorizontal: 14,
          gap: 10,
        }}
      >
        <Ionicons name="search" size={18} color={C.muted2} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search by name, platform, category..."
          placeholderTextColor={C.muted3}
          underlineColorAndroid="transparent"
          maxFontSizeMultiplier={1.16}
          style={{
            flex: 1,
            paddingVertical: 13,
            fontFamily: F.reg,
            fontSize: 14,
            color: C.text,
            backgroundColor: 'transparent',
          }}
        />
        {q ? (
          <Pressable onPress={() => setQ('')} hitSlop={8}>
            <Ionicons name="close-circle" size={16} color={C.muted3} />
          </Pressable>
        ) : null}
      </View>

      {/* Quick filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
      >
        <Pressable
          onPress={() => setFilterOpen(true)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12, backgroundColor: C.dark }}
        >
          <Ionicons name="options-outline" size={15} color={C.onDark} />
          <T size={12} w="semi" color={C.onDark}>Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}</T>
        </Pressable>
        {cats.filter((item) => item !== 'All').map((c) => (
          <Pressable
            key={c}
            onPress={() => setCat(cat === c ? 'All' : c)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              paddingVertical: 8,
              paddingHorizontal: 13,
              borderRadius: 12,
              backgroundColor: cat === c ? C.primary : C.surface,
              borderWidth: 1,
              borderColor: cat === c ? C.primary : C.border,
            }}
          >
            {cat === c ? <Ionicons name="checkmark" size={13} color={C.onPrimary} /> : null}
            <T size={12} w={cat === c ? 'semi' : 'med'} color={cat === c ? C.onPrimary : C.text}>
              {c}
            </T>
          </Pressable>
        ))}
      </ScrollView>

      {/* Sort & Count Bar */}
      <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Row style={{ gap: 6, alignItems: 'center' }}>
          <T size={12} w="semi" color={C.muted}>
            {loading ? 'Loading creators…' : <><T size={12} w="bold" color={C.text}>{list.length} creators</T> match</>}
          </T>
          {isFiltered ? (
            <Pressable onPress={clearFilters} hitSlop={6}>
              <T size={11} w="semi" color={C.primary}>
                · Reset
              </T>
            </Pressable>
          ) : null}
        </Row>
        <View style={{ width: 148 }}>
          <Select
            value={sort}
            options={['Recommended', 'Rating', 'Price: low to high', 'Price: high to low']}
            onChange={setSort}
          />
        </View>
      </Row>

      {list.length === 0 && !loading ? (
        <Card style={{ alignItems: 'center', padding: 24, gap: 8 }}>
          <Ionicons name="search-outline" size={32} color={C.muted3} />
          <T size={14} w="semi" color={C.text}>
            No creators found
          </T>
          <T size={12} color={C.muted} style={{ textAlign: 'center' }}>
            Try adjusting your search terms or filters to find matches.
          </T>
          <Btn label="Clear filters" small variant="outline" onPress={clearFilters} />
        </Card>
      ) : null}

      <Grid>
        {list.map((c) => (
          <CreatorCard key={c.id} c={c} width={gw} onPress={() => openCreator(c.id)} showBadge />
        ))}
      </Grid>
      <Modal visible={filterOpen} transparent animationType="slide" onRequestClose={() => setFilterOpen(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: C.overlay }}>
          <Pressable onPress={() => setFilterOpen(false)} style={{ flex: 1 }} accessibilityLabel="Close filters" />
          <View style={{ maxHeight: '88%', backgroundColor: C.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' }}>
            <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 6 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: C.border2 }} />
            </View>
            <Row style={{ justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.borderSubtle }}>
              <T size={23} w="semi" color={C.text}>Filters</T>
              <Pressable onPress={clearFilters} hitSlop={8}><T size={13} w="semi" color={C.text}>Reset</T></Pressable>
            </Row>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingVertical: 18, gap: 22 }} keyboardShouldPersistTaps="handled">
              <View style={{ gap: 10 }}>
                <T size={11} w="bold" track={0.8} color={C.primary}>WHAT THEY MAKE</T>
                <T size={14} w="semi" color={C.text}>Category or niche</T>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {cats.map((value) => (
                    <Pressable key={value} onPress={() => setCat(value)} style={{ paddingVertical: 9, paddingHorizontal: 13, borderRadius: 12, backgroundColor: cat === value ? C.dark : C.surface, borderWidth: 1, borderColor: cat === value ? C.dark : C.border2 }}>
                      <T size={12} w={cat === value ? 'semi' : 'med'} color={cat === value ? C.onDark : C.text}>{value}</T>
                    </Pressable>
                  ))}
                </View>
                <T size={14} w="semi" color={C.text} style={{ marginTop: 5 }}>Platform</T>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['All', 'Instagram', 'YouTube', 'TikTok', 'Other'].map((value) => (
                    <Pressable key={value} onPress={() => setPlatform(value)} style={{ paddingVertical: 9, paddingHorizontal: 13, borderRadius: 12, backgroundColor: platform === value ? C.dark : C.surface, borderWidth: 1, borderColor: platform === value ? C.dark : C.border2 }}>
                      <T size={12} w={platform === value ? 'semi' : 'med'} color={platform === value ? C.onDark : C.text}>{value}</T>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={{ gap: 10 }}>
                <T size={11} w="bold" track={0.8} color={C.primary}>WHERE AND PRICE</T>
                <Field label="Creator location" value={location} onChangeText={setLocation} placeholder="City or region" />
                <Row style={{ gap: 8 }}>
                  <Field label="Minimum rate (₹)" value={minPrice} onChangeText={(value) => setMinPrice(value.replace(/\D/g, ''))} placeholder="Min" keyboardType="number-pad" />
                  <Field label="Maximum rate (₹)" value={maxPrice} onChangeText={(value) => setMaxPrice(value.replace(/\D/g, ''))} placeholder="Max" keyboardType="number-pad" />
                </Row>
              </View>
            </ScrollView>
            <View style={{ flexDirection: 'row', gap: 10, padding: 18, borderTopWidth: 1, borderTopColor: C.borderSubtle }}>
              <Btn label="Clear all" variant="outline" flex onPress={clearFilters} />
              <Btn label={`Show ${list.length} creators`} flex onPress={() => setFilterOpen(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
