import { getProducts } from '@/actions/products';
import { Title, Stack, Alert, Text, Card } from '@mantine/core';

export default async function TestDrawersManualPage() {
  // Get sample products for testing quick view
  const productsResult = await getProducts({ limit: 3 });
  const sampleProducts = productsResult.data;

  return (
    <div className="container mx-auto px-4 py-8">
      <Title order={1} className="mb-8">
        Manual Drawer Testing Page
      </Title>

      <Stack gap="xl">
        <Alert c="blue" radius="sm" title="Important">
          <Text>
            This page helps you manually test all drawer functionality. Use the header buttons to
            test cart and navigation drawers. Use the product cards below to test quick view
            drawers.
          </Text>
        </Alert>

        <Card shadow="sm" withBorder={true} padding="lg" radius="sm">
          <Title order={2} className="mb-4">
            Test Instructions
          </Title>
          <Stack gap="md">
            <Card withBorder={true} padding="sm" radius="sm">
              <Title order={4} className="mb-2 text-blue-600">
                1. Cart Drawer Test
              </Title>
              <Text className="mb-2" size="md">
                Click the cart icon in the header (top right). The cart drawer should:
              </Text>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>Slide in from the right</li>
                <li>Display "Shopping Cart" as the title</li>
                <li>Show 3 products (Basic Tee, Basic Coahuila, Nomad Tumbler)</li>
                <li>Display subtotal of $199</li>
                <li>Have "View cart" and "Check out" buttons</li>
                <li>Close when clicking the X or outside the drawer</li>
              </ul>
            </Card>

            <Card withBorder={true} padding="sm" radius="sm">
              <Title order={4} className="mb-2 text-green-600">
                2. Navigation Drawer Test
              </Title>
              <Text className="mb-2" size="md">
                Click the menu icon in the header (top right, near cart). The navigation drawer
                should:
              </Text>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>Slide in from the right</li>
                <li>Display the logo at the top</li>
                <li>Show a search bar</li>
                <li>
                  Display navigation menu items (Home, Shop, Beauty, Sport, Templates, Explore)
                </li>
                <li>Show expandable submenu items with chevron icons</li>
                <li>Have social media icons</li>
                <li>Close when clicking a link or the X button</li>
              </ul>
            </Card>

            <Card withBorder={true} padding="sm" radius="sm">
              <Title order={4} className="mb-2 text-purple-600">
                3. Product Quick View Test
              </Title>
              <Text className="mb-2" size="md">
                Hover over any product card below and click the "Quick view" button. The drawer
                should:
              </Text>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>Slide in from the right (wider than other drawers)</li>
                <li>Display "Product Details" as the title</li>
                <li>Show product images gallery</li>
                <li>Display product name, price, and rating</li>
                <li>Show size and color options</li>
                <li>Have quantity selector</li>
                <li>Display "Add to bag" button</li>
                <li>Show product description in accordion</li>
                <li>Close when clicking the X button</li>
              </ul>
            </Card>
          </Stack>
        </Card>

        <Card shadow="sm" withBorder={true} padding="lg" radius="sm">
          <Title order={2} className="mb-6">
            Sample Products for Quick View Testing
          </Title>
          <Text color="dimmed" className="mb-4" size="md">
            Hover over these products and click "Quick view" to test the product details drawer
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sampleProducts.map((product: any) => (
              <Card key={product.id} shadow="sm" padding="lg" radius="sm" withBorder={true}>
                <Text fw={500}>{product.title}</Text>
                <Text size="md" c="dimmed">
                  {product.description}
                </Text>
                <Text fw={700} c="blue">
                  ${product.priceRange.minVariantPrice.amount}
                </Text>
              </Card>
            ))}
          </div>
        </Card>

        <Card shadow="sm" withBorder={true} padding="lg" radius="sm">
          <Title order={3} className="mb-4">
            Expected Behavior Summary
          </Title>
          <Stack gap="sm">
            <div>
              <Text className="mb-1" fw={500}>
                ✅ Cart Drawer
              </Text>
              <Text color="dimmed" size="md">
                Should display cart items from getCart() function with product images, names,
                prices, and quantities.
              </Text>
            </div>
            <div>
              <Text className="mb-1" fw={500}>
                ✅ Navigation Drawer
              </Text>
              <Text color="dimmed" size="md">
                Should display navigation menu from getNavigation() function with expandable
                submenus.
              </Text>
            </div>
            <div>
              <Text className="mb-1" fw={500}>
                ✅ Product Quick View
              </Text>
              <Text color="dimmed" size="md">
                Should fetch and display full product details from getProductByHandle() when quick
                view is clicked.
              </Text>
            </div>
          </Stack>
        </Card>

        <Card shadow="sm" withBorder={true} bg="gray.0" padding="lg" radius="sm">
          <Title order={3} className="mb-4">
            Troubleshooting
          </Title>
          <Text className="mb-2" size="md">
            If any drawer doesn't show content:
          </Text>
          <ul className="list-decimal list-inside text-sm space-y-1 ml-4">
            <li>Check browser console for errors</li>
            <li>
              Verify data fetching functions are working (getCart, getNavigation,
              getProductByHandle)
            </li>
            <li>Ensure drawer components are properly imported</li>
            <li>Check if loading states are stuck</li>
            <li>Verify CSS classes aren't hiding content</li>
          </ul>
        </Card>
      </Stack>
    </div>
  );
}
