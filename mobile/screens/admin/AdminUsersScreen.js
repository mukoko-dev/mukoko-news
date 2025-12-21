/**
 * AdminUsersScreen - Modern user management
 * Design inspired by ProfileSettingsScreen for consistency
 * Features: Clean cards, icon-based actions, OIDC-aligned schema
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Image,
  Text as RNText,
} from 'react-native';
import {
  Text,
  Searchbar,
  Chip,
  Menu,
  useTheme as usePaperTheme,
} from 'react-native-paper';
import {
  ShieldAlert, AlertCircle, RefreshCw, ShieldCheck, Headphones,
  Pencil, User, CheckCircle2, PauseCircle, XCircle, HelpCircle,
  Settings, Trash2, Users, Search, UserSearch, ChevronLeft, ChevronRight,
  Loader2,
} from 'lucide-react-native';
import { LoadingState } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { admin } from '../../api/client';
import AdminHeader from '../../components/AdminHeader';
import AdminScreenWrapper from '../../components/AdminScreenWrapper';
import { mukokoTheme } from '../../theme';

// Updated roles to match OIDC schema
const ROLES = ['user', 'author', 'support', 'moderator', 'admin'];
const STATUSES = ['active', 'suspended', 'deleted'];

/**
 * Admin Users Screen
 * Manage users, roles, and status
 */
