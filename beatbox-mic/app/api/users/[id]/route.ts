/**
 * User Profile API Route
 *
 * GET /api/users/[id] - Get user profile with stats
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
 * GET /api/users/[id]
 * Get user profile with statistics
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);

    // Fetch user with aggregated stats
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        email: session?.user?.id === id, // Only show email to self
        image: true,
        bio: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            presets: {
              where: {
                isPublic: true,
                deletedAt: null,
              },
            },
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get total likes on user's presets
    const likesResult = await prisma.preset.aggregate({
      where: {
        userId: id,
        isPublic: true,
        deletedAt: null,
      },
      _sum: {
        likeCount: true,
      },
    });

    // Get total downloads
    const downloadsResult = await prisma.preset.aggregate({
      where: {
        userId: id,
        isPublic: true,
        deletedAt: null,
      },
      _sum: {
        downloadCount: true,
      },
    });

    // Check if current user is following this user
    let isFollowing = false;
    if (session?.user?.email && session.user.id !== id) {
      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (currentUser) {
        const follow = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUser.id,
              followingId: id,
            },
          },
        });
        isFollowing = !!follow;
      }
    }

    return NextResponse.json({
      user: {
        ...user,
        stats: {
          presetCount: user._count.presets,
          followerCount: user._count.followers,
          followingCount: user._count.following,
          totalLikes: likesResult._sum.likeCount || 0,
          totalDownloads: downloadsResult._sum.downloadCount || 0,
        },
        isFollowing,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}
