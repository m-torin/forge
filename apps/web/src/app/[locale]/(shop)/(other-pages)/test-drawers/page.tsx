"use client";

import { getProductsAction } from "@/actions/data-service-actions";
import { type TProductItem } from "@/lib/data-service";
import { Badge, Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import { useState } from "react";
import { useEffect } from "react";

import { ProductCard } from "@repo/design-system/mantine-ciseco";

export default function TestDrawersPage() {
  const [products, setProducts] = useState<TProductItem[]>([]);
  const [testResults, setTestResults] = useState<{
    cartDrawer: any;
    navigationDrawer: any;
    productQuickView: any;
  }>({
    cartDrawer: null,
    navigationDrawer: null,
    productQuickView: null,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProductsAction();
      setProducts(data.slice(0, 3)); // Get first 3 products for testing
    };
    fetchProducts();
  }, []);

  const testCartDrawer = () => {
    try {
      // Click the cart icon in the header
      const cartButton = document.querySelector('[data-testid="cart-button"]');

      if (cartButton) {
        (cartButton as HTMLElement).click();
        setTimeout(() => {
          // Check if drawer opened and has content
          const drawer = document.querySelector('[role="dialog"]');
          const cartContent = drawer
            ?.querySelector("h2")
            ?.textContent?.includes("Shopping Cart");
          const hasProducts =
            (drawer?.querySelectorAll('[role="list"] > div')?.length || 0) > 0;

          setTestResults((prev) => ({
            ...prev,
            cartDrawer: {
              details: {
                drawerFound: Boolean(drawer),
                productCount:
                  drawer?.querySelectorAll('[role="list"] > div').length || 0,
                productsFound: hasProducts,
                titleFound: Boolean(cartContent),
              },
              message:
                drawer && cartContent && hasProducts
                  ? "Cart drawer opened successfully with products"
                  : "Cart drawer failed to open or show content",
              success: Boolean(drawer && cartContent && hasProducts),
            },
          }));

          // Close the drawer
          const closeButton = drawer?.querySelector(
            'button[aria-label*="Close"]',
          );
          if (closeButton) (closeButton as HTMLElement).click();
        }, 500);
      } else {
        setTestResults((prev) => ({
          ...prev,
          cartDrawer: {
            details: { cartButtonFound: false },
            message: "Cart button not found in header",
            success: false,
          },
        }));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setTestResults((prev) => ({
        ...prev,
        cartDrawer: {
          details: { error: errorMessage },
          message: `Error: ${errorMessage}`,
          success: false,
        },
      }));
    }
  };

  const testNavigationDrawer = () => {
    try {
      // Click the menu icon in the header
      const menuButton = document.querySelector(
        '[data-testid="hamburger-menu"]',
      );

      if (menuButton) {
        (menuButton as HTMLElement).click();
        setTimeout(() => {
          // Check if drawer opened and has navigation items
          const drawer = document.querySelector('[role="dialog"]');
          const hasLogo =
            drawer?.querySelector('img[alt*="logo" i]') ||
            drawer?.querySelector("svg");
          const navItems = drawer?.querySelectorAll("a[href]").length || 0;

          setTestResults((prev) => ({
            ...prev,
            navigationDrawer: {
              details: {
                drawerFound: Boolean(drawer),
                logoFound: Boolean(hasLogo),
                navItemCount: navItems,
                navItemsFound: navItems > 0,
              },
              message:
                drawer && hasLogo && navItems > 0
                  ? `Navigation drawer opened successfully with ${navItems} menu items`
                  : "Navigation drawer failed to open or show content",
              success: Boolean(drawer && hasLogo && navItems > 0),
            },
          }));

          // Close the drawer
          const closeButton = drawer?.querySelector(
            'button[aria-label*="Close"]',
          );
          if (closeButton) (closeButton as HTMLElement).click();
        }, 500);
      } else {
        setTestResults((prev) => ({
          ...prev,
          navigationDrawer: {
            details: { menuButtonFound: false },
            message: "Menu button not found in header",
            success: false,
          },
        }));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setTestResults((prev) => ({
        ...prev,
        navigationDrawer: {
          details: { error: errorMessage },
          message: `Error: ${errorMessage}`,
          success: false,
        },
      }));
    }
  };

  const testProductQuickView = () => {
    try {
      // First, hover over the product card to reveal the quick view button
      const productCard = document.querySelector(
        '[data-testid="product-card"]',
      );

      if (productCard) {
        // Trigger hover event to show the quick view button
        const hoverEvent = new MouseEvent("mouseenter", {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        productCard.dispatchEvent(hoverEvent);

        // Wait a bit for the hover effect to show the button
        setTimeout(() => {
          // Click the quick view button
          const quickViewButton = document.querySelector(
            '[data-testid="product-card-quick-view-button"]',
          );

          if (quickViewButton) {
            (quickViewButton as HTMLElement).click();
            setTimeout(() => {
              // Check if drawer opened and has product details
              const drawer = document.querySelector('[role="dialog"]');
              const hasTitle = drawer?.textContent?.includes("Product Details");
              const hasProductInfo =
                drawer?.querySelector('[class*="AccordionInfo"]') ||
                drawer?.querySelector('h2[class*="ProductCard__title"]');
              const hasAddToCart = drawer
                ?.querySelector("button")
                ?.textContent?.includes("Add to");

              setTestResults((prev) => ({
                ...prev,
                productQuickView: {
                  details: {
                    addToCartFound: Boolean(hasAddToCart),
                    drawerFound: Boolean(drawer),
                    productInfoFound: Boolean(hasProductInfo),
                    titleFound: Boolean(hasTitle),
                  },
                  message:
                    drawer && (hasTitle || hasProductInfo) && hasAddToCart
                      ? "Product quick view drawer opened successfully with product details"
                      : "Product quick view drawer failed to open or show content",
                  success: Boolean(
                    drawer && (hasTitle || hasProductInfo) && hasAddToCart,
                  ),
                },
              }));

              // Close the drawer
              const closeButton = drawer?.querySelector(
                'button[aria-label*="Close"]',
              );
              if (closeButton) (closeButton as HTMLElement).click();
            }, 500);
          } else {
            setTestResults((prev) => ({
              ...prev,
              productQuickView: {
                details: { quickViewButtonFound: false },
                message: "Quick view button not found on product card",
                success: false,
              },
            }));
          }
        }, 300); // Wait for hover effect
      } else {
        setTestResults((prev) => ({
          ...prev,
          productQuickView: {
            details: { productCardFound: false },
            message: "Product card not found on page",
            success: false,
          },
        }));
      }
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        productQuickView: {
          details: {
            error: error instanceof Error ? error.message : String(error),
          },
          message: `Error: ${error instanceof Error ? error.message : String(error)}`,
          success: false,
        },
      }));
    }
  };

  const runAllTests = () => {
    setTestResults({
      cartDrawer: null,
      navigationDrawer: null,
      productQuickView: null,
    });

    // Run tests sequentially with delays
    setTimeout(testCartDrawer, 100);
    setTimeout(testNavigationDrawer, 2000);
    setTimeout(testProductQuickView, 4000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Title order={1} className="mb-8">
        Drawer Functionality Test Page
      </Title>

      <Stack gap="lg">
        <Card shadow="sm" withBorder padding="lg" radius="md">
          <Title order={3} className="mb-4">
            Test Controls
          </Title>
          <Group>
            <Button onClick={testCartDrawer} variant="outline">
              Test Cart Drawer
            </Button>
            <Button onClick={testNavigationDrawer} variant="outline">
              Test Navigation Drawer
            </Button>
            <Button onClick={testProductQuickView} variant="outline">
              Test Product Quick View
            </Button>
            <Button onClick={runAllTests} variant="filled">
              Run All Tests
            </Button>
          </Group>
        </Card>

        <Card shadow="sm" withBorder padding="lg" radius="md">
          <Title order={3} className="mb-4">
            Test Results
          </Title>
          <Stack gap="md">
            {Object.entries(testResults).map(([key, result]) => (
              <Card key={key} withBorder padding="sm">
                <Group className="mb-2" justify="space-between">
                  <Text fw={500}>
                    {key === "cartDrawer" && "Cart Drawer"}
                    {key === "navigationDrawer" && "Navigation Drawer"}
                    {key === "productQuickView" && "Product Quick View"}
                  </Text>
                  {result && (
                    <Badge color={result.success ? "green" : "red"}>
                      {result.success ? "PASSED" : "FAILED"}
                    </Badge>
                  )}
                </Group>
                {result && (
                  <>
                    <Text color="dimmed" className="mb-2" size="sm">
                      {result.message}
                    </Text>
                    {result.details && (
                      <Card withBorder bg="gray.0" padding="xs">
                        <Text ff="monospace" size="xs">
                          {JSON.stringify(result.details, null, 2)}
                        </Text>
                      </Card>
                    )}
                  </>
                )}
                {!result && (
                  <Text color="dimmed" size="sm">
                    Not tested yet
                  </Text>
                )}
              </Card>
            ))}
          </Stack>
        </Card>

        <Card shadow="sm" withBorder padding="lg" radius="md">
          <Title order={3} className="mb-4">
            Sample Products (for Quick View Testing)
          </Title>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} data={product} />
            ))}
          </div>
        </Card>

        <Card shadow="sm" withBorder padding="lg" radius="md">
          <Title order={3} className="mb-4">
            Manual Testing Instructions
          </Title>
          <Stack gap="sm">
            <Text>
              1. <strong>Cart Drawer:</strong> Click the cart icon in the
              header. The drawer should slide in from the right showing cart
              items.
            </Text>
            <Text>
              2. <strong>Navigation Drawer:</strong> Click the menu icon in the
              header. The drawer should slide in from the right showing
              navigation menu.
            </Text>
            <Text>
              3. <strong>Product Quick View:</strong> Hover over any product
              card above and click the "Quick view" button. A drawer should open
              with product details.
            </Text>
          </Stack>
        </Card>
      </Stack>
    </div>
  );
}
