import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon, X, Loader2 } from 'lucide-react';
import { uploadImage } from '../lib/api';

interface ImageUploaderProps {
  value: string;
  onChange: (value: string) => void;
  onShowNotice?: (msg: string) => void;
}

export default function ImageUploader({ value, onChange, onShowNotice }: ImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [inputUrl, setInputUrl] = useState(value.startsWith('http') ? value : '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasImage = value && value.trim().length > 0;

  const processFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onShowNotice?.('Lütfen geçerli bir görsel dosyası (.jpg, .png, .webp) seçin.');
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      onShowNotice?.('Görsel 6MB\'dan küçük olmalı.');
      return;
    }
    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
      onShowNotice?.('Görsel yüklendi! 📸');
    } catch (e) {
      onShowNotice?.('Görsel yüklenemedi: ' + (e as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleApplyUrl = () => {
    const u = inputUrl.trim();
    if (!u) { onChange(''); return; }
    if (!/^https?:\/\//.test(u)) { onShowNotice?.('Geçerli bir http(s) bağlantısı girin.'); return; }
    onChange(u);
    onShowNotice?.('İnternet görseli tanımlandı. 🌐');
  };

  const clear = () => { onChange(''); setInputUrl(''); };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold text-ink-faint uppercase tracking-wider">Ürün Görseli</label>
        {hasImage && (
          <button type="button" onClick={clear} className="text-[11px] font-medium text-red-500 hover:text-red-400 flex items-center gap-1 cursor-pointer">
            <X className="w-3 h-3" /> Temizle
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Preview */}
        <div className="sm:col-span-4 flex items-center justify-center p-2 rounded-2xl bg-card-2 border border-line min-h-[120px]">
          {hasImage ? (
            <img src={value} alt="önizleme" className="w-full h-28 object-cover rounded-xl border border-line" />
          ) : (
            <div className="flex flex-col items-center text-ink-faint">
              <ImageIcon className="w-6 h-6 mb-1" />
              <span className="text-[10px]">Görsel yok</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="sm:col-span-8 space-y-2.5">
          <div className="grid grid-cols-2 gap-1 bg-card-2 p-1 rounded-xl border border-line">
            <button type="button" onClick={() => setActiveTab('upload')}
              className={`py-1.5 rounded-lg text-[12px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition ${activeTab === 'upload' ? 'bg-brand/10 text-brand' : 'text-ink-soft hover:text-ink'}`}>
              <Upload className="w-3.5 h-3.5" /> Cihazdan Yükle
            </button>
            <button type="button" onClick={() => setActiveTab('url')}
              className={`py-1.5 rounded-lg text-[12px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition ${activeTab === 'url' ? 'bg-brand/10 text-brand' : 'text-ink-soft hover:text-ink'}`}>
              <LinkIcon className="w-3.5 h-3.5" /> Link
            </button>
          </div>

          {activeTab === 'upload' ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`cursor-pointer border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center min-h-[96px] transition ${
                isDragging ? 'border-brand bg-brand/5 text-brand' : 'border-line hover:border-brand/40 text-ink-soft'
              }`}
            >
              <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} accept="image/*" className="hidden" />
              {isUploading ? (
                <><Loader2 className="w-5 h-5 mb-1 animate-spin text-brand" /><span className="text-[12px] font-semibold">Yükleniyor…</span></>
              ) : (
                <><Upload className="w-5 h-5 mb-1" /><span className="text-[12px] font-semibold text-ink">Sürükle bırak veya tıkla</span>
                <span className="text-[10px] mt-0.5">JPG / PNG / WEBP — maks 6MB</span></>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <input type="url" value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} placeholder="https://..."
                className="flex-1 text-sm bg-card border border-line focus:border-brand rounded-xl px-3 py-2.5 text-ink focus:outline-none" />
              <button type="button" onClick={handleApplyUrl} className="bg-brand text-on-brand text-[12px] font-bold px-4 rounded-xl cursor-pointer hover:bg-brand-2 transition">Uygula</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
