import { HStack, Flex, Box, Grid, GridItem } from '@chakra-ui/react'
import { useDisclosure, useUpdateEffect } from '@chakra-ui/react'
import { useScrollSpy } from 'hooks/use-scrollspy'
import { usePathname, useRouter } from 'next/navigation'
import * as React from 'react'
import { MobileNavButton } from '#components/mobile-nav'
import { MobileNavContent } from '#components/mobile-nav'
import { NavLink } from '#components/nav-link'
import siteConfig from '#data/config'
import ThemeToggle from './theme-toggle'

interface NavigationProps {
  centerLinks?: boolean;
  insetButtons?: boolean;
  mobileMode?: boolean;
  showAuthButtons?: boolean; // New prop to control whether to show auth-related buttons
}

type NavLinkType = {
  id?: string;
  href?: string;
  label: string;
  variant?: string;
  [key: string]: any;
}

const Navigation: React.FC<NavigationProps> = ({ 
  centerLinks = false, 
  insetButtons = false,
  mobileMode = false,
  showAuthButtons = true // Default to true for backward compatibility
}) => {
  const mobileNav = useDisclosure()
  const router = useRouter()
  const path = usePathname()
  const activeId = useScrollSpy(
    siteConfig.header.links
      .filter(({ id }) => id)
      .map(({ id }) => `[id="${id}"]`),
    {
      threshold: 0.75,
    },
  )
  
  const mobileNavBtnRef = React.useRef<HTMLButtonElement>()
  
  useUpdateEffect(() => {
    mobileNavBtnRef.current?.focus()
  }, [mobileNav.isOpen])
  
  // Filter links based on showAuthButtons prop
  let navLinks: NavLinkType[] = siteConfig.header.links
  let downloadButton: NavLinkType | null = null
  
  if (!showAuthButtons) {
    // Remove download/auth related links when auth is handled elsewhere
    navLinks = siteConfig.header.links.filter(link => 
      !link.href?.includes('app.') && // Remove app store links
      link.label !== 'Download' &&
      link.label !== 'Sign in' &&
      link.label !== 'Sign up'
    )
  } else {
    // Original behavior - split navigation
    navLinks = siteConfig.header.links.slice(0, -1)
    downloadButton = siteConfig.header.links[siteConfig.header.links.length - 1]
  }
  
  if (centerLinks) {
    return (
      <Grid templateColumns="1fr auto 1fr" width="100%" gap={4}>
        {/* Left column - empty to balance with right column */}
        <GridItem />
        
        {/* Center column - navigation links */}
        <GridItem>
          <Flex justify="center" align="center">
            {navLinks.map(({ href, id, ...props }, i) => {
              return (
                <NavLink
                  display={['none', null, 'block']}
                  href={href || `/#${id}`}
                  key={i}
                  mx={1}
                  px={3}
                  borderRadius="md"
                  _hover={{
                    bg: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                  }}
                  transition="all 0.2s ease"
                  isActive={
                    !!(
                      (id && activeId === id) ||
                      (href && !!path?.match(new RegExp(href)))
                    )
                  }
                  {...props}
                >
                  {props.label}
                </NavLink>
              )
            })}
          </Flex>
        </GridItem>
        
        {/* Right column - Download button (if showAuthButtons), theme toggle, mobile nav */}
        <GridItem>
          <HStack 
            spacing={2} 
            justify="flex-end" 
            pr={insetButtons ? { base: mobileMode ? 0 : 6, lg: 8 } : 0}
          >
            {/* Only show download button if showAuthButtons is true and downloadButton exists */}
            {showAuthButtons && downloadButton && (
              <NavLink
                display={['none', null, 'block']}
                href={downloadButton.href || `/#${downloadButton.id}`}
                isActive={
                  !!(
                    (downloadButton.id && activeId === downloadButton.id) ||
                    (downloadButton.href && !!path?.match(new RegExp(downloadButton.href)))
                  )
                }
                {...downloadButton}
              >
                {downloadButton.label}
              </NavLink>
            )}
            
            <Box>
              <ThemeToggle />
            </Box>
            
            <Box>
              <MobileNavButton
                ref={mobileNavBtnRef}
                aria-label="Open Menu"
                onClick={mobileNav.onOpen}
              />
            </Box>
            
            <MobileNavContent isOpen={mobileNav.isOpen} onClose={mobileNav.onClose} />
          </HStack>
        </GridItem>
      </Grid>
    )
  }
  
  // Original layout if centerLinks is false
  return (
    <HStack spacing="2" flexShrink={0}>
      {navLinks.map(({ href, id, ...props }, i) => {
        return (
          <NavLink
            display={['none', null, 'block']}
            href={href || `/#${id}`}
            key={i}
            px={3}
            borderRadius="md"
            _hover={{
              bg: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
            transition="all 0.2s ease"
            isActive={
              !!(
                (id && activeId === id) ||
                (href && !!path?.match(new RegExp(href)))
              )
            }
            {...props}
          >
            {props.label}
          </NavLink>
        )
      })}
      
      {/* Only show download button and theme toggle if showAuthButtons is true */}
      {showAuthButtons && downloadButton && (
        <NavLink
          display={['none', null, 'block']}
          href={downloadButton.href || `/#${downloadButton.id}`}
          isActive={
            !!(
              (downloadButton.id && activeId === downloadButton.id) ||
              (downloadButton.href && !!path?.match(new RegExp(downloadButton.href)))
            )
          }
          {...downloadButton}
        >
          {downloadButton.label}
        </NavLink>
      )}
      
      <ThemeToggle />
      <MobileNavButton
        ref={mobileNavBtnRef}
        aria-label="Open Menu"
        onClick={mobileNav.onOpen}
      />
      <MobileNavContent isOpen={mobileNav.isOpen} onClose={mobileNav.onClose} />
    </HStack>
  )
}

export default Navigation