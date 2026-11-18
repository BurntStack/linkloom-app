import React, { useEffect, useState } from 'react';
import { View, Image, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, inr } from '../../theme';
import { useApp } from '../../store';
import { Avatar, Btn, Card, Heading, Row, StackHeader, T } from '../../components/ui';
import { Creator } from '../../data';

export function CreatorProfile({ navigation, route }: any) {
  const creatorId = String(route.params?.id || '');
  const { openSheet, saved, unsaveCreator, showToast, startConversation, creatorSearchResults, loadPublicCreator, loadCreatorReviews } = useApp();
  const [creator, setCreator] = useState<Creator | undefined>(() => creatorSearchResults.find((item: Creator) => item.id === creatorId));
  const [reviews, setReviews] = useState<any[]>([]);
  const [profileTab, setProfileTab] = useState<'Rates' | 'Work' | 'Reviews'>('Rates');

  useEffect(() => {
    let active = true;
    setCreator(undefined);
    loadPublicCreator(creatorId).then((profile: Creator) => {
      if (active) setCreator(profile);
    }).catch((error: unknown) => {
      if (active) showToast(error instanceof Error ? error.message : 'Unable to load creator profile.');
    });
    return () => { active = false; };
  }, [creatorId]);

  useEffect(() => {
    let active = true;
    loadCreatorReviews(creatorId).then((items: any[]) => {
      if (active) setReviews(items);
    }).catch((error: unknown) => {
      if (active) showToast(error instanceof Error ? error.message : 'Unable to load creator reviews.');
    });
    return () => { active = false; };
  }, [creatorId]);

  const c = creator;
  if (!c) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <StackHeader title="Creator profile" onBack={() => navigation.goBack()} />
        <View style={{ padding: 20 }}><T color={C.muted}>Loading creator profile…</T></View>
      </View>
    );
  }
  const isSaved = saved.includes(c.id);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StackHeader
        title={c.name}
        onBack={() => navigation.goBack()}
        right={
          <Pressable
            onPress={async () => {
              if (!isSaved) return openSheet('savetolist', { creatorId: c.id });
              try { await unsaveCreator(c.id); }
              catch (error) { showToast(error instanceof Error ? error.message : 'Unable to remove creator from shortlist.'); }
            }}
            hitSlop={8}
            android_ripple={{ color: C.pinkBg, borderless: true }}
            style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 6 }}
          >
            <Ionicons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={20}
              color={isSaved ? C.pink : C.text}
            />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 18 }}>
          {/* Main Profile Info Card */}
          <View style={{ gap: 16 }}>
            <Row style={{ gap: 14, alignItems: 'center' }}>
              <Avatar name={c.name} size={72} photo={c.photo} verified={c.verified} />
              <View style={{ flex: 1, gap: 4 }}>
                <Row style={{ gap: 6, alignItems: 'center' }}>
                  <T size={23} w="semi" color={C.text}>
                    {c.name}
                  </T>
                  {c.verified ? <Ionicons name="checkmark-circle" size={18} color={C.blue} /> : null}
                </Row>
                <T size={13} color={C.muted2}>
                  @{c.name.toLowerCase().replace(/\s+/g, '')} · {c.city}
                </T>
                <Row style={{ gap: 5, alignItems: 'center' }}>
                  <Ionicons name="star" size={13} color={C.amber} />
                  <T size={12} w="semi" color={C.text}>{c.rating.toFixed(1)}</T>
                  <T size={12} color={C.muted2}>· {c.delivered} collaborations</T>
                </Row>
              </View>
            </Row>
            <Row style={{ gap: 7, alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99, backgroundColor: C.greenBg }}>
                <Ionicons name="checkmark-circle" size={14} color={C.green} />
                <T size={11} w="semi" color={C.green}>{c.badge || 'Open to work'}</T>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99, borderWidth: 1, borderColor: C.border2 }}>
                <Ionicons
                  name={c.platform === 'YouTube' ? 'logo-youtube' : 'logo-instagram'}
                  size={14}
                  color={c.platform === 'YouTube' ? C.red : C.primary}
                />
                <T size={11} w="semi" color={C.text}>{c.platform}</T>
              </View>
            </Row>
            <T size={14} color={C.textSecondary} style={{ lineHeight: 21 }}>
              {c.bio}
            </T>
          </View>

          {/* Key Metrics Row */}
          <Row style={{ gap: 10 }}>
            {[
              [c.followers, 'Followers'],
              [c.eng, 'Engagement'],
              [c.rating.toFixed(1), 'Rating'],
            ].map(([l, v]) => (
              <Card key={v} style={{ flex: 1, gap: 5, padding: 12 }}>
                <T size={17} w="semi" color={C.text}>{l}</T>
                <T size={11} color={C.muted2}>{v}</T>
              </Card>
            ))}
          </Row>

          <Row style={{ borderBottomWidth: 1, borderBottomColor: C.border, marginHorizontal: -20, paddingHorizontal: 12, justifyContent: 'space-around' }}>
            {(['Rates', 'Work', 'Reviews'] as const).map((tab) => (
              <Pressable key={tab} onPress={() => setProfileTab(tab)} style={{ minWidth: 88, alignItems: 'center', paddingVertical: 12, borderBottomWidth: profileTab === tab ? 3 : 0, borderBottomColor: C.dark }}>
                <T size={13} w={profileTab === tab ? 'semi' : 'med'} color={profileTab === tab ? C.text : C.muted2}>
                  {tab}{tab === 'Work' ? `  ${c.delivered}` : tab === 'Reviews' ? `  ${reviews.length}` : ''}
                </T>
              </Pressable>
            ))}
          </Row>

          {profileTab === 'Rates' ? (
            <View style={{ gap: 10 }}>
              <Heading title="Rates" sub="Price per post · escrow is funded after acceptance" />
              <Card style={{ gap: 6 }}>
                <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <T size={15} w="semi" color={C.text}>{c.platform} collaboration</T>
                  <T size={20} w="semi" color={C.text}>{inr(c.price)}</T>
                </Row>
                <T size={12} color={C.muted2}>Starting rate · {c.cat}</T>
              </Card>
            </View>
          ) : null}

          {profileTab === 'Rates' && c.packages?.length ? (
            <View style={{ gap: 8 }}>
              <Heading title="Creator packages" sub="Choose a package to add to your cart." />
              {c.packages.map((item) => (
                <Card key={item.id} style={{ gap: 7 }}>
                  <T size={14} w="bold" color={C.text}>{item.title}</T>
                  <T size={12} color={C.muted}>{item.platform} · {item.deliverables} · {item.deliveryDays} days</T>
                  <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <T size={14} w="bold" color={C.primary}>{inr(item.price)}</T>
                    <Btn label="Add to cart" small onPress={() => openSheet('addtocart', { packageId: item.id, title: item.title })} />
                  </Row>
                </Card>
              ))}
            </View>
          ) : null}
          {profileTab === 'Work' ? (
            <View style={{ gap: 9 }}>
              <Heading title="Past work" />
              <Card style={{ gap: 9, padding: 10 }}>
                <Image source={c.portfolioPreview} resizeMode="cover" style={{ width: '100%', height: 220, borderRadius: 16 }} />
                <T size={13} w="semi" color={C.text}>{c.cat} campaign sample</T>
                <T size={12} color={C.muted2}>{c.reach} average reach · {c.eng} engagement</T>
              </Card>
            </View>
          ) : null}
          {profileTab === 'Reviews' && reviews.length ? (
            <View style={{ gap: 8 }}>
              <Heading title={`Reviews (${reviews.length})`} />
              {reviews.slice(0, 10).map((review: any) => (
                <Card key={String(review.id)} style={{ gap: 5 }}>
                  <T size={13} w="bold" color={C.text}>{review.title || `${review.stars || review.rating || ''} ★`}</T>
                  <T size={12} color={C.muted}>{review.text || review.comment || review.body || ''}</T>
                </Card>
              ))}
            </View>
          ) : null}
          {profileTab === 'Reviews' && !reviews.length ? (
            <Card><T size={13} color={C.muted2}>No reviews have been shared yet.</T></Card>
          ) : null}

          {/* Bottom Action Buttons */}
          <Row style={{ gap: 8 }}>
            <Btn
              label={isSaved ? 'Saved in Shortlist' : 'Save to Shortlist'}
              variant="outline"
              flex
              icon={isSaved ? 'heart' : 'heart-outline'}
              onPress={async () => {
                if (!isSaved) return openSheet('savetolist', { creatorId: c.id });
                try { await unsaveCreator(c.id); }
                catch (error) { showToast(error instanceof Error ? error.message : 'Unable to remove creator from shortlist.'); }
              }}
            />
            <Btn
              label="Direct Chat"
              variant="outline"
              flex
              icon="chatbubble-outline"
              onPress={async () => {
                try {
                  const conversationId = await startConversation({ creatorId: c.id, creatorName: c.name });
                  if (conversationId) openSheet('messages', { conversationId });
                } catch (error) {
                  showToast(error instanceof Error ? error.message : 'Unable to start conversation.');
                }
              }}
            />
          </Row>
          <Btn
            label="Invite to collaborate"
            icon="paper-plane-outline"
            onPress={() => openSheet('createoffer', { creator: c })}
          />
        </View>
      </ScrollView>
    </View>
  );
}
