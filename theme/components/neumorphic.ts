import { useColorModeValue } from '@chakra-ui/react'

// Neumorphic theme utilities based on your SwiftUI implementation
export const useNeumorphicTheme = () => {
  // Background colors matching page background (gray.50/gray.900)
  const backgroundColor = useColorModeValue(
    '#f9fafb', // Light mode: matches gray.50
    '#1a202c'  // Dark mode: matches gray.900
  )
  
  // Shadow colors adjusted for lighter background - stronger light shadow for better pop-out
  const lightShadowColor = useColorModeValue(
    'rgba(255, 255, 255, 1.0)',       // Stronger/brighter white shadow for light mode
    'rgba(255, 255, 255, 0.08)'       // Slightly stronger white shadow for dark mode
  )
  
  const darkShadowColor = useColorModeValue(
    'rgba(0, 0, 0, 0.15)',            // Stronger dark shadow for light mode
    'rgba(0, 0, 0, 0.6)'              // Black shadow for dark mode
  )

  // Text colors
  const textColor = useColorModeValue('gray.800', 'gray.100')
  const placeholderColor = useColorModeValue('gray.500', 'gray.400')

  // Neumorphic shadow presets - more subtle
  const getRaisedShadow = (size: 'sm' | 'md' | 'lg' = 'md') => {
    const shadows = {
      sm: useColorModeValue(
        `-2px -2px 4px ${lightShadowColor}, 2px 2px 4px ${darkShadowColor}`,
        `-2px -2px 4px ${lightShadowColor}, 2px 2px 4px ${darkShadowColor}`
      ),
      md: useColorModeValue(
        `-3px -3px 6px ${lightShadowColor}, 3px 3px 6px ${darkShadowColor}`,
        `-3px -3px 6px ${lightShadowColor}, 3px 3px 6px ${darkShadowColor}`
      ),
      lg: useColorModeValue(
        `-4px -4px 8px ${lightShadowColor}, 4px 4px 8px ${darkShadowColor}`,
        `-4px -4px 8px ${lightShadowColor}, 4px 4px 8px ${darkShadowColor}`
      )
    }
    return shadows[size]
  }

  const getInsetShadow = (size: 'sm' | 'md' | 'lg' = 'md') => {
    const shadows = {
      sm: `inset 1px 1px 2px ${darkShadowColor}, inset -1px -1px 2px ${lightShadowColor}`,
      md: `inset 2px 2px 4px ${darkShadowColor}, inset -2px -2px 4px ${lightShadowColor}`,
      lg: `inset 3px 3px 6px ${darkShadowColor}, inset -3px -3px 6px ${lightShadowColor}`
    }
    return shadows[size]
  }

  // Button interaction shadows - more subtle
  const getButtonHoverShadow = () => useColorModeValue(
    `-2px -2px 4px ${lightShadowColor}, 2px 2px 4px ${darkShadowColor}`,
    `-2px -2px 4px ${lightShadowColor}, 2px 2px 4px ${darkShadowColor}`
  )

  const getButtonActiveShadow = () => 
    `inset 1px 1px 2px ${darkShadowColor}, inset -1px -1px 2px ${lightShadowColor}`

  return {
    backgroundColor,
    lightShadowColor,
    darkShadowColor,
    textColor,
    placeholderColor,
    getRaisedShadow,
    getInsetShadow,
    getButtonHoverShadow,
    getButtonActiveShadow,
  }
}

// Neumorphic component style presets
export const neumorphicStyles = {
  // Container styles
  container: (theme: ReturnType<typeof useNeumorphicTheme>) => ({
    bg: theme.backgroundColor,
    boxShadow: theme.getRaisedShadow('md'),
    borderRadius: '24px',
    transition: 'all 0.3s ease',
  }),

  // Card styles
  card: (theme: ReturnType<typeof useNeumorphicTheme>) => ({
    bg: theme.backgroundColor,
    boxShadow: theme.getRaisedShadow('sm'),
    borderRadius: '20px',
    border: 'none',
  }),

  // Input/Textarea styles (inset effect)
  input: (theme: ReturnType<typeof useNeumorphicTheme>) => ({
    bg: 'transparent',
    border: 'none',
    boxShadow: theme.getInsetShadow('sm'),
    borderRadius: '16px',
    color: theme.textColor,
    _placeholder: { color: theme.placeholderColor },
    _focus: {
      outline: 'none',
      boxShadow: theme.getInsetShadow('md'),
    },
  }),

  // Button styles
  button: (theme: ReturnType<typeof useNeumorphicTheme>) => ({
    bg: theme.backgroundColor,
    color: theme.textColor,
    border: 'none',
    boxShadow: theme.getRaisedShadow('sm'),
    _hover: {
      bg: theme.backgroundColor,
      boxShadow: theme.getButtonHoverShadow(),
      transform: 'translateY(-1px)',
    },
    _active: {
      boxShadow: theme.getButtonActiveShadow(),
      transform: 'translateY(1px)',
    },
    transition: 'all 0.2s ease',
  }),

  // Badge/Tag styles
  badge: (theme: ReturnType<typeof useNeumorphicTheme>) => ({
    bg: theme.backgroundColor,
    color: theme.textColor,
    boxShadow: theme.getInsetShadow('sm'),
    border: 'none',
  }),
}