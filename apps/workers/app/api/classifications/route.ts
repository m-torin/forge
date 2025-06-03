import { requireAuth } from '@/lib/auth';
import { type NextRequest, NextResponse } from 'next/server';

// Mock data for now - in production, this would come from your database
const generateMockClassifications = () => [
  {
    id: 'class-1',
    classification: {
      confidence: 0.95,
      categoryId: 'electronics_computers',
      categoryPath: ['Electronics', 'Computers & Tablets'],
      method: 'hybrid',
      reasoning: 'High-end laptop with professional specifications matching computer category',
    },
    product: {
      brand: 'Apple',
      description: 'Professional laptop with M3 Max chip, 32GB RAM, 1TB SSD',
      image: 'https://via.placeholder.com/200x150',
      price: 3999.99,
      title: 'Apple MacBook Pro 16-inch M3 Max',
    },
    productId: 'prod-001',
    status: 'pending',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'class-2',
    classification: {
      confidence: 0.88,
      categoryId: 'electronics_smartphones',
      categoryPath: ['Electronics', 'Smartphones & Accessories'],
      method: 'ai-only',
      reasoning: 'Mobile device with phone capabilities and S Pen accessory',
    },
    product: {
      brand: 'Samsung',
      description: 'Premium Android smartphone with S Pen',
      price: 1299.99,
      title: 'Samsung Galaxy S24 Ultra',
    },
    productId: 'prod-002',
    reviewedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    reviewedBy: 'admin@example.com',
    status: 'approved',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 'class-3',
    classification: {
      confidence: 0.72,
      categoryId: 'clothing_shoes',
      categoryPath: ['Clothing', 'Footwear', 'Athletic Shoes'],
      method: 'vector-only',
      reasoning: 'Athletic footwear with running shoe characteristics',
    },
    feedback: 'Should be categorized under Sports & Outdoors > Athletic Gear > Running Shoes',
    product: {
      brand: 'Nike',
      description: 'Running shoes with Max Air cushioning',
      price: 150.0,
      title: 'Nike Air Max 270',
    },
    productId: 'prod-003',
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    reviewedBy: 'reviewer@example.com',
    status: 'rejected',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];

export async function GET(request: NextRequest) {
  // Validate authentication
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // In production, fetch from database
    let classifications = generateMockClassifications();

    // Apply filters
    if (status && status !== 'all') {
      classifications = classifications.filter((c) => c.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      classifications = classifications.filter(
        (c) =>
          c.product.title.toLowerCase().includes(searchLower) ||
          c.product.description?.toLowerCase().includes(searchLower) ||
          c.classification.categoryPath.some((p) => p.toLowerCase().includes(searchLower)),
      );
    }

    // Calculate stats
    const stats = {
      avgConfidence:
        classifications.reduce((acc, c) => acc + c.classification.confidence, 0) /
          classifications.length || 0,
      approved: classifications.filter((c) => c.status === 'approved').length,
      pending: classifications.filter((c) => c.status === 'pending').length,
      rejected: classifications.filter((c) => c.status === 'rejected').length,
      total: classifications.length,
    };

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = classifications.slice(startIndex, endIndex);

    return NextResponse.json(
      {
        data: paginatedData,
        pagination: {
          limit,
          page,
          total: classifications.length,
          totalPages: Math.ceil(classifications.length / limit),
        },
        stats,
      },
      {
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
          'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
          'Access-Control-Allow-Origin':
            process.env.NODE_ENV === 'development' ? '*' : process.env.NEXT_PUBLIC_URL || '',
        },
      },
    );
  } catch (error) {
    console.error('Error fetching classifications:', error);
    return NextResponse.json({ error: 'Failed to fetch classifications' }, { status: 500 });
  }
}

export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Origin':
        process.env.NODE_ENV === 'development' ? '*' : process.env.NEXT_PUBLIC_URL || '',
    },
    status: 200,
  });
}

export async function PUT(request: NextRequest) {
  // Validate authentication
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { id, feedback, reviewedBy, status } = body;

    // In production, update in database
    // For now, just return success
    return NextResponse.json(
      {
        data: {
          id,
          feedback,
          reviewedAt: new Date().toISOString(),
          reviewedBy,
          status,
        },
        success: true,
      },
      {
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
          'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
          'Access-Control-Allow-Origin':
            process.env.NODE_ENV === 'development' ? '*' : process.env.NEXT_PUBLIC_URL || '',
        },
      },
    );
  } catch (error) {
    console.error('Error updating classification:', error);
    return NextResponse.json({ error: 'Failed to update classification' }, { status: 500 });
  }
}
