import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { C } from '../../theme';
import { useApp } from '../../store';
import { Avatar, Btn, Card, Field, Heading, Row, T } from '../../components/ui';
import { Creator } from '../../data';
import { Page } from './PageLayout';

export function CreatorListDetail({ navigation, route }: any) {
  const { loadList, renameList, removeList, unsaveCreator, loadPublicCreator, showToast } = useApp();
  const listId = String(route.params?.listId || '');
  const [list, setList] = useState<any>(null);
  const [members, setMembers] = useState<Creator[]>([]);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    loadList(listId).then(async (result: any) => {
      if (!active) return;
      setList(result);
      setName(result.name || '');
      const rawMembers = result.creators || result.creatorIds || result.creator_ids || [];
      const profiles = await Promise.all(rawMembers.map((member: any) => {
        const id = String(typeof member === 'object' ? member.id ?? member.creatorId ?? member.creator_id : member);
        return typeof member === 'object' && (member.displayName || member.display_name || member.name)
          ? Promise.resolve(member as Creator)
          : loadPublicCreator(id);
      }));
      if (active) setMembers(profiles as Creator[]);
    }).catch((error: unknown) => {
      if (active) showToast(error instanceof Error ? error.message : 'Unable to load shortlist.');
    });
    return () => { active = false; };
  }, [listId]);

  const saveName = async () => {
    if (!name.trim()) return showToast('Enter a list name.');
    setSaving(true);
    try {
      const updated = await renameList(listId, name.trim());
      setList(updated);
      showToast('List renamed.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to rename list.');
    } finally {
      setSaving(false);
    }
  };

  if (!list) return <Page title="Shortlist" navigation={navigation}><T size={12} color={C.muted}>Loading shortlist…</T></Page>;

  return (
    <Page title={list.name || 'Shortlist'} navigation={navigation}>
      <Field label="List name" value={name} onChangeText={setName} />
      <Row style={{ gap: 8 }}>
        <Btn label="Save name" flex disabled={saving} onPress={saveName} />
        <Btn
          label="Delete list"
          variant="danger"
          flex
          disabled={saving}
          onPress={async () => {
            setSaving(true);
            try {
              await removeList(listId);
              navigation.goBack();
              showToast('List deleted.');
            } catch (error) {
              showToast(error instanceof Error ? error.message : 'Unable to delete list.');
            } finally {
              setSaving(false);
            }
          }}
        />
      </Row>
      <Heading title={`Creators (${members.length})`} />
      {members.map((creator) => (
        <Card key={creator.id} style={{ gap: 8 }}>
          <Row style={{ gap: 8, alignItems: 'center' }}>
            <Avatar name={creator.name} photo={creator.photo} size={38} />
            <View style={{ flex: 1 }}>
              <T size={13} w="bold" color={C.text}>{creator.name}</T>
              <T size={11} color={C.muted}>{creator.city} · {creator.cat}</T>
            </View>
            <Btn
              label="Remove"
              variant="outline"
              small
              onPress={async () => {
                try {
                  await unsaveCreator(creator.id, listId);
                  setMembers((previous) => previous.filter((item) => item.id !== creator.id));
                } catch (error) {
                  showToast(error instanceof Error ? error.message : 'Unable to remove creator.');
                }
              }}
            />
          </Row>
        </Card>
      ))}
    </Page>
  );
}
