import React from 'react'
import { TextInput, StyleSheet, View, Text } from 'react-native'
import { colors, radius, typography } from '@/src/theme'

interface InputProps {
  value: string
  onChangeText: (text: string) => void
  onFocus?: () => void
  placeholder?: string
  label?: string
  secureTextEntry?: boolean
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad'
  style?: object
  inputStyle?: object
  leftAccessory?: React.ReactNode
  rightAccessory?: React.ReactNode
  testID?: string
  accessibilityLabel?: string
}

export function Input({
  value,
  onChangeText,
  onFocus,
  placeholder,
  label,
  secureTextEntry = false,
  keyboardType = 'default',
  style,
  inputStyle,
  leftAccessory,
  rightAccessory,
  testID,
  accessibilityLabel,
}: InputProps) {
  const generatedTestID = label
    ? `${label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')}-input`
    : undefined

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputShell, inputStyle]}>
        {leftAccessory}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          style={styles.input}
          accessibilityLabel={accessibilityLabel ?? label}
          testID={testID ?? generatedTestID}
          onFocus={onFocus}
          onChange={(event) => onChangeText(event.nativeEvent.text)}
          onEndEditing={(event) => onChangeText(event.nativeEvent.text)}
        />
        {rightAccessory}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
    marginLeft: 4,
    marginBottom: 8,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    backgroundColor: colors.stone,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 8,
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: colors.stoneText,
  },
})
