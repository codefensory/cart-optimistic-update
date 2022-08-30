import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderLine, Product } from "online-shop-sdk";
import { onlineShop } from "../../shared/onlineShop";

export const useSetOrderLine = () => {
  const queryClient = useQueryClient();

  const localCart = useLocalCart();

  const addOrderLineMutation = useMutation(
    async (vars: {
      productId: Product["id"];
      quantity?: OrderLine["quantity"];
    }) => {
      localCart.addOrderLine(vars.productId, vars.quantity);

      const currentQuantity = localCart.getLine(vars.productId).quantity;

      const spot = createSpot(
        onlineShop.order.addLine(vars.productId, vars.quantity),
        {
          id: "add",
          depends: ["update"],
          group: vars.productId,
          value: currentQuantity,
          onError: () => {
            localCart.deleteOrderLine(vars.productId, vars.quantity);
          },
        }
      );

      return spot.promise();
    }
  );

  const updateOrderlineMutation = useMutation(
    async (vars: {
      productId: Product["id"];
      quantity: OrderLine["quantity"];
    }) => {
      localCart.updateLine(vars.productId, vars.quantity);

      const spot = createSpot(
        vars.productId,
        onlineShop.order.updateLine(vars.productId, vars.quantity),
        {
          id: "update",
          depends: ["add"],
          canReplace: true,
          value: vars.quantity,
          onError: ({ spot, prevValue }) => {
            if (spot.isLast) {
              localCart.updateLine(vars.productId, prevValue);
            }
          },
        }
      );

      return spot.promise();
    }
  );

  const deleteOrderLineMutation = useMutation(onlineShop.order.deleteLine);

  return {
    addLine: addOrderLineMutation,
    deleteLine: deleteOrderLineMutation,
  };
};
