import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, shadowSm, shadowMd } from './theme';
import { T } from './components/ui';
import { Landing, RoleSelection, ComingSoon, Auth, Onboarding } from './screens/Public';
import { Home, Search, Jobs, Orders, Dashboard, AccountSettings } from './screens/brand';
import { Lists, Deliverables, Reporting, CreatorProfile, CreatorListDetail, Cart, Offers } from './screens/Workspace';
import {
  CreatorAccount, CreatorActiveJobs, CreatorBidForm, CreatorBidSent, CreatorEarnings, CreatorHome, CreatorJobDetail,
  CreatorMessages, CreatorPackages, CreatorSettings, CreatorSetup, FindJobs, MyBids,
} from './screens/creator';
import { useApp } from './store';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TABS: Record<string, [string, string, string]> = {
  Home: ['Home', 'home-outline', 'home'],
  Search: ['Creators', 'people-outline', 'people'],
  Create: ['Post', 'add', 'add'],
  Jobs: ['Campaigns', 'briefcase-outline', 'briefcase'],
  Orders: ['Payments', 'wallet-outline', 'wallet'],
  Dashboard: ['Campaigns', 'albums-outline', 'albums'],
  FindJobs: ['Find Jobs', 'search-outline', 'search'],
  MyBids: ['My Bids', 'paper-plane-outline', 'paper-plane'],
  ActiveJobs: ['Active Jobs', 'briefcase-outline', 'briefcase'],
  Earnings: ['Earnings', 'wallet-outline', 'wallet'],
};

function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { orders, openSheet } = useApp() || {};
  const awaitingOrders = orders?.filter((o: any) => o.stage === 'delivered').length || 0;
  // Dashboard is an alias to Home and should not appear as a separate tab.
  const visibleRoutes = state.routes.filter((route) => route.name !== 'Dashboard');
  const currentRoute = state.routes[state.index]?.name;

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: C.surface,
        borderTopWidth: 1,
        borderTopColor: C.tabBorder,
        paddingTop: 8,
        paddingHorizontal: 8,
        paddingBottom: Math.max(insets.bottom, 8),
        ...shadowMd,
      }}
    >
      {visibleRoutes.map((r) => {
        const isCreate = r.name === 'Create';
        const active = currentRoute === r.name;
        const [label, off, on] = TABS[r.name] || [r.name, 'ellipse-outline', 'ellipse'];
        const showBadge = r.name === 'Orders' && awaitingOrders > 0;

        return (
          <Pressable
            key={r.key}
            onPress={() => {
              if (isCreate) {
                openSheet('postjob');
                return;
              }
              const e = navigation.emit({ type: 'tabPress', target: r.key, canPreventDefault: true });
              if (currentRoute !== r.name && !e.defaultPrevented) navigation.navigate(r.name);
            }}
            accessibilityRole="button"
            accessibilityLabel={isCreate ? 'Post a campaign brief' : label}
            android_ripple={{ color: C.ripple, borderless: true }}
            style={{
              flex: 1,
              alignItems: 'center',
              gap: 3,
              minHeight: 50,
              borderRadius: 16,
              overflow: isCreate ? 'visible' : 'hidden',
            }}
          >
            <View
              style={{
                width: isCreate ? 46 : 48,
                height: isCreate ? 42 : 28,
                borderRadius: isCreate ? 21 : 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isCreate ? C.primary : active ? C.primaryLight : 'transparent',
                marginTop: isCreate ? -10 : 0,
                ...(isCreate ? shadowSm : {}),
              }}
            >
              <Ionicons
                name={(active ? on : off) as any}
                size={isCreate ? 24 : 19}
                color={isCreate ? C.onPrimary : active ? C.primary : C.muted2}
              />
              {showBadge ? (
                <View
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 8,
                    width: 7,
                    height: 7,
                    borderRadius: 3.5,
                    backgroundColor: C.amber,
                    borderWidth: 1.2,
                    borderColor: C.surface,
                  }}
                />
              ) : null}
            </View>
            <T
              size={10.5}
              w={active ? 'semi' : 'med'}
              color={active ? C.primary : C.muted2}
            >
              {label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

function Main() {
  return (
    <Tab.Navigator
      id="MainTabs"
      tabBar={(p) => <TabBar {...p} />}
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Search" component={Search} />
      <Tab.Screen name="Create" component={CreateAction} />
      <Tab.Screen name="Jobs" component={Jobs} />
      <Tab.Screen name="Orders" component={Orders} />
      <Tab.Screen name="Dashboard" component={Home} />
    </Tab.Navigator>
  );
}

function CreatorMain() {
  return (
    <Tab.Navigator
      id="CreatorTabs"
      tabBar={(p) => <TabBar {...p} />}
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Tab.Screen name="Home" component={CreatorHome} />
      <Tab.Screen name="FindJobs" component={FindJobs} />
      <Tab.Screen name="MyBids" component={MyBids} />
      <Tab.Screen name="ActiveJobs" component={CreatorActiveJobs} />
      <Tab.Screen name="Earnings" component={CreatorEarnings} />
    </Tab.Navigator>
  );
}

function CreateAction() {
  return null;
}

export function RootStack() {
  return (
    <Stack.Navigator
      id="RootStack"
      initialRouteName="Landing"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Landing" component={Landing} />
      <Stack.Screen name="RoleSelection" component={RoleSelection} />
      <Stack.Screen name="ComingSoon" component={ComingSoon} />
      <Stack.Screen name="Auth" component={Auth} />
      <Stack.Screen name="Onboarding" component={Onboarding} />
      <Stack.Screen name="Main" component={Main} />
      <Stack.Screen name="CreatorMain" component={CreatorMain} />
      <Stack.Screen name="CreatorSetup" component={CreatorSetup} />
      <Stack.Screen name="CreatorJobDetail" component={CreatorJobDetail} />
      <Stack.Screen name="CreatorBidForm" component={CreatorBidForm} />
      <Stack.Screen name="CreatorBidSent" component={CreatorBidSent} />
      <Stack.Screen name="CreatorMessages" component={CreatorMessages} />
      <Stack.Screen name="CreatorAccount" component={CreatorAccount} />
      <Stack.Screen name="CreatorSettings" component={CreatorSettings} />
      <Stack.Screen name="CreatorPackages" component={CreatorPackages} />
      <Stack.Screen name="AccountSettings" component={AccountSettings} />
      <Stack.Screen name="Lists" component={Lists} />
      <Stack.Screen name="CreatorListDetail" component={CreatorListDetail} />
      <Stack.Screen name="Cart" component={Cart} />
      <Stack.Screen name="Offers" component={Offers} />
      <Stack.Screen name="Deliverables" component={Deliverables} />
      <Stack.Screen name="Reporting" component={Reporting} />
      <Stack.Screen name="CreatorProfile" component={CreatorProfile} />
    </Stack.Navigator>
  );
}
