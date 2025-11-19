/**
 * Admin Moderation API Route
 *
 * POST /api/admin/moderate - Moderate content (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const moderateSchema = z.object({
  action: z.enum(['delete_preset', 'delete_comment', 'ban_user', 'unban_user', 'promote_user']),
  targetId: z.string(),
  reason: z.string().optional(),
});

/**
 * POST /api/admin/moderate
 * Perform moderation actions
 */
export async function POST(req: NextRequest) {
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

    // Parse and validate request
    const body = await req.json();
    const { action, targetId, reason } = moderateSchema.parse(body);

    let result;

    switch (action) {
      case 'delete_preset':
        result = await prisma.preset.update({
          where: { id: targetId },
          data: { deletedAt: new Date() },
        });
        break;

      case 'delete_comment':
        result = await prisma.comment.update({
          where: { id: targetId },
          data: { deletedAt: new Date() },
        });
        break;

      case 'ban_user':
        result = await prisma.user.update({
          where: { id: targetId },
          data: {
            role: 'USER', // Remove any elevated privileges
            // TODO: Add banned field to schema
          },
        });
        break;

      case 'unban_user':
        result = await prisma.user.update({
          where: { id: targetId },
          data: { role: 'USER' },
        });
        break;

      case 'promote_user':
        // Only admins can promote
        if (user.role !== 'ADMIN') {
          return NextResponse.json(
            { error: 'Only admins can promote users' },
            { status: 403 }
          );
        }

        result = await prisma.user.update({
          where: { id: targetId },
          data: { role: 'MODERATOR' },
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // TODO: Log moderation action
    // await prisma.moderationLog.create({
    //   data: {
    //     moderatorId: user.id,
    //     action,
    //     targetId,
    //     reason,
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: `Action ${action} completed successfully`,
      result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error performing moderation action:', error);
    return NextResponse.json(
      { error: 'Failed to perform moderation action' },
      { status: 500 }
    );
  }
}
