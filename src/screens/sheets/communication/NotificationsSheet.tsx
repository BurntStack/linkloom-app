import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../../theme';
import { useApp } from '../../../store';
import { Btn, Card, Row, Sheet, T } from '../../../components/ui';

export function Notifications() {
  const { closeSheet, notifications, readNotification, readAllNotifications, showToast } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const unreadCount = notifications.filter((notification: any) => !(notification.read || notification.isRead)).length;
  const visibleNotifications = filter === 'unread'
    ? notifications.filter((notification: any) => !(notification.read || notification.isRead))
    : notifications;

  const notificationDate = (notification: any) => {
    const raw = notification.createdAt || notification.created_at || '';
    if (!raw) return notification.time || '';
    const date = new Date(raw);
    return Number.isNaN(date.getTime())
      ? String(raw)
      : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const notificationGroup = (notification: any) => {
    const raw = notification.createdAt || notification.created_at || '';
    const date = new Date(raw);
    if (!raw || Number.isNaN(date.getTime())) return 'EARLIER';
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const sameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    if (sameDay(date, today)) return 'TODAY';
    if (sameDay(date, yesterday)) return 'YESTERDAY';
    return 'EARLIER';
  };

  const groupedNotifications = visibleNotifications.reduce((groups: { title: string; items: any[] }[], notification: any) => {
    const title = notificationGroup(notification);
    const group = groups.find((item) => item.title === title);
    if (group) group.items.push(notification);
    else groups.push({ title, items: [notification] });
    return groups;
  }, []).sort((a, b) => ['TODAY', 'YESTERDAY', 'EARLIER'].indexOf(a.title) - ['TODAY', 'YESTERDAY', 'EARLIER'].indexOf(b.title));

  return (
    <Sheet
      visible
      onClose={closeSheet}
      title="Notifications"
      sub="Campaign and account updates"
      footer={
        <Row style={{ gap: 8 }}>
          <Btn
            label="Mark all read"
            variant="outline"
            flex
            disabled={!unreadCount}
            onPress={async () => {
              try {
                await readAllNotifications();
              } catch (error) {
                showToast(error instanceof Error ? error.message : 'Unable to mark notifications read.');
              }
            }}
          />
          <Btn label="Close" flex onPress={closeSheet} />
        </Row>
      }
    >
      <Row style={{ gap: 8 }}>
        {([
          ['all', `All · ${notifications.length}`],
          ['unread', `Unread · ${unreadCount}`],
        ] as ['all' | 'unread', string][]).map(([key, label]) => {
          const active = filter === key;
          return (
            <Pressable
              key={key}
              onPress={() => setFilter(key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={{
                minHeight: 40,
                paddingHorizontal: 13,
                borderRadius: 13,
                borderWidth: 1,
                borderColor: active ? C.text : C.border2,
                backgroundColor: active ? C.text : C.surface,
                justifyContent: 'center',
              }}
            >
              <Row style={{ gap: 5 }}>
                {active ? <Ionicons name="checkmark" size={14} color={C.onDark} /> : null}
                <T size={12} w="semi" color={active ? C.onDark : C.text}>{label}</T>
              </Row>
            </Pressable>
          );
        })}
      </Row>
      {visibleNotifications.length ? (
        <View style={{ gap: 12 }}>
          {groupedNotifications.map((group) => (
            <View key={group.title} style={{ gap: 2 }}>
              <T size={11} w="bold" track={0.8} color={C.muted2} style={{ paddingVertical: 6 }}>{group.title}</T>
              {group.items.map((notification: any, index: number) => {
                const isRead = notification.read || notification.isRead;
                const title = notification.title;
                const body = notification.text || notification.message || (title ? '' : 'Notification update');
                return (
                  <Pressable
                    key={notification.id}
                    onPress={async () => {
                      if (isRead) return;
                      try {
                        await readNotification(String(notification.id));
                      } catch (error) {
                        showToast(error instanceof Error ? error.message : 'Unable to mark notification read.');
                      }
                    }}
                    accessibilityRole="button"
                  >
                    <Row style={{
                      alignItems: 'flex-start',
                      gap: 11,
                      paddingVertical: 12,
                      paddingHorizontal: 2,
                      borderBottomWidth: index < group.items.length - 1 ? 1 : 0,
                      borderBottomColor: C.borderSubtle,
                      backgroundColor: isRead ? 'transparent' : C.surfaceSubtle,
                    }}>
                      <View style={{
                        width: 38,
                        height: 38,
                        borderRadius: 13,
                        backgroundColor: isRead ? C.surfaceSoft : C.primaryLight,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Ionicons name="notifications-outline" size={18} color={isRead ? C.muted : C.primary} />
                      </View>
                      <View style={{ flex: 1, gap: 4 }}>
                        {title ? <T size={13} w="semi" color={C.text}>{title}</T> : null}
                        {body ? <T size={12} color={C.textSecondary} style={{ lineHeight: 18 }}>{body}</T> : null}
                        <Row style={{ gap: 6 }}>
                          {!isRead ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary }} /> : null}
                          <T size={10.5} color={C.muted}>{notificationDate(notification)}</T>
                        </Row>
                      </View>
                    </Row>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      ) : (
        <Card style={{ alignItems: 'center', gap: 8, paddingVertical: 24 }}>
          <Ionicons name={filter === 'unread' ? 'checkmark-done-outline' : 'notifications-off-outline'} size={25} color={C.muted} />
          <T size={13} w="semi" color={C.text}>{filter === 'unread' ? 'You’re all caught up' : 'No notifications yet'}</T>
          <T size={11} color={C.muted} style={{ textAlign: 'center' }}>
            {filter === 'unread' ? 'Unread updates will appear here.' : 'New campaign updates will appear here.'}
          </T>
        </Card>
      )}
      {unreadCount === 0 && notifications.length ? (
        <T size={10.5} color={C.muted} style={{ textAlign: 'center' }}>You’re all caught up.</T>
      ) : null}
    </Sheet>
  );
}
