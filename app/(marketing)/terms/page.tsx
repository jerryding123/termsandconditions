'use client'

import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react'

export default function TermsPage() {
  return (
    <Container maxW="container.md" py={16} mt={10}>
      <Heading as="h1" size="xl" mb={6} pt={8}>
        Terms of Service
      </Heading>
      <VStack spacing={6} align="stretch">

        <Text fontWeight="bold">
          Welcome to Terms & Conditions! Before you access our services, please read these Terms of Service.
        </Text>

        <Text>
          Terms & Conditions is a brand owned by Liberace AI (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;). Liberace AI operates the Terms & Conditions iOS application and provides related products and services (collectively, the &quot;Services&quot;). These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;you,&quot; &quot;your&quot;) and Liberace AI, governing your access to and use of the Services. You agree that by downloading, installing, or accessing the Services, you have read, understood, and agreed to be bound by these Terms. IF YOU DO NOT AGREE WITH ALL OF THESE TERMS, THEN YOU ARE PROHIBITED FROM USING THE SERVICES AND MUST IMMEDIATELY DISCONTINUE USE.
        </Text>
        
        <Text fontWeight="bold">
          ARBITRATION NOTICE AND CLASS ACTION WAIVER: EXCEPT FOR CERTAIN TYPES OF DISPUTES DESCRIBED IN THE ARBITRATION SECTION BELOW, YOU AGREE THAT DISPUTES BETWEEN YOU AND US WILL BE RESOLVED BY BINDING, INDIVIDUAL ARBITRATION AND YOU WAIVE YOUR RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION.
        </Text>

        <Box>
          <Heading as="h2" size="md" mb={2}>
            1. SERVICE OVERVIEW AND LICENSE TERMS
          </Heading>
          
          <Text fontWeight="bold" mt={3}>1.1 Description of Services</Text>
          <Text>
            Liberace AI provides Terms & Conditions, an AI-powered iOS application that assists with job interview preparation and real-time interview support. The app records live interview questions and generates AI responses to help users during interviews. The Services include both free and premium subscription offerings, with the free version providing limited functionality. All audio processing happens on your device, and Terms & Conditions does not control your device or make decisions on your behalf.
          </Text>
          
          <Text fontWeight="bold" mt={3}>1.2 License Grant</Text>
          <Text>
            Subject to your compliance with these Terms, Liberace AI grants you a non-exclusive, non-transferable, revocable, limited license to download, install, and use the Services for your personal interview preparation. Your right to use the Services is conditional upon your compliance with these Terms. You shall not modify, distribute, sell, lease, loan, or create derivative works based on the Services or any part thereof. The Services are licensed, not sold, to you.
          </Text>
        </Box>
        
        <Box>
          <Heading as="h2" size="md" mb={2}>
            2. USER ACCOUNTS AND PAYMENT
          </Heading>
          
          <Text fontWeight="bold" mt={3}>2.1 Account Registration</Text>
          <Text>
            You may need to create an Apple ID to download and use the Services. You are entirely responsible for the security and confidentiality of your Apple account, including your password. Furthermore, you are entirely responsible for any and all activities that occur under your Apple account when using our Services.
          </Text>
          
          <Text fontWeight="bold" mt={3}>2.2 Payment Terms</Text>
          <Text>
            All payments and subscriptions are processed through Apple&apos;s App Store. The subscription includes full access to Terms & Conditions features, automatic updates, and customer support. By subscribing to our paid services, you agree to the App Store&apos;s payment terms and authorize Apple to charge your chosen payment method. Subscription management, including cancellation, is handled through your Apple ID account settings.
          </Text>
        </Box>
        
        <Box>
          <Heading as="h2" size="md" mb={2}>
            3. ACCEPTABLE USE AND RESTRICTIONS
          </Heading>
          
          <Text fontWeight="bold" mt={3}>3.1 Prohibited Uses</Text>
          <Text>You agree not to:</Text>
          <Text ml={5}>• Share your account credentials with others</Text>
          <Text ml={5}>• Attempt to reverse engineer the software</Text>
          <Text ml={5}>• Use the service for any illegal purposes</Text>
          <Text ml={5}>• Interfere with or disrupt the service</Text>
          <Text ml={5}>• Use the Services in a manner that violates any applicable local, state, national, or international law or regulation</Text>
          <Text ml={5}>• Use the Services to misrepresent your qualifications or abilities in employment scenarios</Text>
          <Text ml={5}>• Use the Services in violation of any employer policies or interview protocols that explicitly forbid external assistance</Text>
        </Box>
        
        <Box>
          <Heading as="h2" size="md" mb={2}>
            4. INTELLECTUAL PROPERTY
          </Heading>
          
          <Text>
            All content generated using our service during your use is owned by you, but the software, branding, algorithms, and infrastructure remain the intellectual property of Liberace AI. We reserve all rights not expressly granted to you in and to the Services. Any breach of our intellectual property rights will constitute a material breach of our Terms and your right to use our Services will terminate immediately.
          </Text>
        </Box>
        
        <Box>
          <Heading as="h2" size="md" mb={2}>
            5. LEGAL TERMS AND CONDITIONS
          </Heading>
          
          <Text fontWeight="bold" mt={3}>5.1 Disclaimer of Warranties</Text>
          <Text>
            THE SERVICES ARE PROVIDED ON AN &quot;AS IS,&quot; &quot;WITH ALL FAULTS,&quot; AND &quot;AS AVAILABLE&quot; BASIS. TO THE FULLEST EXTENT PERMISSIBLE PURSUANT TO APPLICABLE LAW, LIBERACE AI DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </Text>
          
          <Text fontWeight="bold" mt={3}>5.2 Limitation of Liability</Text>
          <Text>
            IN NO EVENT SHALL LIBERACE AI, ITS OWNER, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES.
          </Text>
          
          <Text fontWeight="bold" mt={3}>5.3 No Guarantee of Results</Text>
          <Text>
            WE DO NOT GUARANTEE THE ACCURACY, COMPLETENESS, OR EFFECTIVENESS OF INTERVIEW COACHING OR ANY AI-GENERATED CONTENT. YOU ARE RESPONSIBLE FOR YOUR OWN DECISIONS AND OUTCOMES BASED ON THE SERVICE&apos;S RECOMMENDATIONS. WE DO NOT GUARANTEE ANY INTERVIEW RESULTS, AND YOU WAIVE YOUR RIGHT TO SUE FOR ANY CONSEQUENCES OF USING THIS SERVICE.
          </Text>
          <Text mt={2}>
            Terms & Conditions is a tool to assist users with interview preparation but does not guarantee job offers, interview success, or career advancement. Any decisions based on the service&apos;s insights are solely your responsibility.
          </Text>
          
          <Text fontWeight="bold" mt={3}>5.4 Arbitration Agreement</Text>
          <Text>
            All claims and disputes arising out of or relating to these Terms or your use of the Services shall be settled by binding arbitration, except for disputes in which either party seeks equitable relief for the alleged unlawful use of copyrights, trademarks, trade names, logos, trade secrets, or patents.
          </Text>
          <Text mt={2}>
            ALL CLAIMS AND DISPUTES MUST BE ARBITRATED OR LITIGATED ON AN INDIVIDUAL BASIS AND NOT ON A CLASS BASIS. ANY CLAIM OR DISPUTE ARISING OUT OF OR RELATED TO THE TERMS OR THE SERVICES IS PERSONAL TO YOU AND LIBERACE AI AND WILL BE RESOLVED SOLELY THROUGH INDIVIDUAL ARBITRATION AND WILL NOT BE BROUGHT AS A CLASS ARBITRATION, CLASS ACTION, OR ANY OTHER TYPE OF REPRESENTATIVE PROCEEDING.
          </Text>
        </Box>
        
        <Box>
          <Heading as="h2" size="md" mb={2}>
            6. MISCELLANEOUS
          </Heading>
          
          <Text>
            These Terms may be updated periodically. Continued use of the service constitutes acceptance of any changes. If you have any questions about these Terms, please contact us at Support@LiberaceAI.com.
          </Text>
        </Box>
        
        <Text fontStyle="italic" mt={4} color="gray.600">
          Last updated: May 12, 2025
        </Text>
      </VStack>
    </Container>
  )
}