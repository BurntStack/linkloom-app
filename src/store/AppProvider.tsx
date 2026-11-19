import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { CommonActions } from '@react-navigation/native';
import { CREATORS, JOBS, LISTS, ORDERS, Creator, CreatorAccountProfile, Job, Bid } from '../data';
import {
  addCreatorToList,
  addCartItem,
  ApiError,
  approveOrder as approveOrderRequest,
  cancelOrder as cancelOrderRequest,
  checkoutCart,
  createCampaign,
  createList,
  closeCampaign,
  createCreatorPackage,
  createOffer,
  deleteCreatorPackage,
  deleteList,
  disputeOrder as disputeOrderRequest,
  getCart,
  getBrandProfile,
  getCampaignBids,
  getCampaign,
  getCampaigns,
  getConversations,
  getConversationMessages,
  getCreator,
  getCreatorCampaigns,
  getCreatorOffers,
  getCreatorPackages,
  getCreatorReviews,
  getCreatorOrders,
  getCreatorProfile,
  getCurrentUser,
  getList,
  getLists,
  getKycStatus,
  getOffers,
  getOrder,
  getOrderDeliverables,
  hasSavedSession,
  listCreators,
  markAllNotificationsRead,
  markNotificationRead,
  getNotifications,
  getOrders,
  getUnreadNotificationCount,
  logout as logoutRequest,
  logoutAll as logoutAllRequest,
  removeCreatorFromList,
  removeCartItem,
  requestOrderRevision,
  respondToOffer,
  reviewOrder as reviewOrderRequest,
  saveBrandProfile,
  saveKycBank,
  saveKycId,
  saveKycPan,
  saveCreatorProfile as saveCreatorProfileRequest,
  sendConversationMessage,
  startConversation as startConversationRequest,
  selectCampaignBid,
  submitOrderDeliverable,
  submitCampaignBid,
  submitKyc as submitKycRequest,
  updateCreatorPackage,
  updateList,
  updateCampaign,
  updateCampaignBid,
  withdrawCampaignBid,
  withdrawOffer,
  uploadKycDocument,
  type AuthRole,
  type BrandOnboarding,
  type KycStatusSnapshot,
  type KycDocumentFile,
  type UsageRights,
} from '../api';
import { Ctx } from './AppContext';
import { navRef } from './navigation';
import { setColorScheme } from '../theme';
import { Sheet, ChatMessage, Conversation } from './types';
import {
  mapCampaign,
  mapBid,
  mapOrder,
  mapDeliverable,
  mapPackage,
  mapOffer,
  listCreatorIds,
  mapBrandProfile,
  mapCreatorProfile,
  mapPublicCreator,
  moneyInRupees,
} from './mappers';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>('system');
  const colorScheme = themeMode === 'system' ? systemColorScheme : themeMode;
  setColorScheme(colorScheme);
  const [loggedIn, setLoggedIn] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [accountRole, setAccountRole] = useState<'brand' | 'creator'>('brand');
  const [brandProfile, setBrandProfile] = useState<BrandOnboarding | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<CreatorAccountProfile | null>(null);
  const [creatorProfilesByEmail, setCreatorProfilesByEmail] = useState<Record<string, CreatorAccountProfile>>({});
  const [creatorBids, setCreatorBids] = useState<any[]>([]);
  const [creatorPackages, setCreatorPackages] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [jobs, setJobs] = useState<Job[]>(JOBS);
  const [creatorSearchResults, setCreatorSearchResults] = useState<Creator[]>([]);
  const [lists, setLists] = useState(LISTS);
  const [saved, setSaved] = useState<string[]>([]);
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [orders, setOrders] = useState(ORDERS);
  const [unread, setUnread] = useState(4);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [kycOpen, setKycOpen] = useState(false);
  const [kycStatus, setKycStatus] = useState<KycStatusSnapshot | null>(null);
  const [kycLoading, setKycLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pendingCreator, setPendingCreator] = useState<string | null>(null);
  const timer = useRef<any>(null);
  const creatorSearchRequest = useRef(0);
  const campaignRefreshInFlight = useRef<Promise<Job[]> | null>(null);
  const creatorSearchInFlight = useRef(new Map<string, Promise<Creator[]>>());

  const showToast = useCallback((m: string) => {
    setToast(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2600);
  }, []);
  useEffect(() => {
    let active = true;
    SecureStore.getItemAsync('brandside.themeMode').then((savedMode) => {
      if (active && (savedMode === 'light' || savedMode === 'dark')) setThemeMode(savedMode);
    }).catch((error) => {
      if (active) showToast(error instanceof Error ? error.message : 'Unable to load saved theme.');
    });
    return () => { active = false; };
  }, [showToast]);
  const toggleColorScheme = async () => {
    const nextMode = colorScheme === 'dark' ? 'light' : 'dark';
    setThemeMode(nextMode);
    try {
      await SecureStore.setItemAsync('brandside.themeMode', nextMode);
    } catch (error) {
      showToast(error instanceof Error ? `Theme changed, but could not save the preference: ${error.message}` : 'Theme changed, but could not save the preference.');
    }
  };
  const openSheet = (type: string, params?: any) => {
    setSheet({ type, params });
  };
  const closeSheet = () => setSheet(null);
  const openKyc = () => setKycOpen(true);
  const closeKyc = () => {
    setKycOpen(false);
  };
  const refreshKycStatus = useCallback(async () => {
    setKycLoading(true);
    try {
      const status = await getKycStatus();
      setKycStatus(status);
      return status;
    } finally {
      setKycLoading(false);
    }
  }, []);
  const submitKyc = async (input: {
    pan?: string;
    nameOnPan?: string;
    idType?: 'aadhaar' | 'passport' | 'driving_licence' | 'voter_id';
    idDocument?: KycDocumentFile;
    accountHolderName?: string;
    accountNumber?: string;
    ifsc?: string;
  }) => {
    try {
      if (input.pan !== undefined && input.nameOnPan !== undefined) {
        await saveKycPan({ pan: input.pan, nameOnPan: input.nameOnPan });
      }
      if (input.idDocument && input.idType) {
        const uploadId = await uploadKycDocument(input.idDocument);
        await saveKycId({ idType: input.idType, uploadId });
      }
      if (
        input.accountHolderName !== undefined &&
        input.accountNumber !== undefined &&
        input.ifsc !== undefined
      ) {
        await saveKycBank({
          accountHolderName: input.accountHolderName,
          accountNumber: input.accountNumber,
          ifsc: input.ifsc,
        });
      }
      await submitKycRequest();
    } catch (error) {
      try {
        await refreshKycStatus();
      } catch (refreshError) {
        throw new Error([
          error instanceof Error ? error.message : 'Unable to save the KYC step.',
          `KYC status refresh also failed: ${refreshError instanceof Error ? refreshError.message : 'unknown error'}`,
        ].join(' '));
      }
      throw error;
    }
    try {
      return await refreshKycStatus();
    } catch (error) {
      throw new Error(`KYC was submitted, but status refresh failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  };
  const handleKycRequired = (error: unknown) => {
    if (!(error instanceof ApiError) || error.code !== 'KYC_REQUIRED') return false;
    openKyc();
    return true;
  };
  const performVerifiedAction = async <T,>(action: string, operation: () => Promise<T>): Promise<T> => {
    if (kycStatus?.status !== 'verified') {
      openKyc();
      throw new ApiError(`Your KYC must be verified before you can ${action}.`, 403, 'KYC_REQUIRED');
    }
    try {
      return await operation();
    } catch (error) {
      await handleKycRequired(error);
      throw error;
    }
  };
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && loggedIn) {
        refreshKycStatus().catch((error: unknown) => {
          showToast(error instanceof Error ? error.message : 'Unable to refresh your KYC status.');
        });
      }
    });
    return () => subscription.remove();
  }, [loggedIn, refreshKycStatus, showToast]);

  const reset = (routes: any[]) =>
    navRef.isReady() && navRef.dispatch(CommonActions.reset({ index: routes.length - 1, routes }));

  const profileSetupRoute = (role: AuthRole, user: any) => role === 'creator'
    ? {
        name: 'CreatorSetup',
        params: {
          initialName: user.fullName || user.full_name || '',
          phone: user.phone || user.mobile || '',
          user,
        },
      }
    : { name: 'Onboarding', params: { user } };

  const login = (role: AuthRole, user?: any, profile?: BrandOnboarding | CreatorAccountProfile) => {
    setLoggedIn(true);
    setAccountRole(role);
    setSessionUser(user || null);
    setKycStatus(null);
    setJobs([]);
    setOrders([]);
    setLists([]);
    setCreatorPackages([]);
    setOffers([]);
    setCart([]);
    setCartId(null);
    setNotifications([]);
    setUnread(0);
    setCreatorBids([]);
    setDeliverables([]);
    setCreatorSearchResults([]);
    setConversations([]);
    setSaved([]);
    if (role === 'brand' && profile) {
      setCreatorProfile(null);
      const brand = profile as BrandOnboarding;
      setBrandProfile(brand);
      setBrandName(brand.brandName);
    } else if (role === 'creator' && profile) {
      setBrandProfile(null);
      setBrandName('');
      setCreatorProfile(profile as CreatorAccountProfile);
    }
    if (pendingCreator && role === 'brand') {
      const id = pendingCreator;
      setPendingCreator(null);
      reset([{ name: 'Main' }, { name: 'CreatorProfile', params: { id } }]);
    } else reset([{ name: role === 'creator' ? 'CreatorMain' : 'Main' }]);
  };
  const saveCreatorProfile = (profile: CreatorAccountProfile | null) => {
    setCreatorProfile(profile);
    if (profile?.email) {
      setCreatorProfilesByEmail((previous) => ({ ...previous, [profile.email.toLowerCase()]: profile }));
    }
  };
  const findCreatorProfile = (email: string) => creatorProfilesByEmail[email.trim().toLowerCase()] || null;
  const submitCreatorBid = async (bid: any) => performVerifiedAction('submit a bid', async () => {
    const response = await submitCampaignBid(bid.jobId, {
        price: bid.price,
        message: bid.proposal,
        deliveryDays: bid.deliveryDays,
    });
    const savedBid = {
      ...mapBid(response.bid || response),
      jobId: bid.jobId,
      jobTitle: bid.jobTitle,
      status: response.status || response.bid?.status || 'Submitted',
    };
    setCreatorBids((previous) => [savedBid, ...previous]);
    await Promise.all([refreshCreatorBids(), refreshCampaigns()]);
    return savedBid;
  });
  const refreshCampaigns = useCallback(() => {
    if (!campaignRefreshInFlight.current) {
      campaignRefreshInFlight.current = (async () => {
        const items: any[] = [];
        const seenCursors = new Set<string>();
        let cursor: string | undefined;
        do {
          const page = await getCampaigns(cursor);
          items.push(...page.items);
          cursor = page.nextCursor;
          if (cursor && seenCursors.has(cursor)) throw new Error('Campaign pagination repeated a cursor.');
          if (cursor) seenCursors.add(cursor);
        } while (cursor);
        const campaigns = items.map(mapCampaign);
        setJobs(campaigns);
        return campaigns;
      })().finally(() => {
        campaignRefreshInFlight.current = null;
      });
    }
    return campaignRefreshInFlight.current;
  }, []);
  const loadCampaignDetail = async (id: string) => {
    const response = await getCampaign(id);
    const campaign = mapCampaign(response.campaign || response);
    setJobs((previous) => previous.map((item) => item.id === campaign.id ? { ...item, ...campaign } : item));
    return campaign;
  };
  const refreshCreatorBids = useCallback(async (creatorId = creatorProfile?.creatorId || '') => {
    const items: any[] = [];
    const seenCursors = new Set<string>();
    let cursor: string | undefined;
    do {
      const page = await getCreatorCampaigns(cursor);
      items.push(...page.items);
      cursor = page.nextCursor;
      if (cursor && seenCursors.has(cursor)) throw new Error('Your bid history repeated a pagination cursor.');
      if (cursor) seenCursors.add(cursor);
    } while (cursor);
    const bids = items.map((item) => {
      const campaign = item.campaign || item.job || item;
      const bidSource = item.bid || item.myBid || item.my_bid || item.proposal || item.application ||
        campaign.myBid || campaign.my_bid || campaign.bid || item;
      const bid = mapBid(bidSource);
      return {
        ...bid,
        creatorId: String(creatorId || bidSource.creatorId || bidSource.creator_id || bidSource.creator?.id || ''),
        jobId: String(
          bidSource.campaignId || bidSource.campaign_id || bidSource.jobId || bidSource.job_id ||
          campaign.id || item.campaignId || item.campaign_id || '',
        ),
        jobTitle: campaign.title || bidSource.campaignTitle || bidSource.campaign_title || bidSource.jobTitle || 'Campaign',
        status: bid.status || 'Submitted',
      };
    });
    setCreatorBids(bids);
    return bids;
  }, [creatorProfile?.creatorId]);
  const refreshCreatorPackages = async () => {
    const items: any[] = [];
    let cursor: string | undefined;
    do {
      const page = await getCreatorPackages(cursor);
      items.push(...page.items);
      cursor = page.nextCursor;
    } while (cursor);
    const packages = items.map(mapPackage);
    setCreatorPackages(packages);
    return packages;
  };
  const refreshOffers = async (role = accountRole) => {
    const items: any[] = [];
    let cursor: string | undefined;
    do {
      const page = role === 'creator' ? await getCreatorOffers(cursor) : await getOffers(cursor);
      items.push(...page.items);
      cursor = page.nextCursor;
    } while (cursor);
    const nextOffers = items.map(mapOffer);
    setOffers(nextOffers);
    return nextOffers;
  };
  const refreshCart = async () => {
    const items: any[] = [];
    let nextCartId: string | undefined;
    let cursor: string | undefined;
    do {
      const page = await getCart(cursor);
      items.push(...page.items);
      nextCartId = page.cartId || nextCartId;
      cursor = page.nextCursor;
    } while (cursor);
    const mapped = items.map((item) => ({
      ...item,
      id: String(item.id),
      packageId: String(item.packageId ?? item.package_id ?? item.package?.id ?? ''),
      title: item.package?.title || item.title || 'Creator package',
      creatorName: item.creator?.displayName || item.creator?.display_name || item.creator?.name || 'Creator',
      brief: item.brief || '',
      price: moneyInRupees(item.package?.price ?? item.price),
    }));
    setCart(mapped);
    setCartId(nextCartId || null);
    return mapped;
  };
  const searchCreators = useCallback((filters: {
    q?: string; category?: string; location?: string; platform?: string; minPrice?: number; maxPrice?: number; verified?: boolean;
  } = {}) => {
    const key = JSON.stringify(filters);
    const existing = creatorSearchInFlight.current.get(key);
    if (existing) return existing;
    const requestId = ++creatorSearchRequest.current;
    const task = (async () => {
      const items: any[] = [];
      const seenCursors = new Set<string>();
      let cursor: string | undefined;
      do {
        const page = await listCreators({ ...filters, cursor });
        items.push(...page.items);
        cursor = page.nextCursor;
        if (cursor && seenCursors.has(cursor)) throw new Error('Creator pagination repeated a cursor.');
        if (cursor) seenCursors.add(cursor);
      } while (cursor);
      const creators = items.map(mapPublicCreator);
      if (requestId === creatorSearchRequest.current) setCreatorSearchResults(creators);
      return creators;
    })().finally(() => {
      creatorSearchInFlight.current.delete(key);
    });
    creatorSearchInFlight.current.set(key, task);
    return task;
  }, []);
  const loadPublicCreator = async (id: string) => mapPublicCreator(await getCreator(id));
  const loadCampaignBids = async (campaignId: string) => {
    const items: any[] = [];
    let cursor: string | undefined;
    do {
      const page = await getCampaignBids(campaignId, cursor);
      items.push(...page.items);
      cursor = page.nextCursor;
    } while (cursor);
    const bids = items.map(mapBid);
    setJobs((previous) => previous.map((job) => job.id === campaignId
      ? { ...job, bids, bidsCount: bids.length }
      : job));
    return bids;
  };
  const loadOrderDetails = async (id: string) => {
    const response = await getOrder(id);
    const order = mapOrder(response.order || response);
    const items: any[] = [];
    let cursor: string | undefined;
    do {
      const page = await getOrderDeliverables(id, cursor);
      items.push(...page.items);
      cursor = page.nextCursor;
    } while (cursor);
    const nextDeliverables = items.map((item) => mapDeliverable(item, order));
    setDeliverables((previous) => [
      ...nextDeliverables,
      ...previous.filter((item: any) => !nextDeliverables.some((next) => next.id === item.id)),
    ]);
    setOrders((previous) => previous.map((item) => item.id === order.id ? order : item));
    return { order, deliverables: nextDeliverables };
  };
  const loadCreatorReviews = async (creatorId: string) => {
    const items: any[] = [];
    let cursor: string | undefined;
    do {
      const page = await getCreatorReviews(creatorId, cursor);
      items.push(...page.items);
      cursor = page.nextCursor;
    } while (cursor);
    return items;
  };
  const readNotification = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((previous) => previous.map((item) => String(item.id) === id ? { ...item, read: true, isRead: true } : item));
    setUnread((previous) => Math.max(0, previous - 1));
  };
  const readAllNotifications = async () => {
    await markAllNotificationsRead();
    setNotifications((previous) => previous.map((item) => ({ ...item, read: true, isRead: true })));
    setUnread(0);
  };
  const refreshOrders = async (role = accountRole) => {
    const items: any[] = [];
    let cursor: string | undefined;
    do {
      const page = role === 'creator' ? await getCreatorOrders(cursor) : await getOrders(cursor);
      items.push(...page.items);
      cursor = page.nextCursor;
    } while (cursor);
    const nextOrders = items.map(mapOrder);
    setOrders(nextOrders);
    return nextOrders;
  };
  const refreshLists = async () => {
    const items: any[] = [];
    let cursor: string | undefined;
    do {
      const page = await getLists(cursor);
      items.push(...page.items);
      cursor = page.nextCursor;
    } while (cursor);
    const nextLists = items.map((item) => ({
      ...item,
      id: String(item.id),
      count: item.count ?? item.creators?.length ?? item.creatorCount ?? item.creator_count ?? 0,
    }));
    setLists(nextLists);
    const details = await Promise.all(nextLists.map(async (list) => {
      if (list.creators || list.creatorIds || list.creator_ids) return list;
      const response = await getList(list.id);
      return response.list || response;
    }));
    setSaved(Array.from(new Set(details.flatMap(listCreatorIds))));
    return nextLists;
  };
  const loadList = async (id: string) => {
    const response = await getList(id);
    return response.list || response;
  };
  const renameList = async (id: string, name: string) => {
    const response = await updateList(id, name);
    const updated = response.list || response;
    setLists((previous) => previous.map((item) => item.id === id ? { ...item, ...updated, name: updated.name || name } : item));
    return updated;
  };
  const removeList = async (id: string) => {
    await deleteList(id);
    setLists((previous) => previous.filter((item) => item.id !== id));
    await refreshLists();
  };
  const saveCreator = async (creatorId: string, listId?: string) => {
    if (!listId) {
      openSheet('savetolist', { creatorId });
      return;
    }
    await addCreatorToList(listId, creatorId);
    setSaved((previous) => previous.includes(creatorId) ? previous : [...previous, creatorId]);
    await refreshLists();
    showToast('Creator saved to shortlist.');
  };
  const unsaveCreator = async (creatorId: string, listId?: string) => {
    const details = await Promise.all(lists.map(async (list) => {
      const response = await getList(list.id);
      return { id: list.id, creatorIds: listCreatorIds(response.list || response) };
    }));
    const containingLists = details.filter((list) => list.creatorIds.includes(creatorId) && (!listId || list.id === listId));
    await Promise.all(containingLists.map((list) => removeCreatorFromList(list.id, creatorId)));
    await refreshLists();
    const remainsSaved = details.some((list) => !containingLists.some((removed) => removed.id === list.id) && list.creatorIds.includes(creatorId));
    if (!remainsSaved) setSaved((previous) => previous.filter((id) => id !== creatorId));
  };
  const createPackage = async (input: {
    title: string; description: string; platform: string; deliverables: string; price: number; deliveryDays: number;
  }) => {
    const response = await createCreatorPackage(input);
    const savedPackage = mapPackage(response.package || response);
    setCreatorPackages((previous) => [savedPackage, ...previous.filter((item) => item.id !== savedPackage.id)]);
    return savedPackage;
  };
  const updatePackage = async (id: string, input: Partial<{
    title: string; description: string; platform: string; deliverables: string; price: number; deliveryDays: number;
  }>) => {
    const response = await updateCreatorPackage(id, input);
    const updated = mapPackage(response.package || response);
    setCreatorPackages((previous) => previous.map((item) => item.id === id ? { ...item, ...updated } : item));
    return updated;
  };
  const removePackage = async (id: string) => {
    await deleteCreatorPackage(id);
    setCreatorPackages((previous) => previous.filter((item) => item.id !== id));
  };
  const sendOffer = async (input: {
    creatorId: string; deliverable: string; budget: number; deadline: string; message: string; usageRights: UsageRights;
  }) => performVerifiedAction('send an offer', async () => {
    const response = await createOffer(input);
    const offer = mapOffer(response.offer || response);
    setOffers((previous) => [offer, ...previous.filter((item) => item.id !== offer.id)]);
    return offer;
  });
  const respondOffer = async (id: string, status: 'accepted' | 'rejected') => {
    const response = await respondToOffer(id, status);
    const updated = mapOffer(response.offer || response);
    setOffers((previous) => previous.map((item) => item.id === id ? { ...item, ...updated, status } : item));
    return updated;
  };
  const withdrawCreatorOffer = async (id: string) => {
    await withdrawOffer(id);
    setOffers((previous) => previous.map((item) => item.id === id ? { ...item, status: 'withdrawn' } : item));
  };
  const addPackageToCart = async (packageId: string, brief: string) => {
    const response = await addCartItem(packageId, brief);
    await refreshCart();
    return response;
  };
  const removeCartEntry = async (id: string) => {
    await removeCartItem(id);
    setCart((previous) => previous.filter((item) => String(item.id) !== id));
  };
  const checkout = async () => performVerifiedAction('check out', async () => {
    if (!cartId) throw new Error('The server did not return a cart ID. Refresh the cart and try again.');
    return checkoutCart(cartId);
  });
  const submitDeliverable = async (id: string, contentUrl: string, note: string) => {
    const response = await submitOrderDeliverable(id, contentUrl, note);
    await Promise.all([loadOrderDetails(id), refreshOrders()]);
    return response;
  };
  const cancelOrder = async (id: string, reason: string) => {
    const response = await cancelOrderRequest(id, reason);
    await refreshOrders();
    return response;
  };
  const disputeOrder = async (id: string, reason: string) => {
    const response = await disputeOrderRequest(id, reason);
    await refreshOrders();
    return response;
  };
  const reviewOrder = async (id: string, stars: number, text: string) => {
    const response = await reviewOrderRequest(id, stars, text);
    await refreshOrders();
    return response;
  };
  const refreshNotifications = async () => {
    const [items, count] = await Promise.all([
      (async () => {
        const all: any[] = [];
        let cursor: string | undefined;
        do {
          const page = await getNotifications(cursor);
          all.push(...page.items);
          cursor = page.nextCursor;
        } while (cursor);
        return all;
      })(),
      getUnreadNotificationCount(),
    ]);
    setNotifications(items);
    setUnread(count?.count ?? count?.unreadCount ?? 0);
    return items;
  };
  const mapConversationRecord = (record: any): Conversation => {
    const conversation = record.conversation || record;
    const creator = conversation.creator || {};
    const messages = Array.isArray(conversation.messages)
      ? conversation.messages
      : conversation.latestMessage || conversation.latest_message
        ? [conversation.latestMessage || conversation.latest_message]
        : [];
    return {
      id: String(conversation.id || conversation.conversationId || conversation.conversation_id || ''),
      creatorId: String(conversation.creatorId || conversation.creator_id || creator.id || ''),
      creatorName: creator.displayName || creator.display_name || creator.name || conversation.creatorName || conversation.creator_name || 'Creator',
      creatorPhotoUrl: creator.avatarUrl || creator.avatar_url || conversation.creatorPhotoUrl || conversation.creator_photo_url,
      brandName: conversation.brand?.name || conversation.brandName || conversation.brand_name || brandName,
      jobId: String(conversation.orderId || conversation.order_id || conversation.campaignId || conversation.campaign_id || ''),
      jobTitle: conversation.order?.title || conversation.campaign?.title || conversation.jobTitle || conversation.job_title || '',
      messages: messages.map((message: any, index: number) => {
        const senderObject = typeof message.sender === 'object' && message.sender ? message.sender : {};
        const senderValue = String(senderObject.role || message.senderRole || message.sender_role || message.sender || '').toLowerCase();
        const ownMessage = String(message.senderId || message.sender_id || senderObject.id || '') === String(sessionUser?.id || '');
        const sender: ChatMessage['sender'] = senderValue.includes('creator')
          ? 'creator'
          : senderValue.includes('brand')
            ? 'brand'
            : ownMessage
              ? accountRole
              : accountRole === 'brand' ? 'creator' : 'brand';
        return {
          id: String(message.id || message.messageId || message.message_id || `${conversation.id}-${index}`),
          sender,
          text: String(message.content || message.text || message.message || ''),
          sentAt: message.createdAt || message.created_at || message.sentAt || message.sent_at || '',
        };
      }),
    };
  };
  const refreshConversations = async () => {
    const items: any[] = [];
    const seenCursors = new Set<string>();
    let cursor: string | undefined;
    do {
      const page = await getConversations(cursor);
      items.push(...page.items);
      cursor = page.nextCursor;
      if (cursor && seenCursors.has(cursor)) throw new Error('Conversation pagination repeated a cursor.');
      if (cursor) seenCursors.add(cursor);
    } while (cursor);
    const conversations = items.map(mapConversationRecord);
    setConversations(conversations);
    return conversations;
  };
  const loadConversationMessages = async (id: string) => {
    const items: any[] = [];
    let cursor: string | undefined;
    do {
      const page = await getConversationMessages(id, cursor);
      items.push(...page.items);
      cursor = page.nextCursor;
    } while (cursor);
    const messages = mapConversationRecord({ id, messages: items }).messages;
    setConversations((previous) => previous.map((item) => item.id === id ? { ...item, messages } : item));
    return messages;
  };
  const initializeWorkspace = async (role: AuthRole = accountRole, creatorId?: string) => {
    const tasks = role === 'creator'
      ? [refreshKycStatus(), refreshCampaigns(), refreshCreatorBids(creatorId), refreshOrders(role), refreshCreatorPackages(), refreshOffers(role), refreshNotifications(), refreshConversations()]
      : [refreshKycStatus(), refreshCampaigns(), refreshOrders(role), refreshLists(), refreshNotifications(), searchCreators(), refreshOffers(role), refreshCart(), refreshConversations()];
    const results = await Promise.allSettled(tasks);
    const kycFailure = results.find((result) => result.status === 'rejected' &&
      result.reason instanceof ApiError && result.reason.code === 'KYC_REQUIRED');
    if (kycFailure?.status === 'rejected') {
      handleKycRequired(kycFailure.reason);
      return;
    }
    const failed = results.find((result) => result.status === 'rejected');
    if (failed?.status === 'rejected') {
      showToast(failed.reason instanceof Error ? failed.reason.message : 'Some workspace data could not be loaded.');
    }
  };
  const loadBrandProfile = async () => mapBrandProfile(await getBrandProfile());
  const loadCreatorProfile = async () => mapCreatorProfile(await getCreatorProfile());
  const saveBrandOnboarding = async (profile: BrandOnboarding) => {
    const response = await saveBrandProfile({
      name: profile.brandName,
      ...(profile.brandWebsite ? { website: profile.brandWebsite } : {}),
      ...(profile.businessCategory ? { industry: profile.businessCategory } : {}),
      ...(profile.legalName ? { legalName: profile.legalName } : {}),
      ...(profile.gstin ? { gstin: profile.gstin } : {}),
      ...(profile.stateCode ? { stateCode: profile.stateCode } : {}),
      ...(profile.billingAddress ? { billingAddress: profile.billingAddress } : {}),
    });
    const saved = mapBrandProfile(response.brand || response.profile || response);
    setBrandProfile(saved);
    setBrandName(saved.brandName);
    return saved;
  };
  const saveCreatorOnboarding = async (profile: CreatorAccountProfile) => {
    const response = await saveCreatorProfileRequest({
      displayName: profile.name,
      bio: profile.bio,
      categories: profile.categories || [],
      location: profile.city,
      primaryPlatform: profile.primaryPlatform || profile.platforms[0]?.name,
      repliesWithin: profile.repliesWithin,
      dob: profile.dateOfBirth,
      gender: profile.gender.toLowerCase().replace(/\s+/g, '_'),
      socialAccounts: profile.platforms.map((item) => ({
        platform: item.name.toLowerCase(),
        handle: item.handle,
      })),
    });
    const mapped = mapCreatorProfile(response.creator || response.profile || response);
    const saved = {
      ...profile,
      ...mapped,
      photoUrl: profile.photoUrl.startsWith('http') ? profile.photoUrl : mapped.photoUrl,
      dateOfBirth: mapped.dateOfBirth || profile.dateOfBirth,
      gender: mapped.gender || profile.gender,
      languages: profile.languages,
      platforms: profile.platforms,
    };
    setCreatorProfile(saved);
    return saved;
  };
  const restoreSession = async () => {
    try {
      if (!(await hasSavedSession())) return;
      const user = await getCurrentUser();
      const role: AuthRole = user.role === 'creator' ? 'creator' : 'brand';
      if (user.needsOnboarding) {
        reset([profileSetupRoute(role, user)]);
        return;
      }
      let profile: BrandOnboarding | CreatorAccountProfile;
      try {
        profile = role === 'creator' ? await loadCreatorProfile() : await loadBrandProfile();
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 404) throw error;
        reset([profileSetupRoute(role, user)]);
        return;
      }
      login(role, user, profile);
      await initializeWorkspace(role, role === 'creator' ? (profile as CreatorAccountProfile).creatorId : undefined);
    } catch (error) {
      if ((error as any)?.status !== 401) showToast(error instanceof Error ? error.message : 'Unable to restore your session.');
    }
  };
  const refreshSessionUser = async () => {
    const user = await getCurrentUser();
    setSessionUser(user.user || user);
    return user.user || user;
  };
  const startConversation = async (input: Omit<Conversation, 'id' | 'messages'>) => {
    if (accountRole !== 'brand') {
      showToast('Creators can reply after a brand starts the conversation.');
      return null;
    }
    const response = await startConversationRequest({ creatorId: input.creatorId });
    const conversation = mapConversationRecord(response.conversation || response);
    if (!conversation.id) throw new Error('The server did not return a conversation ID.');
    const mapped = {
      ...conversation,
      ...input,
      id: conversation.id,
      brandName: conversation.brandName || input.brandName || brandName,
      messages: conversation.messages || [],
    };
    setConversations((previous) => [mapped, ...previous.filter((item) => item.id !== mapped.id)]);
    return mapped.id;
  };
  const sendMessage = async (conversationId: string, text: string) => {
    const conversation = conversations.find((item) => item.id === conversationId);
    if (!conversation || !text.trim()) return false;
    if (
      accountRole === 'creator' &&
      !conversation.messages.some((message) => message.sender === 'brand')
    ) {
      showToast('You can reply after the brand sends the first message.');
      return false;
    }
    const response = await sendConversationMessage(conversationId, text);
    const source = response.message || response;
    const mappedMessage = mapConversationRecord({ id: conversationId, messages: [source] }).messages[0];
    const message: ChatMessage = {
      ...mappedMessage,
      sender: accountRole,
      text: mappedMessage.text || text.trim(),
      sentAt: mappedMessage.sentAt || new Date().toISOString(),
    };
    setConversations((previous) => previous.map((item) => item.id === conversationId
      ? { ...item, messages: [...item.messages, message] }
      : item));
    return true;
  };
  const logout = () => {
    void logoutRequest().catch((error) => showToast(error instanceof Error ? error.message : 'Unable to log out.'));
    setLoggedIn(false);
    setAccountRole('brand');
    setSessionUser(null);
    setKycStatus(null);
    setKycOpen(false);
    setBrandProfile(null);
    setCreatorProfile(null);
    setBrandName('');
    setConversations([]);
    setSaved([]);
    setCreatorSearchResults([]);
    setJobs([]);
    setOrders([]);
    setLists([]);
    setDeliverables([]);
    setNotifications([]);
    setUnread(0);
    setCreatorPackages([]);
    setOffers([]);
    setCart([]);
    setCartId(null);
    reset([{ name: 'Landing' }]);
  };
  const logoutAll = async () => {
    try {
      await logoutAllRequest();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to log out all sessions.');
      throw error;
    } finally {
      setLoggedIn(false);
      setAccountRole('brand');
      setSessionUser(null);
      setKycStatus(null);
      setKycOpen(false);
      setBrandProfile(null);
      setCreatorProfile(null);
      setBrandName('');
      setConversations([]);
      setSaved([]);
      setCreatorSearchResults([]);
      setJobs([]);
      setOrders([]);
      setLists([]);
      setDeliverables([]);
      setNotifications([]);
      setUnread(0);
      setCreatorPackages([]);
      setOffers([]);
      setCart([]);
      setCartId(null);
      reset([{ name: 'Landing' }]);
    }
  };

  const openCreator = (id: string) => {
    if (!loggedIn) {
      setPendingCreator(id);
      navRef.navigate('RoleSelection', { mode: 'login' });
    } else navRef.navigate('CreatorProfile', { id });
  };

  const addJob = async (input: Partial<Job>) => {
    const create = async () => {
    const response = await createCampaign({
      title: input.title || '',
      brief: input.description || input.deliverables || '',
      platform: input.platform || '',
      deliverables: input.deliverables || '',
      budgetMin: input.min || 0,
      budgetMax: input.max || 0,
      closesAt: input.closes || undefined,
      status: input.status === 'draft' ? 'draft' : 'open',
      usageRights: input.usageRights && typeof input.usageRights === 'object' ? input.usageRights : undefined,
    });
    const job = mapCampaign(response.campaign || response);
    setJobs((previous) => [job, ...previous.filter((item) => item.id !== job.id)]);
    return job;
    };
    return input.status === 'draft' ? create() : performVerifiedAction('publish a campaign', create);
  };
  const updateJob = async (id: string, patch: Partial<Job>) => {
    const update = async () => {
    const response = await updateCampaign(id, {
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.description !== undefined ? { brief: patch.description } : {}),
      ...(patch.platform !== undefined ? { platform: patch.platform } : {}),
      ...(patch.deliverables !== undefined ? { deliverables: patch.deliverables } : {}),
      ...(patch.min !== undefined ? { budgetMin: patch.min } : {}),
      ...(patch.max !== undefined ? { budgetMax: patch.max } : {}),
      ...(patch.closes !== undefined ? { closesAt: patch.closes } : {}),
      ...(patch.status === 'draft' || patch.status === 'open' ? { status: patch.status } : {}),
      ...(patch.usageRights && typeof patch.usageRights === 'object' ? { usageRights: patch.usageRights } : {}),
    });
    const updated = mapCampaign(response.campaign || response);
    setJobs((previous) => previous.map((job) => job.id === id ? { ...job, ...updated } : job));
    return updated;
    };
    return patch.status === 'draft' ? update() : performVerifiedAction('update a campaign', update);
  };
  const closeJob = async (id: string) => performVerifiedAction('close a campaign', async () => {
    await closeCampaign(id);
    setJobs((previous) => previous.map((job) => job.id === id ? { ...job, status: 'completed' } : job));
  });
  const withdrawBid = async (jobId: string, bidId: string) => performVerifiedAction('withdraw a bid', async () => {
    await withdrawCampaignBid(jobId, bidId);
    setCreatorBids((previous) => previous.map((bid) => bid.id === bidId ? { ...bid, status: 'withdrawn' } : bid));
    await refreshCreatorBids();
  });
  const updateBid = async (jobId: string, bidId: string, input: { price?: number; message?: string; deliveryDays?: number }) =>
    performVerifiedAction('update a bid', async () => {
    const response = await updateCampaignBid(jobId, bidId, input);
    await refreshCreatorBids();
    return response;
  });
  const hireBid = async (jobId: string, bid: Bid) => performVerifiedAction('select a creator bid', async () => {
    const response = await selectCampaignBid(jobId, bid.id);
    setJobs((previous) => previous.map((job) => (job.id === jobId ? { ...job, status: 'progress', hired: bid.creatorId, closes: '', bids: [] } : job)));
    if (response?.order) setOrders((previous) => [mapOrder(response.order), ...previous.filter((order) => order.id !== String(response.order.id))]);
    let orderRefreshError: unknown;
    try {
      await refreshOrders('brand');
    } catch (error) {
      orderRefreshError = error;
    }
    const name = bid.creatorName || CREATORS.find((c) => c.id === bid.creatorId)?.name || 'creator';
    showToast(orderRefreshError
      ? `Proposal accepted from ${name}, but orders could not refresh: ${orderRefreshError instanceof Error ? orderRefreshError.message : 'please reopen Orders.'}`
      : `Proposal accepted from ${name}.`);
    return response;
  });
  const addList = async (name: string) => {
    const response = await createList(name);
    const rawList = response.list || response;
    const list = { ...rawList, id: String(rawList.id), count: rawList.count ?? 0 };
    setLists((previous) => [list, ...previous.filter((item) => item.id !== list.id)]);
    return list;
  };
  const approveOrder = async (id: string) => {
    await approveOrderRequest(id);
    await refreshOrders();
    showToast('Order approved.');
  };
  const requestRevision = async (id: string, feedback: string) => {
    await requestOrderRevision(id, feedback);
    await refreshOrders();
    showToast('Revision request sent.');
  };

  return (
    <Ctx.Provider value={{
      loggedIn, login, logout, accountRole, brandName, setBrandName, brandProfile, setBrandProfile,
      colorScheme, toggleColorScheme,
      creatorProfile, setCreatorProfile: saveCreatorProfile, findCreatorProfile, creatorBids, submitCreatorBid,
      conversations, startConversation, sendMessage, refreshConversations, loadConversationMessages,
      jobs, addJob, updateJob, closeJob, refreshCampaigns, loadCampaignDetail, loadCampaignBids, hireBid, withdrawBid, updateBid,
      creatorSearchResults, searchCreators, loadPublicCreator,
      refreshCreatorBids, creatorPackages, refreshCreatorPackages, createPackage, updatePackage, removePackage,
      offers, refreshOffers, sendOffer, respondOffer, withdrawCreatorOffer,
      cart, cartId, refreshCart, addPackageToCart, removeCartEntry, checkout,
      lists, addList, refreshLists, saved, saveCreator, unsaveCreator,
      loadList, renameList, removeList,
      deliverables, orders, refreshOrders, loadOrderDetails, submitDeliverable, approveOrder, requestRevision,
      cancelOrder, disputeOrder, reviewOrder, notifications, refreshNotifications, readNotification, readAllNotifications,
      loadCreatorReviews,
      unread, sessionUser, loadBrandProfile, loadCreatorProfile, saveBrandOnboarding, saveCreatorOnboarding, restoreSession, refreshSessionUser, initializeWorkspace,
      logoutAll,
      sheet, openSheet, closeSheet, kycOpen, kycStatus, kycLoading, openKyc, closeKyc, submitKyc, refreshKycStatus,
      toast, showToast, openCreator, setPendingCreator, reset,
    }}>
      {children}
    </Ctx.Provider>
  );
}
