/**
 * AdminUsersScreen - Modern user management
 * Design inspired by ProfileSettingsScreen for consistency
 * Features: Clean cards, icon-based actions, OIDC-aligned schema
 *
 * Migration: NativeWind + Lucide only (NO React Native Paper, NO StyleSheet)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Image,
  Text as RNText,
  Modal,
} from 'react-native';
import {
  ShieldAlert, AlertCircle, RefreshCw, ShieldCheck, Headphones,
  Pencil, User, CheckCircle2, PauseCircle, XCircle, HelpCircle,
  Settings, Trash2, Users, UserSearch, ChevronLeft, ChevronRight,
} from 'lucide-react-native';
import { LoadingState, SearchBar, FilterChip } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { admin } from '../../api/client';
import AdminHeader from '../../components/AdminHeader';
import AdminScreenWrapper from '../../components/AdminScreenWrapper';

// Updated roles to match OIDC schema
const ROLES = ['user', 'author', 'support', 'moderator', 'admin'];
const STATUSES = ['active', 'suspended', 'deleted'];

/**
 * Admin Users Screen
 * Manage users, roles, and status
 */
export default function AdminUsersScreen({ navigation }) {
  const { theme } = useTheme();
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(0);
  const [menuVisible, setMenuVisible] = useState(null);
  const [menuOptions, setMenuOptions] = useState([]);
  const [error, setError] = useState(null);

  const LIMIT = 20;

  const loadUsers = useCallback(async () => {
    setError(null);
    try {
      const result = await admin.getUsers({
        search: searchQuery || undefined,
        role: selectedRole || undefined,
        status: selectedStatus || undefined,
        limit: LIMIT,
        offset: page * LIMIT,
      });

      if (result.data) {
        setUsers(result.data.users || []);
        setTotal(result.data.total || 0);
      }
    } catch (err) {
      console.error('[Admin] Load users error:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedRole, selectedStatus, page]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadUsers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [loadUsers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadUsers();
  }, [loadUsers]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await admin.updateUserRole(userId, newRole);
      loadUsers();
    } catch (error) {
      Alert.alert('Error', 'Failed to update role');
    }
    setMenuVisible(null);
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await admin.updateUserStatus(userId, newStatus);
      loadUsers();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
    setMenuVisible(null);
  };

  const handleDelete = (userId, email) => {
    const confirmDelete = () => {
      admin.deleteUser(userId).then(() => loadUsers());
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Delete user ${email}? This cannot be undone.`)) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        'Delete User',
        `Are you sure you want to delete ${email}? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: confirmDelete },
        ]
      );
    }
  };

  const getRoleConfig = (role) => {
    switch (role) {
      case 'admin': return { color: theme.colors.error, Icon: ShieldCheck };
      case 'moderator': return { color: '#8B5CF6', Icon: ShieldCheck };
      case 'support': return { color: theme.colors.cobalt, Icon: Headphones };
      case 'author': return { color: theme.colors.success, Icon: Pencil };
      default: return { color: theme.colors['on-surface-variant'], Icon: User };
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'active': return { color: theme.colors.success, Icon: CheckCircle2 };
      case 'suspended': return { color: theme.colors.warning, Icon: PauseCircle };
      case 'deleted': return { color: theme.colors.error, Icon: XCircle };
      default: return { color: theme.colors['on-surface-variant'], Icon: HelpCircle };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const openRoleMenu = (userId) => {
    const options = ROLES.map((role) => ({
      value: role,
      config: getRoleConfig(role),
      onPress: () => handleRoleChange(userId, role),
    }));
    setMenuOptions(options);
    setMenuVisible(`role-${userId}`);
  };

  const openStatusMenu = (userId) => {
    const options = STATUSES.map((status) => ({
      value: status,
      config: getStatusConfig(status),
      onPress: () => handleStatusChange(userId, status),
    }));
    setMenuOptions(options);
    setMenuVisible(`status-${userId}`);
  };

  if (!isAdmin) {
    return (
      <View className="flex-1 justify-center items-center px-lg bg-background">
        <ShieldAlert size={48} color={theme.colors.error} />
        <RNText className="font-serif-bold text-headline-small mt-md mb-sm text-on-surface">
          Access Denied
        </RNText>
        <RNText className="font-sans text-body-medium text-center text-on-surface-variant">
          You don't have permission to access this page.
        </RNText>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center px-lg bg-background">
        <AlertCircle size={48} color={theme.colors.error} />
        <RNText className="font-serif-bold text-headline-small mt-md mb-sm text-on-surface">
          Something went wrong
        </RNText>
        <RNText className="font-sans text-body-medium mb-lg text-center text-on-surface-variant">
          {error}
        </RNText>
        <Pressable
          className="flex-row items-center gap-sm py-md px-xl rounded-button bg-tanzanite"
          onPress={loadUsers}
        >
          <RefreshCw size={16} color="#FFFFFF" />
          <RNText className="font-sans-bold text-label-large text-on-primary">
            Try Again
          </RNText>
        </Pressable>
      </View>
    );
  }

  // Action Menu Modal
  const ActionMenu = () => (
    <Modal
      visible={!!menuVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setMenuVisible(null)}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center"
        onPress={() => setMenuVisible(null)}
      >
        <View className="bg-surface rounded-card max-h-[400px] w-[80%] max-w-[300px]" onStartShouldSetResponder={() => true}>
          <ScrollView className="max-h-[400px]">
            {menuOptions.map((option, index) => {
              const OptionIcon = option.config.Icon;
              return (
                <Pressable
                  key={option.value || index}
                  className="flex-row items-center gap-md px-lg py-md border-b border-outline"
                  onPress={option.onPress}
                >
                  <OptionIcon size={18} color={option.config.color} />
                  <RNText className="font-sans text-body-medium text-on-surface capitalize">
                    {option.value}
                  </RNText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );

  // User card component - consistent with ProfileSettingsScreen design
  const UserCard = ({ user }) => {
    const roleConfig = getRoleConfig(user.role);
    const statusConfig = getStatusConfig(user.status);

    return (
      <View className="rounded-card bg-surface border border-outline p-lg mb-md">
        {/* User Header */}
        <View className="flex-row items-center mb-md">
          {user.picture ? (
            <Image
              source={{ uri: user.picture }}
              className="w-[48px] h-[48px] rounded-full mr-md"
            />
          ) : (
            <View
              className="w-[48px] h-[48px] rounded-full justify-center items-center mr-md"
              style={{ backgroundColor: `${roleConfig.color}15` }}
            >
              <RNText className="font-sans-bold text-[18px]" style={{ color: roleConfig.color }}>
                {(user.name || user.username || user.email || 'U').charAt(0).toUpperCase()}
              </RNText>
            </View>
          )}
          <View className="flex-1">
            <RNText className="font-sans-medium text-body-large text-on-surface mb-[2px]" numberOfLines={1}>
              {user.name || user.username || 'Unknown'}
            </RNText>
            <RNText className="font-sans text-body-small text-on-surface-variant" numberOfLines={1}>
              {user.email}
            </RNText>
            {user.username && (
              <RNText className="font-sans text-body-small text-on-surface-variant mt-[2px]">
                @{user.username}
              </RNText>
            )}
          </View>
        </View>

        {/* Badges Row */}
        <View className="flex-row items-center gap-sm mb-md">
          <View
            className="flex-row items-center gap-[4px] px-sm py-[4px] rounded-lg"
            style={{ backgroundColor: `${roleConfig.color}15` }}
          >
            <roleConfig.Icon size={12} color={roleConfig.color} />
            <RNText className="font-sans-medium text-[11px] capitalize" style={{ color: roleConfig.color }}>
              {user.role}
            </RNText>
          </View>
          <View
            className="flex-row items-center gap-[4px] px-sm py-[4px] rounded-lg"
            style={{ backgroundColor: `${statusConfig.color}15` }}
          >
            <statusConfig.Icon size={12} color={statusConfig.color} />
            <RNText className="font-sans-medium text-[11px] capitalize" style={{ color: statusConfig.color }}>
              {user.status}
            </RNText>
          </View>
          <RNText className="font-sans text-[11px] text-on-surface-variant ml-auto">
            Joined {formatDate(user.created_at)}
          </RNText>
        </View>

        {/* Divider */}
        <View className="h-[1px] bg-outline mb-md" />

        {/* Actions Row */}
        <View className="flex-row justify-around">
          {/* Role Button */}
          <Pressable
            className="items-center gap-[4px] py-[4px] px-md"
            onPress={() => openRoleMenu(user.id)}
          >
            <View className="w-[32px] h-[32px] rounded-lg justify-center items-center bg-cobalt/10">
              <ShieldCheck size={16} color={theme.colors.cobalt} />
            </View>
            <RNText className="font-sans-medium text-[11px] text-on-surface">Role</RNText>
          </Pressable>

          {/* Status Button */}
          <Pressable
            className="items-center gap-[4px] py-[4px] px-md"
            onPress={() => openStatusMenu(user.id)}
          >
            <View className="w-[32px] h-[32px] rounded-lg justify-center items-center bg-warning/10">
              <Settings size={16} color={theme.colors.warning} />
            </View>
            <RNText className="font-sans-medium text-[11px] text-on-surface">Status</RNText>
          </Pressable>

          {/* Delete Button */}
          <Pressable
            className="items-center gap-[4px] py-[4px] px-md"
            onPress={() => handleDelete(user.id, user.email)}
          >
            <View className="w-[32px] h-[32px] rounded-lg justify-center items-center bg-error/10">
              <Trash2 size={16} color={theme.colors.error} />
            </View>
            <RNText className="font-sans-medium text-[11px]" style={{ color: theme.colors.error }}>Delete</RNText>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <AdminScreenWrapper>
      <View className="flex-1 bg-background">
        <AdminHeader navigation={navigation} currentScreen="AdminUsers" />

        {/* Header */}
        <View className="flex-row justify-between items-center px-lg py-md">
          <RNText className="font-serif-bold text-headline-small text-on-surface">Users</RNText>
          <View className="flex-row items-center gap-[4px] px-[10px] py-[4px] rounded-button bg-tanzanite/10">
            <Users size={14} color={theme.colors.tanzanite} />
            <RNText className="font-sans-medium text-body-small" style={{ color: theme.colors.tanzanite }}>
              {total.toLocaleString()}
            </RNText>
          </View>
        </View>

        {/* Search */}
        <View className="px-lg pb-sm">
          <SearchBar
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setPage(0);
            }}
          />
        </View>

        {/* Role Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="max-h-[44px]"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 8 }}
        >
          <FilterChip
            selected={!selectedRole}
            onPress={() => { setSelectedRole(''); setPage(0); }}
          >
            All
          </FilterChip>
          {ROLES.map((role) => {
            const config = getRoleConfig(role);
            return (
              <FilterChip
                key={role}
                selected={selectedRole === role}
                onPress={() => { setSelectedRole(role); setPage(0); }}
                icon={config.Icon}
              >
                {role}
              </FilterChip>
            );
          })}
        </ScrollView>

        {/* Users List */}
        {loading ? (
          <LoadingState message="Loading users..." />
        ) : (
          <FlatList
            data={users}
            renderItem={({ item }) => <UserCard user={item} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.tanzanite]}
              />
            }
            ListEmptyComponent={
              <View className="p-xxl items-center gap-md">
                <UserSearch size={48} color={theme.colors['on-surface-variant']} />
                <RNText className="font-sans text-body-medium text-on-surface-variant">No users found</RNText>
              </View>
            }
            ListFooterComponent={
              users.length > 0 && (
                <View className="flex-row justify-center items-center gap-lg py-lg">
                  <Pressable
                    className={`w-[40px] h-[40px] rounded-full justify-center items-center border border-outline bg-surface ${page === 0 ? 'opacity-50' : ''}`}
                    onPress={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft
                      size={20}
                      color={page === 0 ? theme.colors['on-surface-variant'] : theme.colors['on-surface']}
                    />
                  </Pressable>
                  <RNText className="font-sans text-body-small text-on-surface-variant">
                    Page {page + 1} of {Math.ceil(total / LIMIT)}
                  </RNText>
                  <Pressable
                    className={`w-[40px] h-[40px] rounded-full justify-center items-center border border-outline bg-surface ${(page + 1) * LIMIT >= total ? 'opacity-50' : ''}`}
                    onPress={() => setPage((p) => p + 1)}
                    disabled={(page + 1) * LIMIT >= total}
                  >
                    <ChevronRight
                      size={20}
                      color={(page + 1) * LIMIT >= total ? theme.colors['on-surface-variant'] : theme.colors['on-surface']}
                    />
                  </Pressable>
                </View>
              )
            }
          />
        )}

        {/* Action Menu */}
        <ActionMenu />
      </View>
    </AdminScreenWrapper>
  );
}
