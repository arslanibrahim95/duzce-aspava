import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, Edit2, Trash2,
  Sparkles, Flame, Pizza, Coffee, Cookie, GlassWater, Gift, Layers, Utensils
} from 'lucide-react';
import { Category } from '../types';

interface SortableCategoryItemProps {
  id: string;
  cat: Category;
  isSelected: boolean;
  productCount: number;
  isLightMode: boolean;
  onEdit: (cat: Category) => void;
  onDelete: (id: string, name: string) => void;
  key?: React.Key;
}

// Map string icon names to actual Lucide component references
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Sparkles,
  Flame,
  Pizza,
  Coffee,
  Cookie,
  GlassWater,
  Gift,
  Layers,
  Utensils
};

export default function SortableCategoryItem({
  id,
  cat,
  isSelected,
  productCount,
  isLightMode,
  onEdit,
  onDelete,
}: SortableCategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: id, 
    disabled: cat.id === 'all' 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 99 : 1,
  };

  const IconComponent = ICON_MAP[cat.icon] || Sparkles;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 text-left ${
        isDragging
          ? 'bg-amber-500/20 border-amber-500/60 shadow-lg shadow-amber-550/10 scale-[1.01]'
          : isSelected
          ? 'bg-amber-500/5 border-amber-500/40'
          : 'bg-zinc-900/40 hover:bg-zinc-900/70 border-zinc-850 hover:border-zinc-800'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Grab Handle for Drag and Drop (Disable drag on system 'all' category) */}
        {cat.id !== 'all' ? (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1.5 text-zinc-500 hover:text-amber-500 transition shrink-0 rounded-lg hover:bg-zinc-950/40"
            title="Sürükleyip Sırala"
          >
            <GripVertical className="w-4 h-4" />
          </div>
        ) : (
          <div className="w-7 shrink-0" />
        )}

        {/* Dynamic Category Icon Container */}
        <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-amber-500 shrink-0">
          <IconComponent className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-2 truncate">
            {cat.name}
            {cat.id === 'all' && (
              <span className="text-[8px] font-mono bg-zinc-950 border border-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded uppercase">Sistem Ana</span>
            )}
          </h4>
          <p className="text-[9px] font-mono text-zinc-500 mt-0.5 truncate">
            slug: {cat.id} • {productCount} bağlı lezzet
          </p>
        </div>
      </div>

      {/* Categories CRUD actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => onEdit(cat)}
          disabled={cat.id === 'all'}
          className={`p-2 rounded-xl border transition ${
            cat.id === 'all'
              ? 'bg-zinc-955/30 text-zinc-650 border-zinc-900 cursor-not-allowed'
              : 'bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border-zinc-800 cursor-pointer'
          }`}
          title="Kategoriyi Güncelle"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(cat.id, cat.name)}
          disabled={cat.id === 'all'}
          className={`p-2 rounded-xl border transition ${
            cat.id === 'all'
              ? 'bg-zinc-955/30 text-zinc-650 border-zinc-900 cursor-not-allowed'
              : 'bg-zinc-950 hover:bg-red-955/15 text-zinc-500 hover:text-red-400 border-zinc-800 cursor-pointer'
          }`}
          title="Kategoriyi Sil"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
