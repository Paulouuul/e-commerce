// app/worldo/cosmetics/inventory/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { RARITY, Rarity } from '@/constants/cosmeticRarity';
import { CosmeticActionModal } from '@/components/CosmeticActionModal';
import { Package, Search, Plus, X, Store, Box } from 'lucide-react';
import { formatItemCount } from '@/lib/format-utils';
import { LoadingSpinner } from '@/components/Loading';
import { InventoryVirtualized } from '@/components/InventoryVirtualized';

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

type FilterType = 'all' | 'listed' | 'unlisted';
type ModalMode = 'sell' | 'view' | 'edit' | 'remove' | 'equip' | null;

export default function MyCosmeticsPage() {
  const { data: session, status } = useSession();

  // Estados da Lista e Filtros
  const [items, setItems] = useState<GroupedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('unlisted');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [statsData, setStatsData] = useState({ all: 0, listed: 0, unlisted: 0 });
  const [avatarUrl, setAvatarUrl] = useState('/default-avatar.png');
  const rarityOptions = ['all', RARITY.COMUM, RARITY.RARO, RARITY.EPICO, RARITY.LENDARIO];

  // Estados do Modal
  const [selectedItem, setSelectedItem] = useState<GroupedItem | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/cosmetics/inventory/stats');
      const data = await res.json();
      setStatsData(data);
    } catch (err) {
      console.error('Erro ao buscar stats:', err);
    }
  }, []);

  const fetchInventory = useCallback(
    async (page: number, isLoadMore = false) => {
      try {
        if (isLoadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const res = await fetch(
          `/api/cosmetics/inventory/grouped?page=${page}&limit=16&filter=${activeFilter}&search=${encodeURIComponent(searchTerm)}&rarity=${rarityFilter}&sort=${sort}`,
        );
        if (!res.ok) throw new Error('Falha ao sincronizar inventário');

        const data = await res.json();

        if (isLoadMore) {
          setItems((prev) => [...prev, ...data.items]);
        } else {
          setItems(data.items);
        }

        setHasMore(data.hasMore ?? false);
        setCurrentPage(page);
      } catch (err) {
        console.error('Erro ao processar inventário:', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeFilter, searchTerm, rarityFilter, sort],
  );

  const loadMore = useCallback(() => {
    if (!hasMore || loading || loadingMore) return;
    fetchInventory(currentPage + 1, true);
  }, [hasMore, loading, loadingMore, currentPage, fetchInventory]);

  // Carrega avatar apenas uma vez quando houver a sessão do usuário
  useEffect(() => {
    if (!session?.user) return;

    if (session.user.avatar) {
      setAvatarUrl(session.user.avatar);
    }

    if (!session.user.publicId) return;

    const controller = new AbortController();

    fetch(`/api/user/${session.user.publicId}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data?.avatar) setAvatarUrl(data.avatar);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') console.error(err);
      });

    return () => controller.abort();
  }, [session]);

  // Hook unificado com DEBOUNCE para evitar requisições infinitas na digitação
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.publicId) return;

    fetchStats();

    const timeoutId = setTimeout(() => {
      setItems([]);
      setCurrentPage(1);
      setHasMore(true);
      fetchInventory(1, false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [activeFilter, searchTerm, rarityFilter, sort, status, session, fetchStats, fetchInventory]);

  // Ações do Modal
  const handleOpenItem = (item: GroupedItem) => {
    setSelectedItem(item);
    setModalMode(item.isListed ? 'view' : 'equip');
  };

  const handleModalSuccess = () => {
    fetchInventory(1, false);
    fetchStats();
  };

  // Telas de Carregamento e Não Autenticado
  if (status === 'loading' || (loading && status === 'authenticated' && items.length === 0)) {
    return <LoadingSpinner text="Acessando cofre de cosméticos..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pt-4 sm:pt-6 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-slate-800/60 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-white via-slate-200 to-slate-400 tracking-wide flex items-center gap-3">
            <Package className="w-7 h-7 sm:w-8 sm:h-8 text-purple-500 shrink-0" />
            MEUS COSMÉTICOS
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5 font-medium">
            Gerencie seu inventário e comercialize suas molduras
          </p>
        </div>
        {items.length > 0 && (
          <Link
            href="/worldo/cosmetics/create"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-500/50 text-purple-300 py-3 sm:py-2.5 px-5 rounded-xl transition-[transform,border-color,background-color,box-shadow] text-sm font-semibold shadow-lg shadow-purple-900/10"
          >
            <Plus className="w-4 h-4" /> Criar Nova Moldura
          </Link>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4 shrink-0">
        <div className="flex-1 relative">
          <button
            onClick={() => setSearchTerm(searchInput)}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-700 transition z-10"
          >
            <Search className="w-4 h-4 text-slate-500" />
          </button>
          <input
            type="text"
            placeholder="Buscar no inventário..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition text-slate-200 placeholder:text-slate-500 text-sm"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                setSearchTerm('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-700 transition z-10"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {rarityOptions.map((rarity) => (
            <button
              key={rarity}
              onClick={() => setRarityFilter(rarity)}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                rarityFilter === rarity
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {rarity === 'all' ? 'Todas' : rarity}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros de Status */}
      <div className="flex flex-wrap sm:flex-nowrap gap-2 mb-4 bg-slate-900/60 border border-slate-800/80 rounded-xl p-1.5 w-full sm:w-fit shadow-inner backdrop-blur-sm shrink-0">
        <button
          onClick={() => setActiveFilter('unlisted')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-[transform,border-color,background-color,box-shadow] ${
            activeFilter === 'unlisted'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Box className="w-4 h-4 shrink-0" /> Disponíveis{' '}
          <span className="bg-slate-950/40 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-xs">
            {formatItemCount(statsData.unlisted)}
          </span>
        </button>
        <button
          onClick={() => setActiveFilter('listed')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-[transform,border-color,background-color,box-shadow] ${
            activeFilter === 'listed'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Store className="w-4 h-4 shrink-0" /> No Mercado{' '}
          <span className="bg-slate-950/40 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-xs">
            {formatItemCount(statsData.listed)}
          </span>
        </button>
        <button
          onClick={() => setActiveFilter('all')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-[transform,border-color,background-color,box-shadow] ${
            activeFilter === 'all'
              ? 'bg-slate-700 text-white shadow-lg shadow-slate-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Package className="w-4 h-4 shrink-0" /> Todos{' '}
          <span className="bg-slate-950/40 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-xs">
            {formatItemCount(statsData.all)}
          </span>
        </button>
      </div>

      {/* Ordenação */}
      <div className="flex items-center gap-2 mb-4 flex-wrap shrink-0">
        <span className="text-xs text-slate-500 font-medium mr-2">Ordenar por:</span>
        <button
          onClick={() => setSort('newest')}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
            sort === 'newest'
              ? 'bg-slate-700 text-white'
              : 'bg-slate-800 text-slate-500 hover:text-slate-300'
          }`}
        >
          Mais recentes
        </button>
        <button
          onClick={() => setSort('oldest')}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
            sort === 'oldest'
              ? 'bg-slate-700 text-white'
              : 'bg-slate-800 text-slate-500 hover:text-slate-300'
          }`}
        >
          Mais antigos
        </button>
      </div>

      {/* Componente Virtualizado */}
      <div className="flex-1 min-h-0">
        <InventoryVirtualized
          items={items}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onItemClick={handleOpenItem}
        />
      </div>

      {/* Modal */}
      {selectedItem && modalMode && (
        <CosmeticActionModal
          item={selectedItem}
          mode={modalMode}
          onClose={() => {
            setSelectedItem(null);
            setModalMode(null);
          }}
          onSuccess={handleModalSuccess}
          avatarUrl={avatarUrl}
        />
      )}
    </div>
  );
}