import { Box, Text, Image, Stack } from "@chakra-ui/react";
import { FC } from "react";
import { Product } from "online-shop-sdk";

type ProductItemProps = {
  product: Product;
  onClick: () => void;
};

export const ProductItem: FC<ProductItemProps> = ({ product, onClick }) => {
  return (
    <Stack
      spacing={1}
      bg="gray.100"
      rounded="lg"
      transition="transform 150ms, shadow, 150ms"
      cursor="pointer"
      shadow="md"
      _hover={{ transform: "scale(1.03) translateY(-5px)", shadow: "lg" }}
      onClick={onClick}
    >
      <Image src={product.imageUrl} w="100%" rounded="lg" />
      <Stack
        paddingX="3"
        w="100%"
        h="38px"
        overflow="hidden"
        justifyContent="center"
      >
        <Text fontSize="13">{product.name}</Text>
      </Stack>
      <Text fontSize="13" fontWeight="bold" paddingX="3" pb="2" w="100%">
        S/ {product.price}
      </Text>
    </Stack>
  );
};
