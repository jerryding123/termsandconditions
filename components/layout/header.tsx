import {
  Box,
  BoxProps,
  Container,
  Flex,
  useColorModeValue,
  HStack,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Text,
  Spinner,
  MenuDivider,
} from '@chakra-ui/react'
import { useScroll } from 'framer-motion'
import { FiChevronDown, FiHelpCircle, FiLogOut, FiUser } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { Logo } from './logo'
import Navigation from './navigation'
import { supabase } from '../../lib/supabase'

// Basic user type if Supabase types aren't available
interface BasicUser {
  id: string;
  email?: string;
  user_metadata?: {
    avatar_url?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface HeaderProps extends Omit<BoxProps, 'children'> {}

export const Header = (props: HeaderProps) => {
  const ref = React.useRef<HTMLHeadingElement>(null)
  const [y, setY] = React.useState(0)
  const [user, setUser] = React.useState<BasicUser | null>(null)
  const [loading, setLoading] = React.useState(true)
  const router = useRouter()
  
  const { height = 0 } = ref.current?.getBoundingClientRect() ?? {}
  const { scrollY } = useScroll()
  
  React.useEffect(() => {
    return scrollY.on('change', () => setY(scrollY.get()))
  }, [scrollY])

  // Check authentication status
  React.useEffect(() => {
    checkUser()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const bg = useColorModeValue('whiteAlpha.700', 'rgba(29, 32, 37, 0.7)')

  return (
    <Box
      ref={ref}
      as="header"
      top="0"
      w="full"
      position="fixed"
      backdropFilter="blur(5px)"
      zIndex="sticky"
      borderColor="whiteAlpha.100"
      transitionProperty="common"
      transitionDuration="normal"
      bg={y > height ? bg : ''}
      boxShadow={y > height ? 'md' : ''}
      borderBottomWidth={y > height ? '1px' : ''}
      {...props}
    >
      <Container maxW="container.xl" px={{ base: "4", lg: "12" }}>
        <Flex width="full" position="relative" py="4" align="center">
          {/* Logo positioned flush left on mobile, with inset on desktop */}
          <Box
            position="absolute"
            left={{ base: "0", lg: "8" }}
            top="50%"
            transform="translateY(-50%)"
          >
            <Logo
              onClick={(e: React.MouseEvent) => {
                if (window.location.pathname === '/') {
                  e.preventDefault()
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                  })
                }
              }}
            />
          </Box>

          {/* Navigation - only show main nav links, not auth buttons */}
          <Box width="full">
            <Navigation centerLinks={true} insetButtons={true} mobileMode={true} showAuthButtons={false} />
          </Box>

          {/* Auth Section - positioned on the right */}
          <Box
            position="absolute"
            right={{ base: "0", lg: "8" }}
            top="50%"
            transform="translateY(-50%)"
          >
            {loading ? (
              <Spinner size="sm" color="white" />
            ) : user ? (
              // Signed in - show user dropdown
              <Menu>
                <MenuButton
                  as={Button}
                  variant="ghost"
                  color="white"
                  _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                  _active={{ bg: 'rgba(255, 255, 255, 0.2)' }}
                  rightIcon={<FiChevronDown />}
                  size="sm"
                  borderRadius="full"
                >
                  <HStack spacing={2}>
                    <Avatar 
                      size="xs" 
                      name={user.email || 'User'} 
                      src={user.user_metadata?.avatar_url}
                    />
                    <Text display={{ base: 'none', md: 'block' }} fontSize="sm">
                      {user.email?.split('@')[0] || 'User'}
                    </Text>
                  </HStack>
                </MenuButton>
                <MenuList
                  bg="rgba(255, 255, 255, 0.1)"
                  backdropFilter="blur(10px)"
                  border="1px solid rgba(255, 255, 255, 0.2)"
                  borderRadius="12px"
                  color="white"
                >
                  <MenuItem
                    icon={<FiUser />}
                    bg="transparent"
                    _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                    onClick={() => router.push('/account')}
                  >
                    Account
                  </MenuItem>
                  <MenuItem
                    icon={<FiHelpCircle />}
                    bg="transparent"
                    _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                    onClick={() => router.push('/help')}
                  >
                    Help
                  </MenuItem>
                  <MenuDivider borderColor="rgba(255, 255, 255, 0.2)" />
                  <MenuItem
                    icon={<FiLogOut />}
                    bg="transparent"
                    _hover={{ bg: 'rgba(255, 0, 0, 0.1)' }}
                    color="red.300"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              // Not signed in - show login/signup buttons
              <HStack spacing={2}>
                <Button
                  variant="ghost"
                  color="white"
                  _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                  size="sm"
                  onClick={() => router.push('/login')}
                >
                  Sign in
                </Button>
                <Button
                  colorScheme="primary"
                  color="black"
                  size="sm"
                  borderRadius="full"
                  fontWeight="bold"
                  onClick={() => router.push('/signup')}
                >
                  Sign up
                </Button>
              </HStack>
            )}
          </Box>
        </Flex>
      </Container>
    </Box>
  )
}