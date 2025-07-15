/**
 * API Testing E2E Test Template
 * Copy this file to your app's e2e folder and customize
 */

import {
  APIAssertions,
  APITestUtils,
  EnvironmentData,
  expect,
  GraphQLTestUtils,
  test,
  TestDataGenerator,
} from '@repo/qa/playwright';

test.describe('API Testing', () => {
  let apiUtils: APITestUtils;
  let apiUrl: string;

  test.beforeEach(async ({ request: request }) => {
    apiUtils = new APITestUtils(request);
    apiUrl = EnvironmentData.getApiUrl();
  });

  test('health check endpoint should return 200', async () => {
    const isHealthy = await apiUtils.checkHealth();
    expect(isHealthy).toBeTruthy();
  });

  test('should handle authenticated API requests', async ({ request }) => {
    // Get auth token (customize based on your auth implementation)
    const authResponse = await request.post(`${apiUrl}/auth/sign-in`, {
      data: {
        email: EnvironmentData.getTestUser().email,
        password: EnvironmentData.getTestUser().password,
      },
    });

    const { token } = await authResponse.json();

    // Make authenticated request
    const response = await apiUtils.authenticatedRequest('GET', `${apiUrl}/user/profile`, {
      token,
    });

    APIAssertions.assertStatus(response, 200);

    const profile = await response.json();
    expect(profile).toHaveProperty('email');
    expect(profile).toHaveProperty('id');
  });

  test('should handle CRUD operations', async ({ request }) => {
    // Create
    const newItem = {
      name: TestDataGenerator.product().name,
      description: 'Test item',
    };

    const createResponse = await apiUtils.postJSON(`${apiUrl}/items`, newItem);
    expect(createResponse).toHaveProperty('id');
    const itemId = (createResponse as any).id;

    // Read
    const getResponse = await apiUtils.getJSON(`${apiUrl}/items/${itemId}`);
    expect(getResponse).toMatchObject(newItem);

    // Update
    const updateData = { name: 'Updated name' };
    const updateResponse = await request.patch(`${apiUrl}/items/${itemId}`, {
      data: updateData,
    });
    APIAssertions.assertStatus(updateResponse, 200);

    // Delete
    const deleteResponse = await request.delete(`${apiUrl}/items/${itemId}`);
    APIAssertions.assertStatus(deleteResponse, 204);

    // Verify deletion
    const verifyResponse = await request.get(`${apiUrl}/items/${itemId}`);
    APIAssertions.assertStatus(verifyResponse, 404);
  });

  test('should validate API error handling', async ({ request }) => {
    // Test 400 Bad Request
    const badResponse = await request.post(`${apiUrl}/items`, {
      data: {}, // Missing required fields
    });
    APIAssertions.assertStatus(badResponse, 400);

    const errorData = await badResponse.json();
    expect(errorData).toHaveProperty('error');

    // Test 404 Not Found
    const notFoundResponse = await request.get(`${apiUrl}/items/nonexistent`);
    APIAssertions.assertStatus(notFoundResponse, 404);

    // Test 401 Unauthorized
    const unauthorizedResponse = await request.get(`${apiUrl}/protected`);
    APIAssertions.assertStatus(unauthorizedResponse, 401);
  });

  test('should handle pagination', async () => {
    // First page
    const page1 = await apiUtils.getJSON<{
      data: any[];
      meta: { page: number; totalPages: number };
    }>(`${apiUrl}/items?page=1&limit=10`);

    expect(page1.data).toHaveLength(10);
    expect(page1.meta.page).toBe(1);
    expect(page1.meta.totalPages).toBeGreaterThanOrEqual(1);

    // Check next page
    const page2 = await apiUtils.getJSON<typeof page1>(`${apiUrl}/items?page=2&limit=10`);
    expect(page2).toHaveProperty('data');
    expect(page2).toHaveProperty('meta');
    expect(page2.meta.page).toBe(2);
  });

  test('should validate response headers', async ({ request }) => {
    const response = await request.get(`${apiUrl}/health`);

    APIAssertions.assertHeaders(response, {
      'content-type': /application\/json/,
      'x-powered-by': /Express|Next\.js/,
    });
    expect(response.status()).toBe(200);
  });

  test('should handle rate limiting', async () => {
    // Create an array of promises for multiple requests
    const promises = Array.from({ length: 15 }, () => apiUtils.getJSON(`${apiUrl}/items`));

    // Wait for all responses
    const results = await Promise.allSettled(promises);

    // Some should be rate limited (429)
    const rateLimited = results.filter(
      (r: any) => r.status === 'rejected' || (r.status === 'fulfilled' && r.value?.status === 429),
    );
    expect(rateLimited.length).toBeGreaterThan(0);

    // Check rate limit headers - find a fulfilled response with headers
    const fulfilledResponse = results.find(
      (r: any) => r.status === 'fulfilled' && r.value?.headers,
    ) as any;
    expect(fulfilledResponse).toBeDefined();
    expect(fulfilledResponse.value.headers).toHaveProperty('x-ratelimit-limit');
    expect(fulfilledResponse.value.headers).toHaveProperty('x-ratelimit-remaining');

    // Assert that we made the expected number of requests
    expect(results).toHaveLength(15);
  });

  test('autofix test for underscore', async () => {
    let shouldBeFixed = 42;
    expect(shouldBeFixed).toBe(42);
  });
});

test.describe('GraphQL API Testing', () => {
  let graphqlUtils: GraphQLTestUtils;

  test.beforeEach(async ({ request }) => {
    graphqlUtils = new GraphQLTestUtils(request);
  });

  test('should execute GraphQL queries', async () => {
    const query = `
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          email
          name
        }
      }
    `;

    const result = await graphqlUtils.query<{ user: any }>(query, {
      id: '123',
    });

    expect(result.user).toHaveProperty('id', '123');
    expect(result.user).toHaveProperty('email');
  });

  test('should execute GraphQL mutations', async () => {
    const mutation = `
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          email
        }
      }
    `;

    const newUser = TestDataGenerator.user();
    const result = await graphqlUtils.mutate<{ createUser: any }>(mutation, {
      input: {
        email: newUser.email,
        password: newUser.password,
      },
    });

    expect(result.createUser).toHaveProperty('id');
    expect(result.createUser).toHaveProperty('email', newUser.email);
  });
});
