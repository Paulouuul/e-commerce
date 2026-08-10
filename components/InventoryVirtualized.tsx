// components/InventoryVirtualized.tsx
'use client';

import { useRef, useEffect, useMemo, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Store, CheckCircle, Package } from 'lucide-react';
import { ClientImage } from '@/components/ClientImage';
import { formatItemCount } from '@/lib/format-utils';
import { getRarityDesigns, Rarity } from '@/constants/cosmeticRarity';
import { LoadingMore } from '@/components/Loading';

interface GroupedItem {
  id: string;
  frameId: string;
  isListed: boolean;
  resalePrice: number | null;
  listingId?: string | null;
  isEquipped: boolean;
  equippedItemId: string | null;
  count: number;
  frame: {
    id: string;
    name: string;
    description: string;
    thumbnailUrl: string;
    imageUrl: string;
    rarity: Rarity;
    stock: number;
  };
}

interface Props {
  items: GroupedItem[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onItemClick: (item: GroupedItem) => void;
  totalItems: number;
}

const rarityDesigns = getRarityDesigns('bottom-2');

const InventoryItem = ({
  item,
  onClick,
}: {
  item: GroupedItem;
  onClick: (item: GroupedItem) => void;
}) => {
  const config = rarityDesigns[item.frame.rarity?.toUpperCase()] || rarityDesigns.COMUM;

  return (
    <button
      onClick={() => onClick(item)}
      className={`group relative flex flex-col items-center justify-between p-2.5 sm:p-3 h-48 sm:h-52 rounded-2xl border overflow-hidden transition-all duration-300 ease-out cursor-pointer hover:-translate-y-1.5 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${config.cardClass} ${
        item.isListed
          ? 'ring-1 ring-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.08)]'
          : ''
      }`}
    >
      {/* Efeitos de fundo da Raridade */}
      {config.bgDecoration}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-size-[0.4rem_0.4rem] opacity-[0.05]" />

      {/* Header: Tags e Quantidade */}
      <div className="w-full flex justify-between items-start z-20 mb-1 gap-1 min-h-6">
        <div className="flex flex-col gap-1">
          {item.isListed && (
            <span className="flex items-center gap-1 text-[8px] font-black text-emerald-300 bg-emerald-950/90 border border-emerald-500/40 px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(16,185,129,0.2)] tracking-wider uppercase shrink-0">
              <Store className="w-2.5 h-2.5" />
              Venda
            </span>
          )}
          {item.isEquipped && (
            <span className="flex items-center gap-1 text-[8px] font-black text-blue-300 bg-blue-950/90 border border-blue-500/40 px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(59,130,246,0.2)] tracking-wider uppercase shrink-0">
              <CheckCircle className="w-2.5 h-2.5" />
              Equipado
            </span>
          )}
        </div>

        <span className="bg-slate-950/90 backdrop-blur-md border border-slate-700/80 text-slate-200 font-black text-[10px] px-1.5 py-1 rounded-md shadow-lg shrink-0">
          x{formatItemCount(item.count)}
        </span>
      </div>

      {/* Imagem */}
      <div className="flex flex-col items-center justify-center flex-1 w-full my-1">
        <div
          className={`relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden border bg-slate-900/90 flex items-center justify-center z-10 transition-transform duration-500 group-hover:scale-105 shadow-xl shrink-0 ${config.borderClass}`}
        >
          <ClientImage
            src={item.frame.thumbnailUrl}
            alt={item.frame.name}
            fill
            className="object-cover drop-shadow-2xl"
            sizes="(max-width: 640px) 72px, 88px"
            unoptimized
          />
        </div>
      </div>

      {/* Badge de Raridade */}
      <div className="relative w-full flex justify-center z-20 mt-1 mb-2 h-6">
        {config.badge}
      </div>

      {/* Nome do Item */}
      <div className="w-full z-10 pt-1.5 border-t border-slate-800/40 flex flex-col items-center">
        <span
          className={`block text-[10px] sm:text-xs text-center px-1 truncate w-full drop-shadow-md ${config.textClass}`}
        >
          {item.frame.name}
        </span>
      </div>
    </button>
  );
};

export function InventoryVirtualized({
  items,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  onItemClick,
  totalItems,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  const [columns, setColumns] = useState(4);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 480) setColumns(2);
      else if (width < 640) setColumns(3);
      else if (width < 768) setColumns(4);
      else if (width < 1024) setColumns(5);
      else if (width < 1280) setColumns(7);
      else setColumns(8);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const groupedItems = useMemo(() => {
    const groups: GroupedItem[][] = [];
    for (let i = 0; i < items.length; i += columns) {
      groups.push(items.slice(i, i + columns));
    }
    return groups;
  }, [items, columns]);

  const estimateSize = (index: number) => {
    return index === groupedItems.length ? 60 : 280; // Ajuste conforme altura real do card
  };

  const virtualCount = hasMore ? groupedItems.length + 1 : groupedItems.length;

  const rowVirtualizer = useVirtualizer({
    count: virtualCount,
    getScrollElement: () => containerRef.current,
    estimateSize,
    overscan: 3,
    paddingStart: 0,
    paddingEnd: 0,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const lastItemIndex = virtualItems.length > 0 ? virtualItems[virtualItems.length - 1].index : 0;

  // Trigger load more quando chegar perto do fim
  useEffect(() => {
    const shouldLoadMore =
      lastItemIndex >= groupedItems.length - 2 &&
      hasMore &&
      !loading &&
      !loadingMore &&
      !isLoadingRef.current &&
      items.length > 0;

    if (shouldLoadMore) {
      isLoadingRef.current = true;
      onLoadMore();
    }
  }, [lastItemIndex, groupedItems.length, hasMore, loading, loadingMore, onLoadMore, items.length]);

  useEffect(() => {
    if (!loading && !loadingMore) {
      isLoadingRef.current = false;
    }
  }, [loading, loadingMore]);

  // Reset scroll quando items mudam
  useEffect(() => {
    if (containerRef.current && groupedItems.length === 0) {
      containerRef.current.scrollTop = 0;
    }
  }, [groupedItems.length]);

  // Loading inicial
  if (loading && items.length === 0) {
    return (
      <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3 sm:gap-5">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="h-48 sm:h-52 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Empty state
  if (items.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-900/20 border border-slate-800/50 rounded-2xl border-dashed">
        <Package className="w-16 h-16 text-slate-700 mb-4 animate-pulse" />
        <h3 className="text-lg sm:text-xl font-bold text-slate-300 mb-2">
          Seu inventário está vazio
        </h3>
        <p className="text-sm text-slate-500 max-w-md">
          Adquira no marketplace ou crie sua própria moldura!
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full overflow-y-auto scroll-smooth scrollbar-hide">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
          minHeight: '100%',
        }}
      >
        {virtualItems.map((virtualRow) => {
          const isLoaderRow = virtualRow.index >= groupedItems.length;

          if (isLoaderRow) {
            return (
              <div
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {hasMore ? (
                  <LoadingMore text="Carregando mais itens..." />
                ) : (
                  <div className="text-center py-4 text-sm text-slate-500">
                    <p>Total de {totalItems} itens no inventário</p>
                  </div>
                )}
              </div>
            );
          }

          const rowItems = groupedItems[virtualRow.index];

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: '8px',
                padding: '4px 8px',
              }}
            >
              {rowItems.map((item) => (
                <InventoryItem key={item.id} item={item} onClick={onItemClick} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}