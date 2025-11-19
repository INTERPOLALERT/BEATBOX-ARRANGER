/**
 * Preset Comments API Routes
 *
 * GET /api/presets/[id]/comments - List comments for preset
 * POST /api/presets/[id]/comments - Add comment to preset
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const commentSchema = z.object({
  content: z.string().min(1).max(1000),
  parentId: z.string().optional(), // For threaded replies
});

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/presets/[id]/comments
 * List all comments for a preset
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: presetId } = params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Fetch comments with user data
    const comments = await prisma.comment.findMany({
      where: {
        presetId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        replies: {
          where: {
            deletedAt: null,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    const totalCount = await prisma.comment.count({
      where: {
        presetId,
        deletedAt: null,
      },
    });

    return NextResponse.json({
      comments,
      totalCount,
      page,
      hasMore: skip + comments.length < totalCount,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/presets/[id]/comments
 * Add a new comment to preset
 */
export async function POST(
  req: NextRequest,
  { params }: RouteParams
) {
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

    const { id: presetId } = params;

    // Check if preset exists
    const preset = await prisma.preset.findUnique({
      where: { id: presetId },
    });

    if (!preset) {
      return NextResponse.json(
        { error: 'Preset not found' },
        { status: 404 }
      );
    }

    // Validate request body
    const body = await req.json();
    const validatedData = commentSchema.parse(body);

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        userId: user.id,
        presetId,
        parentId: validatedData.parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });

    // TODO: Create notification for preset owner
    // if (preset.userId !== user.id) {
    //   await prisma.notification.create({
    //     data: {
    //       userId: preset.userId,
    //       type: 'COMMENT',
    //       content: `${user.name} commented on your preset "${preset.name}"`,
    //       relatedPresetId: presetId,
    //       relatedCommentId: comment.id,
    //     },
    //   });
    // }

    return NextResponse.json(
      {
        comment,
        message: 'Comment added successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