export default function AdminUsersScreen({ navigation }) {
  const theme = usePaperTheme();
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
  const [error, setError] = useState(null);

  const LIMIT = 20;

  // Dynamic styles for theme
  const dynamicStyles = {
    container: { backgroundColor: theme.colors.background },
    text: { color: theme.colors.onSurface },
    textMuted: { color: theme.colors.onSurfaceVariant },
    card: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.outline,
    },
    divider: { backgroundColor: theme.colors.outline },
  };

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
      case 'admin': return { color: '#EF4444', Icon: ShieldCheck };
      case 'moderator': return { color: '#8B5CF6', Icon: ShieldCheck };
      case 'support': return { color: '#3B82F6', Icon: Headphones };
      case 'author': return { color: '#10B981', Icon: Pencil };
      default: return { color: '#6B7280', Icon: User };
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'active': return { color: '#10B981', Icon: CheckCircle2 };
      case 'suspended': return { color: '#F59E0B', Icon: PauseCircle };
      case 'deleted': return { color: '#EF4444', Icon: XCircle };
      default: return { color: '#6B7280', Icon: HelpCircle };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  if (!isAdmin) {
    return (
      <View className="flex-1 justify-center items-center px-lg" style={{ backgroundColor: theme.colors.background }}>
        <ShieldAlert size={48} color={theme.colors.error} />
        <RNText className="font-serif-bold text-headline-small mt-md mb-sm" style={{ color: theme.colors.onSurface }}>
          Access Denied
        </RNText>
        <RNText className="font-sans text-body-medium text-center" style={{ color: theme.colors.onSurfaceVariant }}>
          You don't have permission to access this page.
        </RNText>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center px-lg" style={{ backgroundColor: theme.colors.background }}>
        <AlertCircle size={48} color={theme.colors.error} />
        <RNText className="font-serif-bold text-headline-small mt-md mb-sm" style={{ color: theme.colors.onSurface }}>
          Something went wrong
        </RNText>
        <RNText className="font-sans text-body-medium mb-lg text-center" style={{ color: theme.colors.onSurfaceVariant }}>
          {error}
        </RNText>
        <Pressable
          className="flex-row items-center gap-sm py-md px-xl rounded-button"
          style={{ backgroundColor: theme.colors.primary }}
          onPress={loadUsers}
        >
          <RefreshCw size={16} color="#FFFFFF" />
          <RNText className="font-sans-bold text-label-large" style={{ color: '#FFFFFF' }}>
            Try Again
          </RNText>
        </Pressable>
      </View>
    );
  }

  // User card component - consistent with ProfileSettingsScreen design
  const UserCard = ({ user }) => {
    const roleConfig = getRoleConfig(user.role);
    const statusConfig = getStatusConfig(user.status);

    return (
      <View style={[styles.userCard, dynamicStyles.card]}>
        {/* User Header */}
        <View style={styles.userHeader}>
          {user.picture ? (
            <Image
              source={{ uri: user.picture }}
              style={styles.userAvatar}
            />
          ) : (
            <View style={[styles.userAvatarPlaceholder, { backgroundColor: `${roleConfig.color}15` }]}>
              <Text style={[styles.avatarText, { color: roleConfig.color }]}>
                {(user.name || user.username || user.email || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={[styles.userName, dynamicStyles.text]} numberOfLines={1}>
              {user.name || user.username || 'Unknown'}
            </Text>
            <Text style={[styles.userEmail, dynamicStyles.textMuted]} numberOfLines={1}>
              {user.email}
            </Text>
            {user.username && (
              <Text style={[styles.userUsername, dynamicStyles.textMuted]}>
                @{user.username}
              </Text>
            )}
          </View>
        </View>

        {/* Badges Row */}
        <View style={styles.badgesRow}>
          <View style={[styles.badge, { backgroundColor: `${roleConfig.color}15` }]}>
            <roleConfig.Icon size={12} color={roleConfig.color} />
            <Text style={[styles.badgeText, { color: roleConfig.color }]}>
              {user.role}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: `${statusConfig.color}15` }]}>
            <statusConfig.Icon size={12} color={statusConfig.color} />
            <Text style={[styles.badgeText, { color: statusConfig.color }]}>
              {user.status}
            </Text>
          </View>
          <Text style={[styles.dateText, dynamicStyles.textMuted]}>
            Joined {formatDate(user.created_at)}
          </Text>
        </View>

        {/* Divider */}
        <View style={[styles.divider, dynamicStyles.divider]} />

        {/* Actions Row */}
        <View style={styles.actionsRow}>
          {/* Role Menu */}
          <Menu
            visible={menuVisible === `role-${user.id}`}
            onDismiss={() => setMenuVisible(null)}
            anchor={
              <Pressable
                style={styles.actionButton}
                onPress={() => setMenuVisible(`role-${user.id}`)}
              >
                <View style={[styles.actionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                  <ShieldCheck size={16} color="#3B82F6" />
                </View>
                <Text style={[styles.actionText, dynamicStyles.text]}>Role</Text>
              </Pressable>
            }
          >
            {ROLES.map((role) => {
              const config = getRoleConfig(role);
              return (
                <Menu.Item
                  key={role}
                  onPress={() => handleRoleChange(user.id, role)}
                  title={role}
                  leadingIcon={() => (
                    <config.Icon size={18} color={config.color} />
                  )}
                />
              );
            })}
          </Menu>

          {/* Status Menu */}
          <Menu
            visible={menuVisible === `status-${user.id}`}
            onDismiss={() => setMenuVisible(null)}
            anchor={
              <Pressable
                style={styles.actionButton}
                onPress={() => setMenuVisible(`status-${user.id}`)}
              >
                <View style={[styles.actionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                  <Settings size={16} color="#F59E0B" />
                </View>
                <Text style={[styles.actionText, dynamicStyles.text]}>Status</Text>
              </Pressable>
            }
          >
            {STATUSES.map((status) => {
              const config = getStatusConfig(status);
              return (
                <Menu.Item
                  key={status}
                  onPress={() => handleStatusChange(user.id, status)}
                  title={status}
                  leadingIcon={() => (
                    <config.Icon size={18} color={config.color} />
                  )}
                />
              );
            })}
          </Menu>

          {/* Delete Button */}
          <Pressable
            style={styles.actionButton}
            onPress={() => handleDelete(user.id, user.email)}
          >
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <Trash2 size={16} color="#EF4444" />
            </View>
            <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <AdminScreenWrapper>
      <View style={[styles.container, dynamicStyles.container]}>
        <AdminHeader navigation={navigation} currentScreen="AdminUsers" />

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, dynamicStyles.text]}>Users</Text>
          <View style={styles.statsBadge}>
            <Users size={14} color={theme.colors.primary} />
            <Text style={[styles.statsText, { color: theme.colors.primary }]}>
              {total.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search users..."
            onChangeText={(text) => {
              setSearchQuery(text);
              setPage(0);
            }}
            value={searchQuery}
            style={[styles.searchbar, dynamicStyles.card]}
            inputStyle={{ fontSize: 15 }}
            icon={() => <Search size={20} color={theme.colors.onSurfaceVariant} />}
          />
        </View>

        {/* Role Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          <Chip
            selected={!selectedRole}
            onPress={() => { setSelectedRole(''); setPage(0); }}
            style={styles.chip}
            textStyle={styles.chipText}
          >
            All
          </Chip>
          {ROLES.map((role) => {
            const config = getRoleConfig(role);
            return (
              <Chip
                key={role}
                selected={selectedRole === role}
                onPress={() => { setSelectedRole(role); setPage(0); }}
                style={styles.chip}
                textStyle={styles.chipText}
                icon={() => (
                  <config.Icon size={14} color={config.color} />
                )}
              >
                {role}
              </Chip>
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
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <UserSearch size={48} color={theme.colors.onSurfaceVariant} />
                <Text style={[styles.emptyText, dynamicStyles.textMuted]}>No users found</Text>
              </View>
            }
            ListFooterComponent={
              users.length > 0 && (
                <View style={styles.pagination}>
                  <Pressable
                    style={[
                      styles.pageButton,
                      dynamicStyles.card,
                      page === 0 && styles.pageButtonDisabled,
                    ]}
                    onPress={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft
                      size={20}
                      color={page === 0 ? theme.colors.onSurfaceDisabled : theme.colors.onSurface}
                    />
                  </Pressable>
                  <Text style={[styles.pageText, dynamicStyles.textMuted]}>
                    Page {page + 1} of {Math.ceil(total / LIMIT)}
                  </Text>
                  <Pressable
                    style={[
                      styles.pageButton,
                      dynamicStyles.card,
                      (page + 1) * LIMIT >= total && styles.pageButtonDisabled,
                    ]}
                    onPress={() => setPage((p) => p + 1)}
                    disabled={(page + 1) * LIMIT >= total}
                  >
                    <ChevronRight
                      size={20}
                      color={(page + 1) * LIMIT >= total ? theme.colors.onSurfaceDisabled : theme.colors.onSurface}
                    />
                  </Pressable>
                </View>
              )
            }
          />
        )}
      </View>
    </AdminScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(94, 87, 114, 0.1)',
  },
  statsText: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchbar: {
    elevation: 0,
    borderRadius: 12,
    borderWidth: 1,
  },
  filtersContainer: {
    maxHeight: 44,
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  chip: {
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    textTransform: 'capitalize',
  },
  list: {
    padding: 16,
    paddingTop: 4,
    paddingBottom: 100,
  },
  userCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },
  userUsername: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 11,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    marginLeft: 'auto',
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 11,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageText: {
    fontSize: 13,
  },
});
