import React from 'react';
import { View, Pressable, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, shadow, inr } from '../../theme';
import { Creator } from '../../data';
import { useApp } from '../../store';
import { T } from './Typography';
import { Avatar } from './Avatar';
import { Row } from './Layout';

export function useGridWidth() {
  const { width } = useWindowDimensions();
  return (width - 52) / 2;
}

export function CreatorCard({
  c,
  width,
  onPress,
  showBadge = true,
}: {
  c: Creator;
  width: number;
  onPress: () => void;
  showBadge?: boolean;
}) {
  const { saved, saveCreator, unsaveCreator, loggedIn, showToast } = useApp();
  const isSaved = saved.includes(c.id);

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: C.ripple, borderless: false }}
      style={({ pressed }) => ({
        width,
        minHeight: width > 320 ? 0 : 174,
        padding: width > 320 ? 15 : 12,
        gap: width > 320 ? 12 : 7,
        backgroundColor: C.surface,
        borderRadius: width > 320 ? 22 : 18,
        borderWidth: 1,
        borderColor: C.border,
        transform: [{ scale: pressed ? 0.98 : 1 }],
        ...shadow,
      })}
    >
      {width > 320 ? (
        <>
          <Row style={{ gap: 12, alignItems: 'center' }}>
            <Avatar name={c.name} size={52} photo={c.photo} />
            <View style={{ flex: 1, gap: 3 }}>
              <Row style={{ gap: 5, alignItems: 'center' }}>
                <T size={15} w="semi" color={C.text} numberOfLines={1}>{c.name}</T>
                <Ionicons name="checkmark-circle" size={15} color={C.blue} />
              </Row>
              <T size={12} color={C.muted2} numberOfLines={1}>
                {c.platform} · {c.city}
              </T>
              <View style={{ alignSelf: 'flex-start', borderRadius: 99, backgroundColor: C.greenBg, paddingHorizontal: 9, paddingVertical: 3 }}>
                <T size={10.5} w="semi" color={C.green}>{c.badge || 'Open to work'}</T>
              </View>
            </View>
          </Row>
          <View style={{ height: 1, backgroundColor: C.border, marginVertical: 1 }} />
          <Row style={{ justifyContent: 'space-between' }}>
            {[
              [c.followers, 'Followers'],
              [c.eng, 'Engagement'],
              [c.rating.toFixed(1), 'Rating'],
            ].map(([value, label], index) => (
              <View key={label} style={{ gap: 3 }}>
                <Row style={{ gap: 4, alignItems: 'center' }}>
                  {index === 0 ? <Ionicons name={c.platform === 'YouTube' ? 'logo-youtube' : 'logo-instagram'} size={13} color={C.text} /> : null}
                  {index === 2 ? <Ionicons name="star" size={13} color={C.amber} /> : null}
                  <T size={14} w="semi" color={C.text}>{value}</T>
                </Row>
                <T size={11} color={C.muted2}>{label}</T>
              </View>
            ))}
          </Row>
          <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ gap: 2 }}>
              <T size={11} color={C.muted2}>Reel from</T>
              <T size={18} w="bold" color={C.text}>{inr(c.price)}</T>
            </View>
            <Row style={{ gap: 8, alignItems: 'center' }}>
              <Pressable
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={isSaved ? `Remove ${c.name} from saved` : `Save ${c.name}`}
                onPress={async () => {
                  if (!loggedIn) return onPress();
                  try {
                    if (isSaved) await unsaveCreator(c.id);
                    else await saveCreator(c.id);
                  } catch (error) {
                    showToast(error instanceof Error ? error.message : 'Unable to update shortlist.');
                  }
                }}
                style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: isSaved ? C.pinkBg : C.surface, borderWidth: 1, borderColor: C.border2, alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={19} color={isSaved ? C.pink : C.text} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={onPress}
                style={{ borderWidth: 1, borderColor: C.border2, borderRadius: 22, paddingVertical: 10, paddingHorizontal: 15 }}
              >
                <T size={12} w="semi" color={C.text}>View profile</T>
              </Pressable>
            </Row>
          </Row>
        </>
      ) : (
        <>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Avatar name={c.name} size={38} photo={c.photo} verified />
            <Pressable
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={isSaved ? `Remove ${c.name} from saved` : `Save ${c.name}`}
              onPress={async () => {
                if (!loggedIn) return onPress();
                try {
                  if (isSaved) await unsaveCreator(c.id);
                  else await saveCreator(c.id);
                } catch (error) {
                  showToast(error instanceof Error ? error.message : 'Unable to update shortlist.');
                }
              }}
              style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: isSaved ? C.pinkBg : C.surfaceSubtle, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={17} color={isSaved ? C.pink : C.muted} />
            </Pressable>
          </Row>
          <View style={{ gap: 4 }}>
            <Row style={{ alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
              <T size={13} w="semi" color={C.text} numberOfLines={1} style={{ flex: 1 }}>{c.name}</T>
              <Row style={{ gap: 2, alignItems: 'center' }}>
                <Ionicons name="star" size={11} color={C.gold} />
                <T size={11} w="bold" color={C.amber}>{c.rating.toFixed(1)}</T>
              </Row>
            </Row>
            <Row style={{ gap: 4, alignItems: 'center' }}>
              <Ionicons name={c.platform === 'YouTube' ? 'logo-youtube' : 'logo-instagram'} size={11} color={c.platform === 'YouTube' ? C.red : C.primary} />
              <T size={10} w="med" color={C.muted2} numberOfLines={1}>{c.cat} · {c.followers}</T>
            </Row>
          </View>
          <T size={14} w="bold" color={C.primary}>From {inr(c.price)}</T>
          {showBadge && c.badge ? (
            <View style={{ alignSelf: 'flex-start', borderRadius: 6, backgroundColor: C.greenBg, paddingHorizontal: 6, paddingVertical: 2.5 }}>
              <T size={9.5} w="semi" color={C.green}>{c.badge}</T>
            </View>
          ) : null}
        </>
      )}
    </Pressable>
  );
}
