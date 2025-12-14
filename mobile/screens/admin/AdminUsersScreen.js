import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Searchbar,
  Chip,
  Menu,
  Button,
  useTheme,
  ActivityIndicator,
  IconButton,
  Divider,
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { admin } from '../../api/client';
import AdminHeader from '../../components/AdminHeader';
import AdminScreenWrapper from '../../components/AdminScreenWrapper';

const ROLES = ['creator', 'business-creator', 'moderator', 'admin', 'super_admin'];
const STATUSES = ['active', 'suspended', 'deleted'];

/**
 * Admin Users Screen
 * Manage users, roles, and status
 */
export default function AdminUsersScreen({ navigation }) {
  const theme = useTheme();
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

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin': return '#8B5CF6';
      case 'admin': return '#EF4444';
      case 'moderator': return '#3B82F6';
      case 'business-creator': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'suspended': return '#F59E0B';
      case 'deleted': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  if (!isAdmin) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text variant="headlineSmall">Access Denied</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text variant="headlineSmall" style={{ marginBottom: 8 }}>Something went wrong</Text>
          <Text style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={loadUsers}
          >
            <Text style={{ color: '#FFFFFF' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderUser = ({ item: user }) => (
    <Card style={[styles.userCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.userHeader}>
          <View style={styles.userAvatar}>
            <Text style={styles.avatarText}>
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text variant="titleMedium">
              {user.display_name || user.username || 'Unknown'}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {user.email}
            </Text>
          </View>
        </View>

        <View style={styles.userMeta}>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: getRoleBadgeColor(user.role) + '20' }]}>
              <Text style={[styles.badgeText, { color: getRoleBadgeColor(user.role) }]}>
                {user.role?.replace('_', ' ')}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: getStatusBadgeColor(user.status) + '20' }]}>
              <Text style={[styles.badgeText, { color: getStatusBadgeColor(user.status) }]}>
                {user.status}
              </Text>
            </View>
          </View>

          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Joined: {formatDate(user.created_at)}
          </Text>
        </View>

        <Divider style={{ marginVertical: 12 }} />

        <View style={styles.userActions}>
          <Menu
            visible={menuVisible === `role-${user.id}`}
            onDismiss={() => setMenuVisible(null)}
            anchor={
              <Button
                mode="outlined"
                compact
                onPress={() => setMenuVisible(`role-${user.id}`)}
              >
                Change Role
              </Button>
            }
          >
            {ROLES.map((role) => (
              <Menu.Item
                key={role}
                onPress={() => handleRoleChange(user.id, role)}
                title={role.replace('_', ' ')}
              />
            ))}
          </Menu>

          <Menu
            visible={menuVisible === `status-${user.id}`}
            onDismiss={() => setMenuVisible(null)}
            anchor={
              <Button
                mode="outlined"
                compact
                onPress={() => setMenuVisible(`status-${user.id}`)}
              >
                Change Status
              </Button>
            }
          >
            {STATUSES.map((status) => (
              <Menu.Item
                key={status}
                onPress={() => handleStatusChange(user.id, status)}
                title={status}
              />
            ))}
          </Menu>

          <IconButton
            icon="delete"
            iconColor={theme.colors.error}
            size={20}
            onPress={() => handleDelete(user.id, user.email)}
          />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <AdminScreenWrapper>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <AdminHeader navigation={navigation} currentScreen="AdminUsers" />
        {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>Users</Text>
        <Text style={{ color: theme.colors.onSurfaceVariant }}>
          {total.toLocaleString()} total users
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search by email or username..."
          onChangeText={(text) => {
            setSearchQuery(text);
            setPage(0);
          }}
          value={searchQuery}
          style={styles.searchbar}
          selectionColor={theme.colors.primary}
          cursorColor={theme.colors.primary}
        />
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <ScrollViewHorizontal>
          <Chip
            selected={!selectedRole}
            onPress={() => { setSelectedRole(''); setPage(0); }}
            style={styles.chip}
          >
            All Roles
          </Chip>
          {ROLES.map((role) => (
            <Chip
              key={role}
              selected={selectedRole === role}
              onPress={() => { setSelectedRole(role); setPage(0); }}
              style={styles.chip}
            >
              {role.replace('_', ' ')}
            </Chip>
          ))}
        </ScrollViewHorizontal>
      </View>

      {/* Users List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUser}
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
              <Text>No users found</Text>
            </View>
          }
          ListFooterComponent={
            users.length > 0 && (
              <View style={styles.pagination}>
                <Button
                  mode="outlined"
                  onPress={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>
                  Page {page + 1}
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => setPage((p) => p + 1)}
                  disabled={(page + 1) * LIMIT >= total}
                >
                  Next
                </Button>
              </View>
            )
          }
        />
      )}
      </View>
    </AdminScreenWrapper>
  );
}

// Simple horizontal scroll for filters
function ScrollViewHorizontal({ children }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchbar: {
    elevation: 0,
    borderRadius: 12,
  },
  filters: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  list: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 100,
  },
  userCard: {
    marginBottom: 12,
    borderRadius: 12,
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
    backgroundColor: '#5e577220',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5e5772',
  },
  userInfo: {
    flex: 1,
  },
  userMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});
