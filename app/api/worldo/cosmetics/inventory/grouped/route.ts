import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { Rarity } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter');
    const search = searchParams.get('search') || '';
    const rarity = searchParams.get('rarity') || 'all';
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    let whereCondition: any = { ownerId: session.user.id };

    if (filter === 'listed') {
      whereCondition.isListed = true;
    } else if (filter === 'unlisted') {
      whereCondition.isListed = false;
    }

    // Buscar todos os itens com seus frames
    const items = await prisma.user_frame_item.findMany({
      where: whereCondition,
      include: {
        frame: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Agrupar manualmente
    const groupedMap = new Map();

    items.forEach((item) => {
      const listingId = item.isListed ? item.listingId : null;

      let key;
      if (item.isListed && item.listingId) {
        key = `listed-${item.listingId}`;
      } else {
        key = `unlisted-${item.frameId}`;
      }

      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          id: key,
          frameId: item.frameId,
          isListed: item.isListed,
          resalePrice: item.resalePrice,
          isEquipped: false,
          equippedItemId: null,
          count: 0,
          frame: item.frame,
          listingId: listingId,
          lastActivityAt: item.updatedAt,
        });
      }

      const group = groupedMap.get(key);
      group.count++;
      if (item.isEquipped) {
        group.isEquipped = true;
        group.equippedItemId = item.id;
      }
      if (item.updatedAt > group.lastActivityAt) {
        group.lastActivityAt = item.updatedAt;
      }
      if (item.resalePrice && (!group.resalePrice || item.resalePrice < group.resalePrice)) {
        group.resalePrice = item.resalePrice;
      }
    });

    // Converter para array
    let allGroupedItems = Array.from(groupedMap.values());

    if (search) {
      const searchLower = search.toLowerCase();
      allGroupedItems = allGroupedItems.filter((item) =>
        item.frame.name.toLowerCase().includes(searchLower),
      );
    }

    if (rarity && rarity !== 'all') {
      const validRarities = Object.values(Rarity);
      if (validRarities.includes(rarity as Rarity)) {
        allGroupedItems = allGroupedItems.filter((item) => item.frame.rarity === rarity);
      }
    }

    // Ordenar pela data mais recente
    allGroupedItems.sort((a, b) => {
      if (sort === 'oldest') {
        const dateA = new Date(a.lastActivityAt).getTime();
        const dateB = new Date(b.lastActivityAt).getTime();
        return dateA - dateB;
      } else {
        const dateA = new Date(a.lastActivityAt).getTime();
        const dateB = new Date(b.lastActivityAt).getTime();
        return dateB - dateA;
      }
    });

    // Paginação
    const totalCount = allGroupedItems.length;
    const totalPages = Math.ceil(totalCount / limit);
    const paginatedItems = allGroupedItems.slice(skip, skip + limit);

    const hasMore = page < totalPages;

    return NextResponse.json({
      items: paginatedItems,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      hasMore,
    });
  } catch (error) {
    console.error('Erro ao buscar inventário agrupado:', error);
    return NextResponse.json({ error: 'Erro ao buscar inventário' }, { status: 500 });
  }
}
