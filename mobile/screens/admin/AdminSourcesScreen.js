import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  Pressable,
  Switch,
  Text as RNText,
} from 'react-native';
import { Loader2, Plus } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { admin } from '../../api/client';
import AdminHeader from '../../components/AdminHeader';
import AdminScreenWrapper from '../../components/AdminScreenWrapper';
import { Button, LoadingState, Badge } from '../../components/ui';

/**
 * Admin Sources Screen
 * Manage RSS news sources
 *
 * Migration: NativeWind + Lucide only (NO React Native Paper, NO StyleSheet)
 */
export default function AdminSourcesScreen({ navigation }) {
  const theme = useTheme();
  const { isAdmin } = useAuth();
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  const loadSources = useCallback(async () => {
    setError(null);
    try {
      const result = await admin.getSources();
      if (result.data) {
        setSources(result.data.sources || []);
      }
    } catch (err) {
      console.error('[Admin] Load sources error:', err);
      setError('Failed to load sources. Please try again.');
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
      <View className="flex-1 justify-center items-center bg-background">
        <RNText className="font-serif-bold text-headline-small text-on-surface">
          Access Denied
        </RNText>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center px-lg bg-background">
        <RNText className="font-serif-bold text-headline-small text-on-surface mb-sm">
          Something went wrong
        </RNText>
        <RNText className="font-sans text-body-medium text-on-surface-variant mb-lg text-center">
          {error}
        </RNText>
        <Pressable
          className="py-md px-xl rounded-button min-h-touch bg-tanzanite"
          onPress={loadSources}
          accessibilityLabel="Try again"
          accessibilityRole="button"
        >
          <RNText className="font-sans-bold text-label-large text-on-primary">
            Try Again
          </RNText>
        </Pressable>
      </View>
    );
  }

  const enabledCount = sources.filter((s) => s.enabled).length;

  const renderSource = ({ item: source }) => (
    <View
      className={`mb-md rounded-card bg-surface border border-outline overflow-hidden ${
        !source.enabled ? 'opacity-60' : ''
      }`}
    >
      <View className="p-lg">
        <View className="flex-row items-center mb-md">
          <View className="w-[44px] h-[44px] rounded-button bg-surface-variant justify-center items-center mr-md">
            <RNText className="text-[20px]">📰</RNText>
          </View>
          <View className="flex-1">
            <RNText className="font-sans-bold text-title-medium text-on-surface">
              {source.name}
            </RNText>
            {source.category && (
              <Badge variant="outline" size="sm" className="mt-xs self-start">
                {source.category}
              </Badge>
            )}
          </View>
          {actionLoading === source.id ? (
            <Loader2 size={20} color={theme.colors.tanzanite} className="animate-spin" />
          ) : (
            <Switch
              value={source.enabled}
              onValueChange={() => handleToggleSource(source.id, source.enabled)}
              trackColor={{ false: theme.colors['surface-variant'], true: theme.colors.tanzanite }}
              thumbColor={source.enabled ? theme.colors['on-primary'] : theme.colors['on-surface-variant']}
              accessibilityLabel={`Toggle ${source.name}`}
              accessibilityRole="switch"
              accessibilityState={{ checked: source.enabled }}
            />
          )}
        </View>

        <View className="flex-row gap-xl mb-md">
          <View className="gap-[2px]">
            <RNText className="font-sans text-body-small text-on-surface-variant">
              Articles
            </RNText>
            <RNText className="font-sans-bold text-title-small text-on-surface">
              {source.article_count || 0}
            </RNText>
          </View>
          <View className="gap-[2px]">
            <RNText className="font-sans text-body-small text-on-surface-variant">
              Last Fetched
            </RNText>
            <RNText className="font-sans-bold text-title-small text-on-surface">
              {formatDate(source.last_fetched)}
            </RNText>
          </View>
        </View>

        <RNText
          className="font-sans text-body-small text-tanzanite mt-xs"
          numberOfLines={1}
        >
          {source.url}
        </RNText>
      </View>
    </View>
  );

  return (
    <AdminScreenWrapper>
      <View className="flex-1 bg-background">
        <AdminHeader navigation={navigation} currentScreen="AdminSources" />

        {/* Header */}
        <View className="flex-row items-center justify-between px-lg py-md">
          <View>
            <RNText className="font-serif-bold text-headline-small text-on-surface mb-xs">
              News Sources
            </RNText>
            <RNText className="font-sans text-body-medium text-on-surface-variant">
              {enabledCount} active of {sources.length} sources
            </RNText>
          </View>
          <Pressable
            onPress={handleAddZimbabweSources}
            disabled={actionLoading === 'add'}
            className="flex-row items-center gap-xs py-sm px-md rounded-button bg-tanzanite min-h-touch-compact"
            accessibilityLabel="Add Zimbabwe sources"
            accessibilityRole="button"
            accessibilityState={{ disabled: actionLoading === 'add' }}
          >
            {actionLoading === 'add' ? (
              <Loader2 size={16} color="#FFFFFF" className="animate-spin" />
            ) : (
              <Plus size={16} color="#FFFFFF" />
            )}
            <RNText className="font-sans-bold text-label-large text-on-primary">
              Add ZW
            </RNText>
          </Pressable>
        </View>

        {/* Sources List */}
        {loading ? (
          <LoadingState message="Loading sources..." />
        ) : (
          <FlatList
            data={sources}
            renderItem={renderSource}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.tanzanite]}
              />
            }
            ListEmptyComponent={
              <View className="p-xxl items-center">
                <RNText className="text-[48px] mb-lg">📡</RNText>
                <RNText className="font-serif-bold text-title-medium text-on-surface mb-sm">
                  No sources configured
                </RNText>
                <RNText className="font-sans text-body-medium text-on-surface-variant text-center mb-lg">
                  Add news sources to start aggregating articles
                </RNText>
                <Pressable
                  onPress={handleAddZimbabweSources}
                  className="flex-row items-center gap-sm py-md px-lg rounded-button bg-tanzanite min-h-touch"
                  accessibilityLabel="Add Zimbabwe sources"
                  accessibilityRole="button"
                >
                  <Plus size={18} color="#FFFFFF" />
                  <RNText className="font-sans-bold text-label-large text-on-primary">
                    Add Zimbabwe Sources
                  </RNText>
                </Pressable>
              </View>
            }
          />
        )}
      </View>
    </AdminScreenWrapper>
  );
}
