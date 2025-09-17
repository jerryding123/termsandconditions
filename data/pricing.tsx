import { HStack, Text } from '@chakra-ui/react'

export default {
  title: 'Simple Pricing',
  description: 'Simple, transparent pricing for everyone.',
  plans: [
    {
      id: 'free',
      title: 'Basic',
      description: 'Try for Free',
      price: 'Free',
      features: [
        {
          title: '3 Sessions',
        },
        {
          title: '10 Copilot Use',
        },
        {
          title: 'Standard AI Models',
        },
      ],
      action: {
        href: 'https://github.com/jerryding123/interview-pilot-desktop-releases/releases/download/v1.0.0/Interview.Pilot-1.0.0-arm64.dmg',
        label: 'Try for Free',
      },
      // Removed isRecommended from free plan
    },
    {
      id: 'plus',
      title: 'Plus',
      description: 'Popular',
      price: '$59 / month',
      features: [
        {
          title: '400 Copilot Use Weekly',
        },
        {
          title: 'Unlimited Sessions',
        },
        {
          title: 'Most Powerful AI Models',
        },
        {
          title: 'Full Profile & Documents',
        },
        {
          title: 'Full Customization',
        },
        {
          title: 'Unlimited Interview History',
        },
        {
          title: 'Full Customer Support',
        },
        null,
        {
          title: 'Get 400 Copilot Use Weekly!',
          iconColor: 'green.500',
        },
      ],
      action: {
        stripePriceId: 'price_1RV1N6D3Mf1DO6dwv4p27uKL', // Replace with your Plus Stripe Price ID
        label: 'Start Plus Plan (macOS)',
        requiresAuth: true,
      },
      // No isRecommended for Plus
    },
    {
      id: 'pro',
      title: 'Pro',
      description: 'Best Value',
      price: (
        <HStack spacing={1}>
          <Text as="span">$49 / month</Text>
          <Text as="span" fontSize="sm" color="gray.500">billed quarterly</Text>
        </HStack>
      ),
      isRecommended: true, // Moved recommended to Pro
      features: [
        {
          title: '1,000 Copilot Use Weekly',
        },
        {
          title: 'Unlimited Sessions',
        },
        {
          title: 'Most Powerful AI Models',
        },
        {
          title: 'Full Profile & Documents',
        },
        {
          title: 'Full Customization',
        },
        {
          title: 'Unlimited Interview History',
        },
        {
          title: 'Full Customer Support',
        },
        null,
        {
          title: 'Get 1,000 Copilot Use Weekly!',
          iconColor: 'green.500',
        },
      ],
      action: {
        stripePriceId: 'price_1RV1N9D3Mf1DO6dwA56Br2WP', // Replace with your Pro Stripe Price ID
        label: 'Start Pro Plan (macOS)',
        requiresAuth: true,
      },
    },
    {
      id: 'pro-plus',
      title: 'Pro+',
      description: 'Our Top Plan',
      price: (
        <HStack spacing={1}>
          <Text as="span">$80 / month</Text>
          <Text as="span" fontSize="sm" color="gray.500">billed bi-yearly</Text>
        </HStack>
      ),
      isRecommended: false,
      features: [
        {
          title: 'Unlimited Minutes',
        },
        {
          title: 'Unlimited Copilot Use',
        },
        {
          title: 'Unlimited Sessions',
        },
        {
          title: 'Most Powerful AI Models',
        },
        {
          title: 'Full Profile & Documents',
        },
        {
          title: 'Full Copilot Customization',
        },
        {
          title: 'Unlimited Interview History',
        },
        {
          title: 'Priority Customer Support',
        },
        null,
        {
          title: 'Get Unlimited Copilot Use! Interview with full peace of mind.',
          iconColor: 'green.500',
        },
      ],
      action: {
        stripePriceId: 'price_1RV1NCD3Mf1DO6dwOQI0Cp01', // Replace with your Pro+ Stripe Price ID
        label: 'Start Pro+ Plan (macOS)',
        requiresAuth: true,
      },
    },
  ],
}