import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Card, Row, StackHeader, T } from '../../components/ui';
import { C, F, inr } from '../../theme';
import { useApp } from '../../store';
import { Empty } from './shared';

type MessageFilter = 'all' | 'brand' | 'creator';

function messageTime(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
}

export function CreatorMessages({ navigation }: any) {
  const { creatorProfile, conversations, orders, sendMessage, loadConversationMessages, showToast } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<MessageFilter>('all');
  const creatorId = creatorProfile?.creatorId || `creator-${creatorProfile?.email || 'guest'}`;
  const creatorConversations = conversations.filter((item: any) => item.creatorId === creatorId);
  const selected = creatorConversations.find((item: any) => item.id === selectedId);
  useEffect(() => {
    if (selectedId) {
      loadConversationMessages(selectedId).catch((error: unknown) =>
        showToast(error instanceof Error ? error.message : 'Unable to load messages.'),
      );
    }
  }, [selectedId]);
  const canReply = selected?.messages.some((message: any) => message.sender === 'brand');
  const relatedOrder = selected && orders.find((order: any) =>
    (selected.jobId && order.id === selected.jobId) ||
    (selected.jobTitle && order.title === selected.jobTitle),
  );

  const filteredConversations = useMemo(() => creatorConversations.filter((conversation: any) => {
    const latest = conversation.messages[conversation.messages.length - 1];
    const matchesText = `${conversation.brandName || ''} ${conversation.jobTitle || ''} ${latest?.text || ''}`
      .toLowerCase().includes(query.trim().toLowerCase());
    const matchesFilter = filter === 'all' ||
      (filter === 'brand' && latest?.sender === 'brand') ||
      (filter === 'creator' && latest?.sender === 'creator');
    return matchesText && matchesFilter;
  }), [creatorConversations, filter, query]);

  if (selected) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: C.bg }}>
        <StackHeader
          title={selected.brandName || 'Messages'}
          onBack={() => { setSelectedId(null); setDraft(''); }}
          right={<Avatar name={selected.brandName || 'Brand'} size={34} photo={selected.brandPhotoUrl ? { uri: selected.brandPhotoUrl } : undefined} />}
        />
        <View style={{ paddingHorizontal: 16, paddingTop: 12, gap: 10 }}>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 }}>
            <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="briefcase-outline" size={18} color={C.primary} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <T size={12} w="semi" color={C.text} numberOfLines={1}>{selected.jobTitle || 'Campaign conversation'}</T>
              <T size={10.5} color={C.muted}>{relatedOrder ? `Order ${relatedOrder.code || ''} · ${relatedOrder.stage === 'released' ? 'Funds released' : 'Active order'}` : 'Campaign discussion'}</T>
            </View>
            {relatedOrder ? (
              <View style={{ alignItems: 'flex-end', gap: 3 }}>
                <T size={10} color={C.muted}>Escrow</T>
                <T size={12} w="semi" color={C.text}>{inr(relatedOrder.held || 0)}</T>
              </View>
            ) : null}
          </Card>
        </View>
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1, justifyContent: selected.messages.length ? 'flex-end' : 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          {!selected.messages.length ? (
            <T size={12} color={C.muted} style={{ textAlign: 'center' }}>Your campaign conversation will appear here.</T>
          ) : selected.messages.map((message: any) => {
            const own = message.sender === 'creator';
            return (
              <View key={message.id} style={{ alignSelf: own ? 'flex-end' : 'flex-start', maxWidth: '88%', gap: 4 }}>
                <View style={{
                  paddingHorizontal: 14,
                  paddingVertical: 11,
                  borderRadius: 18,
                  borderBottomRightRadius: own ? 5 : 18,
                  borderBottomLeftRadius: own ? 18 : 5,
                  backgroundColor: own ? C.primaryLight : C.surface,
                  borderWidth: own ? 0 : 1,
                  borderColor: C.border,
                }}>
                  <T size={13} color={C.text} style={{ lineHeight: 19 }}>{message.text}</T>
                </View>
                <T size={10} color={own ? C.primary : C.muted} style={{ alignSelf: own ? 'flex-end' : 'flex-start' }}>{messageTime(message.sentAt)}</T>
              </View>
            );
          })}
          {!canReply ? (
            <Card style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginTop: 8 }}>
              <Ionicons name="information-circle-outline" size={18} color={C.muted} />
              <T size={12} color={C.muted} style={{ flex: 1, lineHeight: 18 }}>You can reply after the brand sends the first message.</T>
            </Card>
          ) : null}
        </ScrollView>
        {canReply ? (
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 9, padding: 12, paddingBottom: 16, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.borderSubtle }}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Write a message…"
              placeholderTextColor={C.muted}
              multiline
              maxLength={2000}
              style={{
                flex: 1,
                minHeight: 44,
                maxHeight: 110,
                borderWidth: 1,
                borderColor: C.borderSubtle,
                borderRadius: 24,
                paddingHorizontal: 15,
                paddingVertical: 11,
                color: C.text,
                backgroundColor: C.surface,
                fontFamily: F.reg,
                fontSize: 13,
                textAlignVertical: 'center',
              }}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send reply"
              disabled={!draft.trim()}
              onPress={async () => {
                try {
                  if (await sendMessage(selected.id, draft)) setDraft('');
                } catch (error) {
                  showToast(error instanceof Error ? error.message : 'Unable to send message.');
                }
              }}
              style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: C.cta, alignItems: 'center', justifyContent: 'center', opacity: draft.trim() ? 1 : 0.55 }}
            >
              <Ionicons name="send" size={17} color={C.onCta} />
            </Pressable>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StackHeader title="Messages" onBack={() => navigation.goBack()} />
      <View style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 12, gap: 12 }}>
        <View style={{ height: 48, borderRadius: 26, backgroundColor: C.surfaceSoft, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10 }}>
          <Ionicons name="search" size={19} color={C.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search chats"
            placeholderTextColor={C.muted}
            style={{ flex: 1, padding: 0, fontFamily: F.reg, fontSize: 14, color: C.text }}
          />
          {query ? <Pressable onPress={() => setQuery('')} hitSlop={8}><Ionicons name="close-circle" size={18} color={C.muted} /></Pressable> : null}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {([
            ['all', 'All'],
            ['brand', `Brand replied ${creatorConversations.filter((item: any) => item.messages[item.messages.length - 1]?.sender === 'brand').length}`],
            ['creator', 'Your reply'],
          ] as [MessageFilter, string][]).map(([key, label]) => {
            const active = filter === key;
            return (
              <Pressable key={key} onPress={() => setFilter(key)} style={{
                minHeight: 38,
                paddingHorizontal: 13,
                borderRadius: 11,
                borderWidth: 1,
                borderColor: active ? C.text : C.border2,
                backgroundColor: active ? C.text : C.surface,
                justifyContent: 'center',
              }}>
                <T size={12} w="semi" color={active ? C.surface : C.text}>{label}</T>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 24 }}>
        {filteredConversations.length ? filteredConversations.map((conversation: any) => {
          const latest = conversation.messages[conversation.messages.length - 1];
          const waitingOnCreator = latest?.sender === 'brand';
          const title = conversation.brandName || 'Brand';
          return (
            <Pressable key={conversation.id} onPress={() => setSelectedId(conversation.id)} style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: C.border,
            }}>
              <Avatar name={title} size={52} photo={conversation.brandPhotoUrl ? { uri: conversation.brandPhotoUrl } : undefined} />
              <View style={{ flex: 1, gap: 4 }}>
                <Row style={{ alignItems: 'center', gap: 7 }}>
                  <T size={14} w="semi" color={C.text} numberOfLines={1}>{title}</T>
                  {waitingOnCreator ? <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.creatorAccent }} /> : null}
                </Row>
                <T size={11} color={C.muted} numberOfLines={1}>{conversation.jobTitle || 'Campaign conversation'}</T>
                <T size={12} color={C.text} numberOfLines={1}>{latest?.text || 'The brand has not sent a message yet.'}</T>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 5 }}>
                <T size={10} color={waitingOnCreator ? C.pinkText : C.muted}>{messageTime(latest?.sentAt)}</T>
                {waitingOnCreator ? (
                  <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: C.pinkText, alignItems: 'center', justifyContent: 'center' }}>
                    <T size={10} w="bold" color={C.white}>1</T>
                  </View>
                ) : <Ionicons name="checkmark" size={15} color={C.muted} />}
              </View>
            </Pressable>
          );
        }) : (
          <Empty
            icon="chatbubbles-outline"
            title={creatorConversations.length ? 'No matching chats' : 'No campaign conversations'}
            body={creatorConversations.length
              ? 'Try another search or conversation filter.'
              : 'Brands can start a conversation after reviewing your profile or proposal. You can reply once they message you.'}
          />
        )}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 8, padding: 15, backgroundColor: C.surfaceSubtle }}>
        <Ionicons name="information-circle-outline" size={18} color={C.muted} />
        <T size={11.5} color={C.muted} style={{ flex: 1, lineHeight: 17 }}>
          A chat opens when a brand contacts you. Keep campaign conversations in one place.
        </T>
      </View>
    </View>
  );
}
