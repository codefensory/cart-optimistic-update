import { Box, VStack, HStack, Text, Divider } from "@chakra-ui/react";
import { ProductGrid } from "../../modules/product/views/productsGrid";

export const MainPage = () => {
  return (
    <HStack w="100vw" h="100vh" pt={4} pl={4}>
      <Box w="50%" h="100%">
        <Text fontSize="18" mb={2}>
          Commits information
        </Text>
        <Divider />
      </Box>
      <Box w="50%" h="100%">
        <VStack w="100%" h="100%">
          <Box w="100%" h="50%">
            <Text fontSize="18" mb={2}>
              Shopping Cart
            </Text>
            <Divider />
          </Box>
          <Box w="100%" h="50%">
            <Text fontSize="18" mb={2}>
              Products
              <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                (Click to add to cart)
              </span>
            </Text>
            <Divider />
            <Box w="100%" h="calc(100% - 36px)" overflow="auto">
              <ProductGrid onProductSelect={() => {}} />
            </Box>
          </Box>
        </VStack>
      </Box>
    </HStack>
  );
};
