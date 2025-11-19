/**
 * User Follow API Route
 *
 * POST /api/users/[id]/follow - Toggle follow on user
 * DELETE /api/users/[id]/follow - Unfollow user (alternative)
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
 * POST /api/users/[id]/follow
 * Toggle follow on user (follow if not following, unfollow if already following)
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

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { id: followingId } = params;

    // Can't follow yourself
    if (currentUser.id === followingId) {
      return NextResponse.json(
        { error: 'You cannot follow yourself' },
        { status: 400 }
      );
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow: Delete follow
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: currentUser.id,
            followingId,
          },
        },
      });

      return NextResponse.json({
        following: false,
        message: 'User unfollowed',
      });
    } else {
      // Follow: Create follow
      await prisma.follow.create({
        data: {
          followerId: currentUser.id,
          followingId,
        },
      });

      // TODO: Create notification for followed user
      // await prisma.notification.create({
      //   data: {
      //     userId: followingId,
      //     type: 'FOLLOW',
      //     content: `${currentUser.name} started following you`,
      //     relatedUserId: currentUser.id,
      //   },
      // });

      return NextResponse.json({
        following: true,
        message: 'User followed',
      });
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    return NextResponse.json(
      { error: 'Failed to toggle follow' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]/follow
 * Unfollow user (alternative method)
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

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { id: followingId } = params;

    // Check if follow exists
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId,
        },
      },
    });

    if (!existingFollow) {
      return NextResponse.json(
        { error: 'Not following this user' },
        { status: 404 }
      );
    }

    // Delete follow
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId,
        },
      },
    });

    return NextResponse.json({
      message: 'User unfollowed',
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return NextResponse.json(
      { error: 'Failed to unfollow user' },
      { status: 500 }
    );
  }
}
