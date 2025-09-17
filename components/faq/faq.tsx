import {
  chakra,
  Box,
  Flex,
  Text,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Accordion,
  Container
} from '@chakra-ui/react'
import { Section, SectionProps, SectionTitle } from 'components/section'

interface FaqProps extends Omit<SectionProps, 'title' | 'children'> {
  title?: React.ReactNode
  description?: React.ReactNode
  items: { q: React.ReactNode; a: React.ReactNode }[]
}

export const Faq: React.FC<FaqProps> = (props) => {
  const {
    title = 'Frequently asked questions',
    description,
    items = [],
  } = props

  return (
    <Section id="faq">
      <SectionTitle title={title} description={description} />
      <Container maxW="container.md" px={{ base: 4, md: 8 }}>
        <Box
          bg="rgba(255, 255, 255, 0.05)"
          backdropFilter="blur(10px)"
          borderRadius="xl"
          overflow="hidden"
          borderWidth="1px"
          borderColor="rgba(255, 255, 255, 0.1)"
          boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
        >
          <Accordion allowToggle>
            {items.map((item, i) => (
              <AccordionItem
                key={i}
                border="none"
                borderBottom={i !== items.length - 1 ? "1px solid rgba(255, 255, 255, 0.06)" : "none"}
                transition="all 0.3s ease"
                _hover={{
                  bg: "rgba(255, 255, 255, 0.08)",
                }}
              >
                <AccordionButton
                  py={6}
                  px={6}
                  _hover={{ bg: "transparent" }}
                  _focus={{ boxShadow: "none" }}
                >
                  <Box flex="1" textAlign="left">
                    <Text
                      fontWeight="medium"
                      fontSize="xl"
                      color="gray.800"
                      _dark={{ color: "white" }}
                    >
                      {item.q}
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel
                  pb={6}
                  px={6}
                  pt={4}
                  color="muted"
                  borderTop="1px solid rgba(255, 255, 255, 0.06)"
                >
                  <Text whiteSpace="pre-line">
                    {item.a}
                  </Text>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Box>
      </Container>
    </Section>
  )
}