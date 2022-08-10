import { Text, SimpleGrid } from "@chakra-ui/react";
import { FC } from "react";
import { ProductItem } from "../../components";
import { useProducts } from "../../controllers";

type ProductGridProps = {
  onProductSelect: (productId: string) => void;
};

export const ProductGrid: FC<ProductGridProps> = ({ onProductSelect }) => {
  const { products, isLoading } = useProducts();

  if (isLoading) {
    return <Text>Loading</Text>;
  }

  return (
    <SimpleGrid columns={[1, 2, 2, 3, 4, 5]} spacing={5} padding="5">
      {products?.map((product, index) => (
        <ProductItem
          key={index}
          product={product}
          onClick={() => onProductSelect(product.id)}
        />
      ))}
    </SimpleGrid>
  );
};
