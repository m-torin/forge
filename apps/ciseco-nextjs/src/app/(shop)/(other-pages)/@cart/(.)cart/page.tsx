import CartPage from '@/app/(shop)/(other-pages)/cart/page';
import CartDrawer from '@/components/CartDrawer';

export default function InterceptedCartPage() {
  return (
    <CartDrawer>
      <CartPage />
    </CartDrawer>
  );
}