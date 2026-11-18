import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Avatar, Btn, Card, Field, Heading, Row, Select, StackHeader, T } from '../../../components/ui';
import { CATEGORIES, CreatorAccountProfile } from '../../../data';
import { C, TYPO } from '../../../theme';
import { useApp } from '../../../store';
import { uploadCreatorAvatar } from '../../../api';

export function CreatorSetup({ navigation, route }: any) {
  const { creatorProfile, setCreatorProfile, findCreatorProfile, login, saveCreatorOnboarding, initializeWorkspace, sessionUser, showToast } = useApp();
  const editing = Boolean(route.params?.edit);
  const [email] = useState(creatorProfile?.email || route.params?.user?.email || '');
  const [phone] = useState(creatorProfile?.mobile || route.params?.phone || route.params?.user?.phone || '');
  const current = creatorProfile?.email?.toLowerCase() === email.toLowerCase()
    ? creatorProfile
    : findCreatorProfile(email);
  const [name, setName] = useState(current?.name || route.params?.initialName || '');
  const [photoUrl, setPhotoUrl] = useState(current?.photoUrl || '');
  const [photoFile, setPhotoFile] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [mobile, setMobile] = useState(current?.mobile || '');
  const [dateOfBirth, setDateOfBirth] = useState(current?.dateOfBirth || '');
  const [gender, setGender] = useState(current?.gender || 'Prefer not to say');
  const [city, setCity] = useState(current?.city || '');
  const [languagesText, setLanguagesText] = useState(current?.languages.join(', ') || '');
  const [categoriesText, setCategoriesText] = useState((current?.categories || []).join(', '));
  const [primaryPlatform, setPrimaryPlatform] = useState(current?.platforms[0]?.name || 'Instagram');
  const [repliesWithin, setRepliesWithin] = useState(String(current?.repliesWithin || 24));
  const [bio, setBio] = useState(current?.bio || '');
  const [instagram, setInstagram] = useState(current?.platforms.find((item) => item.name === 'Instagram')?.handle || '');
  const [youtube, setYoutube] = useState(current?.platforms.find((item) => item.name === 'YouTube')?.handle || '');
  const [other, setOther] = useState(current?.platforms.find((item) => item.name === 'Other')?.handle || '');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const datePickerValue = (() => {
    const [year, month, day] = dateOfBirth.split('-').map(Number);
    if (year && month && day) {
      const date = new Date(year, month - 1, day);
      if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) return date;
    }
    return new Date();
  })();

  const handleDateChange = (_event: unknown, selectedDate: Date) => {
    setShowDatePicker(false);
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    setDateOfBirth(`${year}-${month}-${day}`);
  };

  const choosePhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToast('Allow photo library access to choose a profile photo.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!result.canceled) {
        const asset = result.assets[0];
        const extension = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
        setPhotoFile({
          uri: asset.uri,
          name: asset.fileName || `creator-avatar.${extension}`,
          type: asset.mimeType || `image/${extension === 'jpg' ? 'jpeg' : extension}`,
        });
        setPhotoUrl(asset.uri);
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to open your photo library.');
    }
  };

  const save = async () => {
    if (name.trim().length < 2) return showToast('Enter your display name');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) return showToast('Enter your date of birth as YYYY-MM-DD');
    const [year, month, day] = dateOfBirth.split('-').map(Number);
    const dob = new Date(Date.UTC(year, month - 1, day));
    if (
      Number.isNaN(dob.getTime()) ||
      dob.getUTCFullYear() !== year ||
      dob.getUTCMonth() !== month - 1 ||
      dob.getUTCDate() !== day
    ) return showToast('Enter a valid date of birth');
    const replyHours = Number(repliesWithin);
    if (!/^\d+$/.test(repliesWithin) || !Number.isSafeInteger(replyHours) || replyHours < 1) {
      return showToast('Enter your typical reply time in whole hours.');
    }
    const today = new Date();
    let age = today.getUTCFullYear() - year;
    if (today.getUTCMonth() < month - 1 || (today.getUTCMonth() === month - 1 && today.getUTCDate() < day)) age -= 1;
    if (age < 18) return showToast('Creators must be 18 or older to continue');

    const profile: CreatorAccountProfile = {
      creatorId: current?.creatorId || route.params?.user?.id || '',
      name: name.trim(), email, mobile: mobile.trim() || phone, dateOfBirth, gender, city: city.trim(), photoUrl: photoUrl.trim(),
      languages: languagesText.split(',').map((value) => value.trim()).filter(Boolean),
      categories: categoriesText.split(',').map((value) => value.trim()).filter(Boolean),
      primaryPlatform,
      repliesWithin: replyHours,
      bio: bio.trim(),
      platforms: [
        { name: 'Instagram', handle: instagram.trim() },
        { name: 'YouTube', handle: youtube.trim() },
        { name: 'Other', handle: other.trim() },
      ].filter((item) => item.handle),
    };
    try {
      let submittedProfile = profile;
      if (photoFile) {
        const uploaded = await uploadCreatorAvatar(photoFile);
        const avatarUrl = uploaded.avatarUrl || uploaded.avatar_url || uploaded.url ||
          uploaded.creator?.avatarUrl || uploaded.creator?.avatar_url;
        if (typeof avatarUrl !== 'string' || !avatarUrl) {
          throw new Error('The server did not return the uploaded profile photo URL.');
        }
        submittedProfile = { ...profile, photoUrl: avatarUrl };
      }
      const saved = await saveCreatorOnboarding(submittedProfile);
      setCreatorProfile(saved);
      if (editing) {
        showToast('Creator profile saved.');
        navigation.goBack();
      } else {
        login('creator', route.params?.user || sessionUser, saved);
        await initializeWorkspace('creator', saved.creatorId);
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to save your creator profile.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {editing ? <StackHeader title="Edit creator profile" onBack={() => navigation.goBack()} /> : null}
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: editing ? 14 : 42, gap: 14, paddingBottom: 34 }} keyboardShouldPersistTaps="handled">
        <View style={{ gap: 5 }}>
          <T size={TYPO.h1} w="bold" color={C.text}>{editing ? 'Edit your profile' : 'Build your creator profile'}</T>
          <T size={13} color={C.muted}>Add public-safe details so campaigns can find the right fit.</T>
        </View>
        <Field label="Display name *" value={name} onChangeText={setName} placeholder="Your creator name" />
        <Card style={{ alignItems: 'center', gap: 10 }}>
          <Avatar name={name || 'Creator'} size={76} photo={photoUrl ? { uri: photoUrl } : undefined} />
          <Row style={{ gap: 8 }}>
            <Btn label="Choose photo" icon="image-outline" onPress={choosePhoto} variant="outline" />
            {photoUrl ? <Btn label="Remove" icon="close-outline" onPress={() => { setPhotoUrl(''); setPhotoFile(null); }} variant="ghost" /> : null}
          </Row>
          <Field
            label="Or enter a photo URL"
            value={photoUrl.startsWith('http') ? photoUrl : ''}
            onChangeText={(value) => { setPhotoUrl(value); setPhotoFile(null); }}
            placeholder="https://…"
            keyboardType="url"
          />
        </Card>
        <Heading title="Personal details" sub="These details help complete your creator profile." />
        <Field label="Mobile number" value={phone || mobile} onChangeText={setMobile} placeholder="+91…" keyboardType="phone-pad" />
        <View style={{ gap: 5 }}>
          <T size={13} w="semi" color={C.textSecondary}>Date of birth *</T>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            accessibilityRole="button"
            accessibilityLabel="Choose date of birth"
            style={{
              minHeight: 52,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 12,
              borderWidth: 1.2,
              borderColor: C.border,
              borderRadius: 13,
              backgroundColor: C.surfaceSubtle,
            }}
          >
            <T size={14} color={dateOfBirth ? C.text : C.muted3}>{dateOfBirth || 'YYYY-MM-DD'}</T>
            <Ionicons name="calendar-outline" size={20} color={C.primary} />
          </Pressable>
          {showDatePicker ? (
            <DateTimePicker
              value={datePickerValue}
              mode="date"
              display={Platform.OS === 'ios' ? 'compact' : 'calendar'}
              maximumDate={new Date()}
              startOnYearSelection={Platform.OS === 'android'}
              onValueChange={handleDateChange}
              onDismiss={() => setShowDatePicker(false)}
            />
          ) : null}
          <T size={11} color={C.muted}>Select a year first, then choose the month and day.</T>
        </View>
        <Select label="Gender (optional)" value={gender} options={['Prefer not to say', 'Woman', 'Man', 'Non-binary', 'Self-describe']} onChange={setGender} />
        <Heading title="About your content" sub="Help brands find creators who fit their campaign." />
        <Field label="City / region" value={city} onChangeText={setCity} placeholder="City (not your home address)" />
        <Field label="Languages (comma-separated)" value={languagesText} onChangeText={setLanguagesText} placeholder="English, Hindi" />
        <Field label="Categories (comma-separated)" value={categoriesText} onChangeText={setCategoriesText} placeholder={CATEGORIES.slice(0, 3).join(', ')} />
        <Select label="Primary platform" value={primaryPlatform} options={['Instagram', 'YouTube', 'TikTok', 'Other']} onChange={setPrimaryPlatform} />
        <Field
          label="Typical reply time (hours)"
          value={repliesWithin}
          onChangeText={(value) => setRepliesWithin(value.replace(/\D/g, ''))}
          placeholder="24"
          keyboardType="number-pad"
        />
        <Field label="About you" value={bio} onChangeText={setBio} placeholder="Tell campaigns about your content and audience." multiline maxLength={500} />
        <Heading title="Social profiles" sub="Add the handles you want to show to brands." />
        <Field label="Instagram handle or URL" value={instagram} onChangeText={setInstagram} placeholder="@yourhandle or https://…" />
        <Field label="YouTube handle or URL" value={youtube} onChangeText={setYoutube} placeholder="@yourchannel or https://…" />
        <Field label="Other platform" value={other} onChangeText={setOther} placeholder="TikTok, LinkedIn, etc." />
        <T size={11} color={C.muted}>Profile photo selection is ready; backend upload will be enabled once the API endpoint is provided. KYC details are handled separately.</T>
        <Btn label={editing ? 'Save profile' : 'Save and open creator workspace'} onPress={save} />
      </ScrollView>
    </View>
  );
}
