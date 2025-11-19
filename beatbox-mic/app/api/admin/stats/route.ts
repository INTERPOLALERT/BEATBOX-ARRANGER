/**
 * Admin Stats API Route
 *
 * GET /api/admin/stats - Get platform statistics (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/admin/stats
 * Get comprehensive platform statistics
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Get counts
    const [
      totalUsers,
      totalPresets,
      totalComments,
      totalLikes,
      publicPresets,
      deletedPresets,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.preset.count({ where: { deletedAt: null } }),
      prisma.comment.count({ where: { deletedAt: null } }),
      prisma.presetLike.count(),
      prisma.preset.count({ where: { isPublic: true, deletedAt: null } }),
      prisma.preset.count({ where: { deletedAt: { not: null } } }),
    ]);

    // Get recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get top creators
    const topCreators = await prisma.user.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        username: true,
        _count: {
          select: {
            presets: {
              where: {
                isPublic: true,
                deletedAt: null,
              },
            },
          },
        },
      },
      orderBy: {
        presets: {
          _count: 'desc',
        },
      },
    });

    // Get most popular presets
    const popularPresets = await prisma.preset.findMany({
      take: 10,
      where: {
        isPublic: true,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        likeCount: true,
        downloadCount: true,
        viewCount: true,
        user: {
          select: {
            name: true,
            username: true,
          },
        },
      },
      orderBy: {
        likeCount: 'desc',
      },
    });

    return NextResponse.json({
      stats: {
        users: {
          total: totalUsers,
          recent: recentUsers,
        },
        presets: {
          total: totalPresets,
          public: publicPresets,
          deleted: deletedPresets,
        },
        engagement: {
          comments: totalComments,
          likes: totalLikes,
        },
      },
      topCreators,
      popularPresets,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
