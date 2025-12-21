/**
 * Form - shadcn-style form components for React Native
 * Copy-paste component with NativeWind (Tailwind CSS)
 * Mukoko brand styling with Nyuchi Brand System v6
 */

import React, { useState } from 'react';
import { View, Text, TextInput as RNTextInput, Pressable, Modal, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

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
  onBlur,
  placeholder,
  error,
  setError,
  validate,
  required = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  multiline = false,
  className = '',
  ...props
}) {
  const { theme } = useTheme();
  const hasError = Boolean(error);

  const handleChangeText = (text) => {
    // Clear error when user starts typing
    if (hasError && setError) {
      setError(null);
    }

    if (onChangeText) {
      onChangeText(text);
    }
  };

  const handleBlur = (e) => {
    // Validate on blur if validation function provided
    if (validate && setError) {
      const validationError = validate(value);
      if (validationError) {
        setError(validationError);
      }
    }

    // Check required field
    if (required && !value && setError) {
      setError('This field is required');
    }

    if (onBlur) {
      onBlur(e);
    }
  };

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
          <LeftIcon size={20} color={hasError ? theme.colors.error : theme.colors['on-surface-variant']} />
        </View>
      )}

      <RNTextInput
        className={`flex-1 font-sans text-body-medium text-on-surface ${multiline ? 'text-top' : ''}`}
        placeholderTextColor={theme.colors['on-surface-variant']}
        value={value}
        onChangeText={handleChangeText}
        onBlur={handleBlur}
        placeholder={placeholder}
        multiline={multiline}
        {...props}
      />

      {RightIcon && (
        <View className="ml-sm">
          <RightIcon size={20} color={theme.colors['on-surface-variant']} />
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
  setError,
  required = false,
  validate,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption?.label || value || placeholder;

  const handleSelect = (optionValue) => {
    // Clear error when user selects
    if (error && setError) {
      setError(null);
    }

    // Validate new value if validation function provided
    if (validate && setError) {
      const validationError = validate(optionValue);
      if (validationError) {
        setError(validationError);
      }
    }

    if (onValueChange) {
      onValueChange(optionValue);
    }
    setIsOpen(false);
  };

  const handleOpen = () => {
    // Validate on open if required and empty
    if (required && !value && setError) {
      setError('Please select an option');
    }
    setIsOpen(true);
  };

  return (
    <>
      <Pressable
        className={`
          rounded-button border px-md h-touch flex-row items-center justify-between
          ${error ? 'border-error' : 'border-outline'}
          bg-surface
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        onPress={handleOpen}
        accessibilityRole="button"
        accessibilityLabel={`Select ${placeholder || 'option'}`}
        accessibilityHint={value ? `Currently selected: ${displayText}` : 'Tap to select an option'}
      >
        <Text className={`font-sans text-body-medium ${value ? 'text-on-surface' : 'text-on-surface-variant'}`}>
          {displayText}
        </Text>
        <Text className="text-on-surface-variant">▼</Text>
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
        accessibilityViewIsModal
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setIsOpen(false)}
          accessibilityRole="button"
          accessibilityLabel="Close selection"
        >
          <View
            className="bg-surface rounded-card max-h-[400px] w-[80%] max-w-[300px]"
            onStartShouldSetResponder={() => true}
            accessibilityRole="menu"
          >
            <ScrollView className="max-h-[400px]">
              {options.map((option, index) => (
                <Pressable
                  key={option.value || index}
                  className={`px-lg py-md border-b border-outline ${value === option.value ? 'bg-tanzanite-container' : ''}`}
                  onPress={() => handleSelect(option.value)}
                  accessibilityRole="menuitem"
                  accessibilityLabel={option.label}
                  accessibilityState={{ selected: value === option.value }}
                >
                  <Text className={`font-sans text-body-medium ${value === option.value ? 'text-tanzanite font-sans-medium' : 'text-on-surface'}`}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

export function Checkbox({
  checked = false,
  onCheckedChange,
  label,
  error,
  required = false,
  className = '',
}) {
  const handlePress = () => {
    if (onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  return (
    <Pressable
      className={className}
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
    >
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
            {required && <Text className="text-error"> *</Text>}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
