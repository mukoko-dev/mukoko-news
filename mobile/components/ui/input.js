/**
 * Input - shadcn-style input component for React Native
 * Copy-paste component with NativeWind (Tailwind CSS)
 * Mukoko brand styling with Nyuchi Brand System v6
 */

import React, { useState } from 'react';
import { View, TextInput, Text, Pressable } from 'react-native';
import { Search, X } from 'lucide-react-native';

export function Input({
  label,
  error,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  containerClassName = '',
  ...props
}) {
  const hasError = Boolean(error);

  return (
    <View className={containerClassName}>
      {label && (
        <Text className="font-sans-medium text-label-large text-on-surface mb-xs">
          {label}
        </Text>
      )}
      <View
        className={`
          flex-row items-center rounded-button border px-md h-touch
          ${hasError ? 'border-error' : 'border-outline'}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
      >
        {LeftIcon && (
          <View className="mr-sm">
            <LeftIcon size={20} color={hasError ? '#B3261E' : '#4a4a4a'} />
          </View>
        )}
        <TextInput
          className="flex-1 font-sans text-body-medium text-on-surface"
          placeholderTextColor="#4a4a4a"
          {...props}
        />
        {RightIcon && (
          <View className="ml-sm">
            <RightIcon size={20} color="#4a4a4a" />
          </View>
        )}
      </View>
      {hasError && (
        <Text className="font-sans text-body-small text-error mt-xs">
          {error}
        </Text>
      )}
    </View>
  );
}

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Search...',
  showClear = true,
  className = '',
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View
      className={`
        flex-row items-center rounded-button border px-md h-touch bg-surface
        ${isFocused ? 'border-tanzanite' : 'border-outline'}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      <Search size={20} color={isFocused ? '#4B0082' : '#4a4a4a'} />
      <TextInput
        className="flex-1 ml-sm font-sans text-body-medium text-on-surface"
        placeholder={placeholder}
        placeholderTextColor="#4a4a4a"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType="search"
        {...props}
      />
      {showClear && value?.length > 0 && (
        <Pressable onPress={handleClear} className="ml-sm">
          <X size={20} color="#4a4a4a" />
        </Pressable>
      )}
    </View>
  );
}
