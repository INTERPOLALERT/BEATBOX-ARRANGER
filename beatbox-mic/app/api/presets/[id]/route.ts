/**
 * Single Preset API Routes
 *
 * GET /api/presets/[id] - Get preset details
 * PUT /api/presets/[id] - Update preset (owner only)
 * DELETE /api/presets/[id] - Delete preset (owner only)
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
 * GET /api/presets/[id]
 * Get preset details and increment view count
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;

    // Fetch preset with all details
    const preset = await prisma.preset.findUnique({
      where: { id },
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

    if (!preset) {
      return NextResponse.json(
        { error: 'Preset not found' },
        { status: 404 }
      );
    }

    // Check if preset is public or if user is owner
    const session = await getServerSession(authOptions);
    const isOwner = session?.user?.email && preset.user.id === session.user.id;

    if (!preset.isPublic && !isOwner) {
      return NextResponse.json(
        { error: 'Preset is private' },
        { status: 403 }
      );
    }

    // Increment view count (fire and forget)
    prisma.preset.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    }).catch((err) => console.error('Failed to increment view count:', err));

    return NextResponse.json({ preset });
  } catch (error) {
    console.error('Error fetching preset:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preset' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/presets/[id]
 * Update preset (owner only)
 */
export async function PUT(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;

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

    // Check ownership
    const preset = await prisma.preset.findUnique({
      where: { id },
    });

    if (!preset) {
      return NextResponse.json(
        { error: 'Preset not found' },
        { status: 404 }
      );
    }

    if (preset.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only edit your own presets' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { name, description, tags, isPublic } = body;

    // Update preset
    const updatedPreset = await prisma.preset.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(tags && { tags }),
        ...(isPublic !== undefined && { isPublic }),
      },
    });

    return NextResponse.json({
      preset: updatedPreset,
      message: 'Preset updated successfully',
    });
  } catch (error) {
    console.error('Error updating preset:', error);
    return NextResponse.json(
      { error: 'Failed to update preset' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/presets/[id]
 * Soft delete preset (owner only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;

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

    // Check ownership
    const preset = await prisma.preset.findUnique({
      where: { id },
    });

    if (!preset) {
      return NextResponse.json(
        { error: 'Preset not found' },
        { status: 404 }
      );
    }

    if (preset.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own presets' },
        { status: 403 }
      );
    }

    // Soft delete
    await prisma.preset.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      message: 'Preset deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting preset:', error);
    return NextResponse.json(
      { error: 'Failed to delete preset' },
      { status: 500 }
    );
  }
}
