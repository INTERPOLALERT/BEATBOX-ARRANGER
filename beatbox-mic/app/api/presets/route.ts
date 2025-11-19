/**
 * Presets API Routes
 *
 * GET /api/presets - List presets with search, filter, sort, pagination
 * POST /api/presets - Create new preset
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Validation schema for creating a preset
const createPresetSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  audioFileUrl: z.string().url(),
  audioFileName: z.string(),
  audioDuration: z.number().positive(),
  sampleRate: z.number().positive(),
  eqSettings: z.object({
    bands: z.array(z.object({
      frequency: z.number(),
      gain: z.number(),
      q: z.number(),
    })),
  }),
  compressorSettings: z.object({
    threshold: z.number(),
    ratio: z.number(),
    attack: z.number(),
    release: z.number(),
    knee: z.number(),
  }),
  reverbSettings: z.object({
    type: z.enum(['room', 'hall', 'plate', 'spring', 'none']),
    wetDry: z.number(),
    decay: z.number(),
    roomSize: z.number(),
  }),
  limiterSettings: z.object({
    enabled: z.boolean(),
    threshold: z.number(),
  }),
  filterSettings: z.object({
    highPass: z.object({
      enabled: z.boolean(),
      frequency: z.number(),
    }),
  }),
  tags: z.array(z.string()).max(10),
  isPublic: z.boolean().default(false),
});

/**
 * GET /api/presets
 * List presets with search, filter, sort, pagination
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const query = searchParams.get('q') || '';
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isPublic: true,
      deletedAt: null,
    };

    // Search by name or description
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { username: { contains: query, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    // Filter by tags
    if (tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    // Determine sort order
    let orderBy: any = {};
    switch (sort) {
      case 'popular':
        orderBy = { likeCount: 'desc' };
        break;
      case 'downloads':
        orderBy = { downloadCount: 'desc' };
        break;
      case 'views':
        orderBy = { viewCount: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Fetch presets with pagination
    const [presets, totalCount] = await Promise.all([
      prisma.preset.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          tags: true,
          likeCount: true,
          downloadCount: true,
          viewCount: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      }),
      prisma.preset.count({ where }),
    ]);

    const hasMore = skip + presets.length < totalCount;

    return NextResponse.json({
      presets,
      hasMore,
      totalCount,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching presets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch presets' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/presets
 * Create a new preset
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = createPresetSchema.parse(body);

    // Create preset
    const preset = await prisma.preset.create({
      data: {
        ...validatedData,
        userId: user.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        tags: true,
        likeCount: true,
        downloadCount: true,
        viewCount: true,
        isPublic: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json(
      { preset, message: 'Preset created successfully' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating preset:', error);
    return NextResponse.json(
      { error: 'Failed to create preset' },
      { status: 500 }
    );
  }
}
