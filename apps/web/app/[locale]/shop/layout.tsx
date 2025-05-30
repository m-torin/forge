import React from "react";

import ProtectedRoute from "../../../components/auth/protected-route";

interface ShopLayoutProps {
  analytics: React.ReactNode;
  children: React.ReactNode;
  inventory: React.ReactNode;
  modal: React.ReactNode;
  orders: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export default async function ShopLayout({
  analytics,
  children,
  inventory,
  modal,
  orders,
  params,
}: ShopLayoutProps) {
  const { locale } = await params;

  return (
    <ProtectedRoute locale={locale}>
      <div className="min-h-screen bg-gray-50">
        {/* Main content area */}
        <div className="container mx-auto px-4 py-8">
          {/* Header section */}
          <div className="mb-8">{children}</div>

          {/* Parallel routes dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Analytics section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Analytics
                </h2>
                {analytics}
              </div>
            </div>

            {/* Inventory section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Inventory
                </h2>
                {inventory}
              </div>
            </div>

            {/* Orders section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Recent Orders
                </h2>
                {orders}
              </div>
            </div>
          </div>
        </div>

        {/* Modal overlay for intercepting routes */}
        {modal}
      </div>
    </ProtectedRoute>
  );
}
