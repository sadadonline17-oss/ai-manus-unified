/**
 * Syrian Sovereign Emerald UI Components
 * ========================================
 * Reusable UI components following the design system.
 * 
 * @design Syrian Sovereign Emerald – New Identity Edition
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Theme Colors
export const Theme = {
  colors: {
    primary: '#0F3D2E',
    primaryDark: '#0B2F24',
    secondary: '#1C5C45',
    accentGold: '#C9A646',
    accentSoftGold: '#E5C878',
    background: '#071F18',
    surface: 'rgba(15,61,46,0.90)',
    glassSurface: 'rgba(255,255,255,0.05)',
    borderGold: 'rgba(201,166,70,0.30)',
    borderGoldSoft: 'rgba(201,166,70,0.15)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.75)',
    textMuted: 'rgba(255,255,255,0.5)',
  },
  gradients: {
    mainBackground: ['#0B2F24', '#071F18'],
    goldAccent: ['#C9A646', '#E5C878'],
  },
  borderRadius: {
    card: 22,
    button: 14,
    input: 14,
  },
};

// Card Component
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'glass' | 'elevated';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  const cardStyle = [
    styles.card,
    variant === 'glass' && styles.cardGlass,
    variant === 'elevated' && styles.cardElevated,
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
}

// Primary Button with Gold Gradient
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'small' | 'medium' | 'large';
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  style,
  textStyle,
  size = 'medium',
}: ButtonProps) {
  const sizeStyles = {
    small: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 13 },
    medium: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 15 },
    large: { paddingVertical: 18, paddingHorizontal: 32, fontSize: 17 },
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[styles.buttonWrapper, style]}
      >
        <LinearGradient
          colors={disabled ? ['#45475a', '#45475a'] : Theme.gradients.goldAccent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.buttonPrimary,
            { paddingVertical: sizeStyles[size].paddingVertical, paddingHorizontal: sizeStyles[size].paddingHorizontal },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={Theme.colors.primary} size="small" />
          ) : (
            <>
              {icon && iconPosition === 'left' && (
                <Ionicons name={icon} size={18} color={Theme.colors.primary} style={styles.iconLeft} />
              )}
              <Text style={[styles.buttonPrimaryText, { fontSize: sizeStyles[size].fontSize }, textStyle]}>
                {title}
              </Text>
              {icon && iconPosition === 'right' && (
                <Ionicons name={icon} size={18} color={Theme.colors.primary} style={styles.iconRight} />
              )}
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          styles.buttonSecondary,
          { paddingVertical: sizeStyles[size].paddingVertical, paddingHorizontal: sizeStyles[size].paddingHorizontal },
          disabled && styles.buttonDisabled,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={Theme.colors.textPrimary} size="small" />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <Ionicons name={icon} size={18} color={Theme.colors.textPrimary} style={styles.iconLeft} />
            )}
            <Text style={[styles.buttonSecondaryText, { fontSize: sizeStyles[size].fontSize }, textStyle]}>
              {title}
            </Text>
            {icon && iconPosition === 'right' && (
              <Ionicons name={icon} size={18} color={Theme.colors.textPrimary} style={styles.iconRight} />
            )}
          </>
        )}
      </TouchableOpacity>
    );
  }

  // Outline variant
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.buttonOutline,
        { paddingVertical: sizeStyles[size].paddingVertical, paddingHorizontal: sizeStyles[size].paddingHorizontal },
        disabled && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={Theme.colors.accentGold} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon} size={18} color={Theme.colors.accentGold} style={styles.iconLeft} />
          )}
          <Text style={[styles.buttonOutlineText, { fontSize: sizeStyles[size].fontSize }, textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon} size={18} color={Theme.colors.accentGold} style={styles.iconRight} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

// Input Field Component
interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  editable?: boolean;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  icon,
  error,
  multiline = false,
  numberOfLines = 1,
  style,
  editable = true,
}: InputProps) {
  return (
    <View style={[styles.inputWrapper, style]}>
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {icon && (
          <Ionicons name={icon} size={20} color={Theme.colors.textMuted} style={styles.inputIcon} />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Theme.colors.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            { textAlignVertical: multiline ? 'top' : 'center' },
          ]}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// Section Header Component
interface SectionHeaderProps {
  title: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={action.onPress}>
          <Text style={styles.sectionAction}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Badge Component
interface BadgeProps {
  text: string;
  variant?: 'success' | 'warning' | 'error' | 'info';
  style?: ViewStyle;
}

export function Badge({ text, variant = 'info', style }: BadgeProps) {
  const variantStyles = {
    success: { backgroundColor: '#a6e3a1' },
    warning: { backgroundColor: Theme.colors.accentGold },
    error: { backgroundColor: '#f38ba8' },
    info: { backgroundColor: Theme.colors.secondary },
  };

  return (
    <View style={[styles.badge, variantStyles[variant], style]}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
}

// Divider Component
export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[styles.divider, style]} />;
}

// Icon Button Component
interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export function IconButton({
  icon,
  onPress,
  size = 24,
  color = Theme.colors.accentGold,
  backgroundColor,
  style,
}: IconButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.iconButton, backgroundColor && { backgroundColor }, style]}
    >
      <Ionicons name={icon} size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Card
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.card,
    borderWidth: 1,
    borderColor: Theme.colors.borderGoldSoft,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  cardGlass: {
    backgroundColor: Theme.colors.glassSurface,
    borderWidth: 1,
    borderColor: Theme.colors.borderGoldSoft,
  },
  cardElevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },

  // Button
  buttonWrapper: {
    borderRadius: Theme.borderRadius.button,
    overflow: 'hidden',
    shadowColor: Theme.colors.accentGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 6,
  },
  buttonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Theme.borderRadius.button,
  },
  buttonPrimaryText: {
    fontWeight: '600',
    color: Theme.colors.primary,
  },
  buttonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: Theme.borderRadius.button,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  buttonSecondaryText: {
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  buttonOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: Theme.borderRadius.button,
    borderWidth: 1,
    borderColor: Theme.colors.accentGold,
  },
  buttonOutlineText: {
    fontWeight: '600',
    color: Theme.colors.accentGold,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },

  // Input
  inputWrapper: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: Theme.borderRadius.input,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 16,
  },
  inputError: {
    borderColor: '#f38ba8',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: Theme.colors.textPrimary,
  },
  inputMultiline: {
    minHeight: 100,
    paddingTop: 14,
  },
  errorText: {
    color: '#f38ba8',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  sectionAction: {
    fontSize: 14,
    color: Theme.colors.accentGold,
    fontWeight: '500',
  },

  // Badge
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.primary,
    textTransform: 'uppercase',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: Theme.colors.borderGoldSoft,
    marginVertical: 16,
  },

  // Icon Button
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export { Theme };