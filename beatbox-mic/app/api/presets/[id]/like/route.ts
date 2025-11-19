/**
 * Preset Like API Route
 *
 * POST /api/presets/[id]/like - Toggle like on preset
 * DELETE /api/presets/[id]/like - Unlike preset (alternative)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * POST /api/presets/[id]/like
 * Toggle like on preset (like if not liked, unlike if already liked)
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

    // Check if already liked
    const existingLike = await prisma.presetLike.findUnique({
      where: {
        userId_presetId: {
          userId: user.id,
          presetId,
        },
      },
    });

    if (existingLike) {
      // Unlike: Delete like and decrement count
      await prisma.$transaction([
        prisma.presetLike.delete({
          where: {
            userId_presetId: {
              userId: user.id,
              presetId,
            },
          },
        }),
        prisma.preset.update({
          where: { id: presetId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);

      return NextResponse.json({
        liked: false,
        likeCount: preset.likeCount - 1,
        message: 'Preset unliked',
      });
    } else {
      // Like: Create like and increment count
      await prisma.$transaction([
        prisma.presetLike.create({
          data: {
            userId: user.id,
            presetId,
          },
        }),
        prisma.preset.update({
          where: { id: presetId },
          data: { likeCount: { increment: 1 } },
        }),
      ]);

      // TODO: Create notification for preset owner
      // if (preset.userId !== user.id) {
      //   await prisma.notification.create({
      //     data: {
      //       userId: preset.userId,
      //       type: 'LIKE',
      //       content: `${user.name} liked your preset "${preset.name}"`,
      //       relatedPresetId: presetId,
      //     },
      //   });
      // }

      return NextResponse.json({
        liked: true,
        likeCount: preset.likeCount + 1,
        message: 'Preset liked',
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/presets/[id]/like
 * Unlike preset (alternative method)
 */
export async function DELETE(
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

    // Check if like exists
    const existingLike = await prisma.presetLike.findUnique({
      where: {
        userId_presetId: {
          userId: user.id,
          presetId,
        },
      },
    });

    if (!existingLike) {
      return NextResponse.json(
        { error: 'Like not found' },
        { status: 404 }
      );
    }

    // Delete like and decrement count
    await prisma.$transaction([
      prisma.presetLike.delete({
        where: {
          userId_presetId: {
            userId: user.id,
            presetId,
          },
        },
      }),
      prisma.preset.update({
        where: { id: presetId },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json({
      message: 'Like removed',
    });
  } catch (error) {
    console.error('Error removing like:', error);
    return NextResponse.json(
      { error: 'Failed to remove like' },
      { status: 500 }
    );
  }
}
