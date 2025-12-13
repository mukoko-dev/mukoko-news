import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Switch,
  Button,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { admin } from '../../api/client';
import AdminHeader from '../../components/AdminHeader';
import AdminScreenWrapper from '../../components/AdminScreenWrapper';

/**
 * Admin Sources Screen
 * Manage RSS news sources
 */
export default function AdminSourcesScreen({ navigation }) {
  const theme = useTheme();
  const { isAdmin } = useAuth();
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const loadSources = useCallback(async () => {
    try {
      const result = await admin.getSources();
      if (result.data) {
        setSources(result.data.sources || []);
      }
    } catch (error) {
      console.error('[Admin] Load sources error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSources();
  }, [loadSources]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadSources();
  }, [loadSources]);

  const handleToggleSource = async (sourceId, enabled) => {
    setActionLoading(sourceId);
    try {
      await admin.updateSource(sourceId, { enabled: !enabled });
      loadSources();
    } catch (error) {
      console.error('[Admin] Toggle source error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddZimbabweSources = async () => {
    setActionLoading('add');
    try {
      await admin.addZimbabweSources();
      loadSources();
    } catch (error) {
      console.error('[Admin] Add sources error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const enabledCount = sources.filter((s) => s.enabled).length;

  const renderSource = ({ item: source }) => (
    <Card
      style={[
        styles.sourceCard,
        { backgroundColor: theme.colors.surface },
        !source.enabled && styles.disabledCard,
      ]}
    >
      <Card.Content>
        <View style={styles.sourceHeader}>
          <View style={styles.sourceIcon}>
            <Text style={styles.iconText}>📰</Text>
          </View>
          <View style={styles.sourceInfo}>
            <Text variant="titleMedium">{source.name}</Text>
            {source.category && (
              <View style={[styles.categoryBadge, { backgroundColor: theme.colors.primaryContainer }]}>
                <Text style={[styles.categoryText, { color: theme.colors.primary }]}>
                  {source.category}
                </Text>
              </View>
            )}
          </View>
          {actionLoading === source.id ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Switch
              value={source.enabled}
              onValueChange={() => handleToggleSource(source.id, source.enabled)}
              color={theme.colors.primary}
            />
          )}
        </View>

        <View style={styles.sourceMeta}>
          <View style={styles.metaItem}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Articles
            </Text>
            <Text variant="titleSmall">{source.article_count || 0}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Last Fetched
            </Text>
            <Text variant="titleSmall">{formatDate(source.last_fetched)}</Text>
          </View>
        </View>

        <Text
          variant="bodySmall"
          style={[styles.sourceUrl, { color: theme.colors.primary }]}
          numberOfLines={1}
        >
          {source.url}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <AdminScreenWrapper>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <AdminHeader navigation={navigation} currentScreen="AdminSources" />
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text variant="headlineSmall" style={styles.title}>News Sources</Text>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            {enabledCount} active of {sources.length} sources
          </Text>
        </View>
        <Button
          mode="contained"
          onPress={handleAddZimbabweSources}
          loading={actionLoading === 'add'}
          icon="plus"
          compact
        >
          Add ZW
        </Button>
      </View>

      {/* Sources List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={sources}
          renderItem={renderSource}
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
              <Text style={styles.emptyIcon}>📡</Text>
              <Text variant="titleMedium">No sources configured</Text>
              <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                Add news sources to start aggregating articles
              </Text>
              <Button
                mode="contained"
                onPress={handleAddZimbabweSources}
                style={{ marginTop: 16 }}
                icon="plus"
              >
                Add Zimbabwe Sources
              </Button>
            </View>
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
    padding: 16,
  },
  title: {
    fontWeight: '700',
  },
  list: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 100,
  },
  sourceCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  disabledCard: {
    opacity: 0.6,
  },
  sourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sourceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#5e577210',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  sourceInfo: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sourceMeta: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 12,
  },
  metaItem: {
    gap: 2,
  },
  sourceUrl: {
    marginTop: 4,
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
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
