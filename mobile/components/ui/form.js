/**
 * Form - shadcn-style form components for React Native
 * Copy-paste component with NativeWind (Tailwind CSS)
 * Mukoko brand styling with Nyuchi Brand System v6
 */

import React from 'react';
import { View, Text, TextInput as RNTextInput } from 'react-native';

export function Form({ children, className = '' }) {
  return <View className={`gap-lg ${className}`}>{children}</View>;
}

export function FormField({
  label,
  error,
  hint,
  required = false,
  children,
  className = '',
}) {
  return (
    <View className={className}>
      {label && (
        <Text className="font-sans-medium text-label-large text-on-surface mb-xs">
          {label}
          {required && <Text className="text-error"> *</Text>}
        </Text>
      )}

      {children}

      {hint && !error && (
        <Text className="font-sans text-body-small text-on-surface-variant mt-xs">
          {hint}
        </Text>
      )}

      {error && (
        <Text className="font-sans text-body-small text-error mt-xs">
          {error}
        </Text>
      )}
    </View>
  );
}

export function FormLabel({ children, required = false, className = '' }) {
  return (
    <Text className={`font-sans-medium text-label-large text-on-surface mb-xs ${className}`}>
      {children}
      {required && <Text className="text-error"> *</Text>}
    </Text>
  );
}

export function FormDescription({ children, className = '' }) {
  return (
    <Text className={`font-sans text-body-small text-on-surface-variant ${className}`}>
      {children}
    </Text>
  );
}

export function FormMessage({ error, className = '' }) {
  if (!error) return null;

  return (
    <Text className={`font-sans text-body-small text-error ${className}`}>
      {error}
    </Text>
  );
}

export function TextInput({
  value,
  onChangeText,
  placeholder,
  error,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  multiline = false,
  className = '',
  ...props
}) {
  const hasError = Boolean(error);

  return (
    <View
      className={`
        flex-row items-center rounded-button border px-md
        ${multiline ? 'min-h-[100px] py-md' : 'h-touch'}
        ${hasError ? 'border-error' : 'border-outline'}
        bg-surface
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {LeftIcon && (
        <View className="mr-sm">
          <LeftIcon size={20} color={hasError ? '#B3261E' : '#4a4a4a'} />
        </View>
      )}

      <RNTextInput
        className={`flex-1 font-sans text-body-medium text-on-surface ${multiline ? 'text-top' : ''}`}
        placeholderTextColor="#4a4a4a"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        {...props}
      />

      {RightIcon && (
        <View className="ml-sm">
          <RightIcon size={20} color="#4a4a4a" />
        </View>
      )}
    </View>
  );
}

export function Select({
  value,
  onValueChange,
  placeholder,
  options = [],
  error,
  className = '',
}) {
  // Note: This is a simplified select. For production, use a proper picker library
  // like @react-native-picker/picker or react-native-dropdown-picker

  return (
    <View
      className={`
        rounded-button border px-md h-touch flex-row items-center justify-between
        ${error ? 'border-error' : 'border-outline'}
        bg-surface
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      <Text className={`font-sans text-body-medium ${value ? 'text-on-surface' : 'text-on-surface-variant'}`}>
        {value || placeholder}
      </Text>
      {/* Add chevron down icon here */}
    </View>
  );
}

export function Checkbox({
  checked = false,
  onCheckedChange,
  label,
  error,
  className = '',
}) {
  // Note: This is a simplified checkbox. For production, use a proper checkbox library
  // or Expo Checkbox

  return (
    <View className={className}>
      <View className="flex-row items-center">
        <View
          className={`
            w-5 h-5 rounded border-2 items-center justify-center mr-sm
            ${checked ? 'bg-tanzanite border-tanzanite' : 'border-outline bg-surface'}
            ${error ? 'border-error' : ''}
          `.trim().replace(/\s+/g, ' ')}
        >
          {checked && (
            <Text className="text-white text-xs">✓</Text>
          )}
        </View>
        {label && (
          <Text className="font-sans text-body-medium text-on-surface flex-1">
            {label}
          </Text>
        )}
      </View>
    </View>
  );
}
