import React, { useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../../theme';
import { useApp } from '../../../store';
import { Avatar, Btn, Card, Field, Sheet, T } from '../../../components/ui';

export function Messages() {
  const { closeSheet, sheet, conversations, openSheet, sendMessage, loadConversationMessages, showToast } = useApp();
  const [draft, setDraft] = useState('');
  const conversation = conversations.find((item: any) => item.id === sheet.params?.conversationId);
  useEffect(() => {
    if (conversation?.id) {
      loadConversationMessages(conversation.id).catch((error: unknown) =>
        showToast(error instanceof Error ? error.message : 'Unable to load messages.'),
      );
    }
  }, [conversation?.id]);

  return (
    <Sheet
      visible
      onClose={closeSheet}
      title={conversation?.creatorName || 'Messages'}
      sub={conversation?.jobTitle || 'Your campaign conversations'}
      footer={<Btn label="Close" variant="outline" onPress={closeSheet} />}
    >
      {conversation ? (
        <View style={{ gap: 9 }}>
          {conversation.messages.map((message: any) => (
            <View
              key={message.id}
              style={{
                alignSelf: message.sender === 'brand' ? 'flex-end' : 'flex-start',
                maxWidth: '88%',
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 16,
                borderBottomRightRadius: message.sender === 'brand' ? 5 : 16,
                borderBottomLeftRadius: message.sender === 'brand' ? 16 : 5,
                backgroundColor: message.sender === 'brand' ? C.primaryLight : C.surfaceSoft,
              }}
            >
              <T size={12.5} color={C.text}>{message.text}</T>
            </View>
          ))}
          <View style={{ gap: 9, paddingTop: 4 }}>
            <Field label="Message" value={draft} onChangeText={setDraft} multiline placeholder="Write the first message to this creator…" />
            <Btn
              label="Send message"
              icon="send-outline"
              onPress={async () => {
                try {
                  if (await sendMessage(conversation.id, draft)) setDraft('');
                  else if (!draft.trim()) showToast('Write a message before sending.');
                } catch (error) {
                  showToast(error instanceof Error ? error.message : 'Unable to send message.');
                }
              }}
            />
          </View>
        </View>
      ) : conversations.length ? (
        <View style={{ gap: 0 }}>
          <T size={11} w="bold" track={0.7} color={C.muted2} style={{ paddingBottom: 8 }}>
            OPEN CHATS · {conversations.length}
          </T>
          {conversations.map((item: any, index: number) => {
            const latestMessage = item.messages[item.messages.length - 1];
            return (
              <Pressable
                key={item.id}
                onPress={() => openSheet('messages', { conversationId: item.id })}
                accessibilityRole="button"
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 11,
                  paddingVertical: 13,
                  borderBottomWidth: index < conversations.length - 1 ? 1 : 0,
                  borderBottomColor: C.borderSubtle,
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                <Avatar name={item.creatorName} photo={item.creatorPhotoUrl ? { uri: item.creatorPhotoUrl } : undefined} size={42} />
                <View style={{ flex: 1, gap: 4 }}>
                  <T size={14} w="semi" color={C.text}>{item.creatorName}</T>
                  <T size={12} color={C.textSecondary} numberOfLines={1}>
                    {latestMessage?.text || 'Start the conversation'}
                  </T>
                  <T size={10.5} color={C.muted}>{item.jobTitle || 'Direct message'}</T>
                </View>
                <Ionicons name="chevron-forward" size={17} color={C.muted3} />
              </Pressable>
            );
          })}
        </View>
      ) : (
        <Card style={{ alignItems: 'center', gap: 7, paddingVertical: 22 }}>
          <Ionicons name="chatbubbles-outline" size={25} color={C.muted3} />
          <T size={13} w="semi" color={C.text}>No conversations yet</T>
          <T size={11.5} color={C.muted} style={{ textAlign: 'center' }}>
            Open a creator profile or proposal to message a creator.
          </T>
        </Card>
      )}
    </Sheet>
  );
}
