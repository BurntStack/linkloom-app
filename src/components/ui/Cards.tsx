import React from 'react';
import { View, Pressable, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, shadow, shadowSm, inr } from '../../theme';
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
        minHeight: width > 320 ? 0 : 180,
        padding: width > 320 ? 18 : 14,
        gap: width > 320 ? 14 : 9,
        backgroundColor: C.surface,
        borderRadius: width > 320 ? 24 : 20,
        borderWidth: 1,
        borderColor: C.border,
        transform: [{ scale: pressed ? 0.985 : 1 }],
        ...shadowSm,
      })}
    >
      {width > 320 ? (
        <>
          <Row style={{ gap: 14, alignItems: 'center' }}>
            <Avatar name={c.name} size={54} photo={c.photo} verified={c.verified} />
            <View style={{ flex: 1, gap: 4 }}>
              <Row style={{ gap: 6, alignItems: 'center' }}>
                <T size={16} w="semi" color={C.text} numberOfLines={1}>{c.name}</T>
                {c.verified ? <Ionicons name="checkmark-circle" size={15} color={C.blue} /> : null}
              </Row>
              <T size={12.5} color={C.muted2} numberOfLines={1}>
                {c.platform} · {c.city}
              </T>
              {showBadge && c.badge ? (
                <View style={{ alignSelf: 'flex-start', borderRadius: 99, backgroundColor: C.greenBg, paddingHorizontal: 9, paddingVertical: 3 }}>
                  <T size={11} w="semi" color={C.green}>{c.badge}</T>
                </View>
              ) : null}
            </View>
          </Row>

          <Row style={{ justifyContent: 'space-between', backgroundColor: C.surfaceSoft, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14 }}>
            {[
              [c.followers, 'Followers'],
              [c.eng, 'Engagement'],
              [c.rating.toFixed(1), 'Rating'],
            ].map(([value, label], index) => (
              <View key={label} style={{ gap: 2, alignItems: 'center' }}>
                <Row style={{ gap: 4, alignItems: 'center' }}>
                  {index === 0 ? <Ionicons name={c.platform === 'YouTube' ? 'logo-youtube' : 'logo-instagram'} size={12} color={C.text} /> : null}
                  {index === 2 ? <Ionicons name="star" size={12} color={C.amber} /> : null}
                  <T size={13.5} w="semi" color={C.text}>{value}</T>
                </Row>
                <T size={10.5} color={C.muted2}>{label}</T>
              </View>
            ))}
          </Row>

          <Row style={{ justifyContent: 'space-between', alignItems: 'center', paddingTop: 2 }}>
            <View style={{ gap: 2 }}>
              <T size={11} color={C.muted2}>Starting from</T>
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
                style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: isSaved ? C.pinkBg : C.surfaceSoft, alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={18} color={isSaved ? C.pink : C.text} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={onPress}
                style={{ backgroundColor: C.dark, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 16 }}
              >
                <T size={12.5} w="semi" color={C.onDark}>View profile</T>
              </Pressable>
            </Row>
          </Row>
        </>
      ) : (
        <>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Avatar name={c.name} size={42} photo={c.photo} verified={c.verified} />
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
              style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: isSaved ? C.pinkBg : C.surfaceSoft, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={16} color={isSaved ? C.pink : C.muted2} />
            </Pressable>
          </Row>

          <View style={{ gap: 3 }}>
            <Row style={{ alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
              <T size={13.5} w="semi" color={C.text} numberOfLines={1} style={{ flex: 1 }}>{c.name}</T>
              <Row style={{ gap: 2, alignItems: 'center' }}>
                <Ionicons name="star" size={11} color={C.amber} />
                <T size={11} w="semi" color={C.text}>{c.rating.toFixed(1)}</T>
              </Row>
            </Row>
            <Row style={{ gap: 4, alignItems: 'center' }}>
              <Ionicons name={c.platform === 'YouTube' ? 'logo-youtube' : 'logo-instagram'} size={11} color={c.platform === 'YouTube' ? C.red : C.primary} />
              <T size={11} color={C.muted2} numberOfLines={1}>{c.cat} · {c.followers}</T>
            </Row>
          </View>

          <View style={{ paddingTop: 2 }}>
            <T size={13.5} w="bold" color={C.primary}>From {inr(c.price)}</T>
          </View>
        </>
      )}
    </Pressable>
  );
}
