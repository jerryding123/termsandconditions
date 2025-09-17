import { chakra, HTMLChakraProps, Image, Flex, Text, useColorModeValue } from '@chakra-ui/react'

export const Logo: React.FC<HTMLChakraProps<'div'>> = (props) => {
  const textColor = useColorModeValue('#231f20', '#fff')
  
  return (
    <chakra.div {...props}>
      <Flex align="center">
        <Image 
          src="/static/images/termsandconditions.png" 
          alt="Terms & Conditions Logo" 
          maxHeight="35px"
        />
        <Text 
          ml={3} 
          fontSize="xl" 
          fontWeight="semibold" 
          color={textColor}
        >
          Terms & Conditions
        </Text>
      </Flex>
    </chakra.div>
  )
}