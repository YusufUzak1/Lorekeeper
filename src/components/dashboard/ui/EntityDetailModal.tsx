import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { X, User, MapPin, Calendar, Activity, Link2, Shield, Image as ImageIcon, Check, Trash2, Scroll, Crown, Sparkles, Upload, Globe } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import type { Entity } from '@/types';
import { useUniverseStore } from '@/store/useUniverseStore';
import { useConfirmStore } from '@/store/useConfirmStore';

interface EntityDetailModalProps {
  entity: Entity | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EntityDetailModal({ entity, isOpen, onClose }: EntityDetailModalProps) {
  const { getConnectionsForEntity, getEntityById, updateEntity, deleteEntity } = useUniverseStore();
  const { showConfirm } = useConfirmStore();
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [imageMode, setImageMode] = useState<'file' | 'url'>('file');
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert file to base64 data URL
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    // Limit file size to 2MB for localStorage
    if (file.size > 2 * 1024 * 1024) {
      alert('Dosya boyutu 2MB\'dan küçük olmalıdır.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      setTempImageUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  if (!entity) return null;

  const connections = getConnectionsForEntity(entity.id);

  const handleSaveImage = () => {
    if (tempImageUrl) {
      updateEntity(entity.id, { imageUrl: tempImageUrl });
    }
    setIsEditingImage(false);
    setImagePreview(null);
    setTempImageUrl('');
  };

  const handleCancelEdit = () => {
    setIsEditingImage(false);
    setImagePreview(null);
    setTempImageUrl('');
    setImageMode('file');
  };

  const handleDelete = () => {
    showConfirm({
      title: 'Varlığı Sil',
      message: `"${entity.name}" isimli karakteri/mekanı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem, varlığa bağlı tüm ilişkileri de silecektir.`,
      danger: true,
      confirmText: 'Sil',
      onConfirm: () => {
        deleteEntity(entity.id);
        onClose();
      },
    });
  };

  const typeLabel = entity.type === 'character' ? 'Karakter' : entity.type === 'place' ? 'Mekan' : 'Olay';
  const TypeIcon = entity.type === 'character' ? User : entity.type === 'place' ? MapPin : Calendar;

  // Status color mapping
  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'ölü' || s === 'dead' || s === 'yıkılmış') return { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', text: '#fca5a5', dot: '#ef4444' };
    if (s === 'aktif' || s === 'active' || s === 'yaşıyor') return { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)', text: '#86efac', dot: '#22c55e' };
    return { bg: 'rgba(212,175,55,0.08)', border: 'rgba(212,175,55,0.2)', text: '#E8D48B', dot: '#D4AF37' };
  };

  // Relation color mapping
  const getRelationStyle = (relation: string) => {
    switch (relation) {
      case 'friend': return { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.2)', text: '#86efac', label: 'Dost' };
      case 'enemy': return { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.2)', text: '#fca5a5', label: 'Düşman' };
      case 'neutral': return { bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.2)', text: '#94a3b8', label: 'Nötr' };
      case 'located_in': return { bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.2)', text: '#93c5fd', label: 'Konum' };
      case 'involved_in': return { bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.2)', text: '#c4b5fd', label: 'Katılım' };
      default: return { bg: 'rgba(212,175,55,0.08)', border: 'rgba(212,175,55,0.15)', text: '#E8D48B', label: relation || 'Diğer' };
    }
  };

  const statusColor = getStatusColor(entity.status);

  // Stagger animation for children
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-lg overflow-hidden rounded-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(180deg, #111113 0%, #0c0c0e 100%)',
                border: '1px solid rgba(212, 175, 55, 0.12)',
                boxShadow: '0 0 80px rgba(212,175,55,0.06), 0 25px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
            >
              {/* Ambient glow */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-44 bg-mythos-accent/8 rounded-full blur-[90px] pointer-events-none" />
              <div className="absolute -bottom-16 right-0 w-40 h-32 bg-mythos-accent/4 rounded-full blur-[60px] pointer-events-none" />

              {/* Decorative corner accents */}
              <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-mythos-accent/40 to-transparent" />
                <div className="absolute top-0 left-0 h-full w-[1px] bg-gradient-to-b from-mythos-accent/40 to-transparent" />
              </div>
              <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
                <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-mythos-accent/40 to-transparent" />
                <div className="absolute top-0 right-0 h-full w-[1px] bg-gradient-to-b from-mythos-accent/40 to-transparent" />
              </div>

              {/* ── Header Section ── */}
              <div className="relative px-6 pt-5 pb-4">
                {/* Actions row */}
                <div className="flex items-center justify-end gap-1 mb-4">
                  <button
                    onClick={handleDelete}
                    className="p-2 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                    title="Varlığı Sil"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => { handleCancelEdit(); onClose(); }}
                    className="p-2 rounded-lg text-white/25 hover:text-white/70 hover:bg-white/5 transition-all cursor-pointer"
                    title="Kapat"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Entity identity */}
                <div className="flex items-center gap-4">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.04) 100%)',
                      border: '1px solid rgba(212,175,55,0.2)',
                      boxShadow: '0 0 20px rgba(212,175,55,0.06)',
                    }}
                  >
                    <TypeIcon size={24} className="text-mythos-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-serif text-2xl tracking-[0.12em] text-[#E8D48B] uppercase truncate">
                      {entity.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span 
                        className="inline-flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.2em] px-2.5 py-1 rounded-md"
                        style={{
                          background: 'rgba(212,175,55,0.06)',
                          border: '1px solid rgba(212,175,55,0.12)',
                          color: 'rgba(212,175,55,0.7)',
                        }}
                      >
                        <Crown size={10} />
                        {typeLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="mx-6 h-[1px] bg-gradient-to-r from-transparent via-mythos-accent/15 to-transparent" />

              {/* ── Body ── */}
              <motion.div 
                className="p-6 flex flex-col gap-5 max-h-[65vh] overflow-y-auto custom-scrollbar"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                
                {/* ── Image Section ── */}
                <motion.div variants={itemVariants}>
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  {!isEditingImage ? (
                    entity.imageUrl ? (
                      <div 
                        className="w-full h-52 rounded-xl overflow-hidden relative group cursor-pointer"
                        onClick={() => { setIsEditingImage(true); setTempImageUrl(entity.imageUrl || ''); setImagePreview(entity.imageUrl || null); }}
                        style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <img src={entity.imageUrl} alt={entity.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-transparent to-transparent opacity-70" />
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <span className="text-[0.6rem] text-white/40 uppercase tracking-wider">Kapak Görseli</span>
                          <div className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                            <ImageIcon size={12} className="text-white/70" />
                            <span className="text-[0.6rem] text-white/70">Değiştir</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => { setIsEditingImage(true); setTempImageUrl(''); }}
                        className="w-full py-6 rounded-xl flex flex-col items-center justify-center gap-2.5 cursor-pointer group transition-all"
                        style={{
                          background: 'rgba(255,255,255,0.015)',
                          border: '1px dashed rgba(255,255,255,0.1)',
                        }}
                      >
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                          style={{
                            background: 'rgba(212,175,55,0.06)',
                            border: '1px solid rgba(212,175,55,0.12)',
                          }}
                        >
                          <ImageIcon size={18} className="text-white/30 group-hover:text-mythos-accent transition-colors" />
                        </div>
                        <span className="text-[0.65rem] text-white/30 uppercase tracking-[0.15em] group-hover:text-mythos-accent/60 transition-colors">
                          Fotoğraf Ekle
                        </span>
                      </div>
                    )
                  ) : (
                    <div 
                      className="w-full rounded-xl flex flex-col gap-0 overflow-hidden"
                      style={{
                        background: 'rgba(212,175,55,0.03)',
                        border: '1px solid rgba(212,175,55,0.15)',
                      }}
                    >
                      {/* Mode Tabs */}
                      <div className="flex border-b" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
                        <button
                          onClick={() => setImageMode('file')}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[0.6rem] uppercase tracking-[0.15em] transition-all ${
                            imageMode === 'file' 
                              ? 'text-mythos-accent bg-mythos-accent/8' 
                              : 'text-white/30 hover:text-white/50 hover:bg-white/[0.02]'
                          }`}
                        >
                          <Upload size={12} />
                          Dosya Yükle
                        </button>
                        <button
                          onClick={() => setImageMode('url')}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[0.6rem] uppercase tracking-[0.15em] transition-all ${
                            imageMode === 'url' 
                              ? 'text-mythos-accent bg-mythos-accent/8' 
                              : 'text-white/30 hover:text-white/50 hover:bg-white/[0.02]'
                          }`}
                        >
                          <Globe size={12} />
                          URL Yapıştır
                        </button>
                      </div>

                      {/* Content Area */}
                      <div className="p-4 flex flex-col gap-3">
                        {imageMode === 'file' ? (
                          <>
                            {/* Drag & Drop Zone */}
                            <div
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              onClick={() => fileInputRef.current?.click()}
                              className="relative w-full rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer transition-all overflow-hidden"
                              style={{
                                padding: imagePreview ? '0' : '1.5rem 1rem',
                                background: isDragging ? 'rgba(212,175,55,0.08)' : 'rgba(0,0,0,0.2)',
                                border: isDragging 
                                  ? '2px dashed rgba(212,175,55,0.5)' 
                                  : '2px dashed rgba(255,255,255,0.08)',
                                minHeight: imagePreview ? '10rem' : 'auto',
                              }}
                            >
                              {imagePreview ? (
                                <>
                                  <img src={imagePreview} alt="Önizleme" className="w-full h-40 object-cover" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="flex items-center gap-2 px-3 py-2 bg-black/70 backdrop-blur-md rounded-lg">
                                      <Upload size={14} className="text-mythos-accent" />
                                      <span className="text-[0.6rem] text-white/80 uppercase tracking-wider">Değiştir</span>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div 
                                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform"
                                    style={{
                                      background: isDragging ? 'rgba(212,175,55,0.15)' : 'rgba(212,175,55,0.06)',
                                      border: '1px solid rgba(212,175,55,0.15)',
                                      transform: isDragging ? 'scale(1.1)' : 'scale(1)',
                                    }}
                                  >
                                    <Upload size={20} className={isDragging ? 'text-mythos-accent' : 'text-white/30'} />
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[0.7rem] text-white/50">
                                      {isDragging ? (
                                        <span className="text-mythos-accent font-medium">Bırakarak yükle...</span>
                                      ) : (
                                        <>Görseli buraya <span className="text-mythos-accent/70">sürükle-bırak</span> veya <span className="text-mythos-accent/70">tıkla</span></>
                                      )}
                                    </p>
                                    <p className="text-[0.55rem] text-white/20 mt-1">PNG, JPG, WEBP • Maks. 2MB</p>
                                  </div>
                                </>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            {/* URL Input */}
                            <div className="text-[0.55rem] text-white/25 uppercase tracking-[0.15em]">Görsel URL adresi</div>
                            <input 
                              type="text" 
                              value={tempImageUrl.startsWith('data:') ? '' : tempImageUrl}
                              onChange={(e) => { setTempImageUrl(e.target.value); setImagePreview(e.target.value || null); }}
                              placeholder="https://example.com/image.jpg"
                              className="w-full bg-black/40 border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-mythos-accent/40 transition-colors placeholder:text-white/15"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveImage();
                                else if (e.key === 'Escape') handleCancelEdit();
                              }}
                            />
                            {/* URL Preview */}
                            {tempImageUrl && !tempImageUrl.startsWith('data:') && (
                              <div className="w-full h-32 rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                                <img 
                                  src={tempImageUrl} 
                                  alt="Önizleme" 
                                  className="w-full h-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              </div>
                            )}
                          </>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-1">
                          <button 
                            onClick={handleSaveImage}
                            disabled={!tempImageUrl}
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-mythos-accent/15 hover:bg-mythos-accent/25 text-mythos-accent rounded-lg text-[0.65rem] uppercase tracking-[0.15em] transition-all disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <Check size={14} />
                            Kaydet
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/70 rounded-lg text-[0.65rem] uppercase tracking-[0.15em] transition-all"
                          >
                            İptal
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* ── Status & Era Cards ── */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
                  {/* Status */}
                  <div 
                    className="relative p-4 rounded-xl overflow-hidden"
                    style={{
                      background: statusColor.bg,
                      border: `1px solid ${statusColor.border}`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Activity size={13} style={{ color: statusColor.dot }} />
                      <span className="text-[0.55rem] uppercase tracking-[0.2em]" style={{ color: statusColor.text, opacity: 0.6 }}>
                        Durum
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: statusColor.dot }} />
                      <span className="text-sm font-medium" style={{ color: statusColor.text }}>
                        {entity.status || 'Bilinmiyor'}
                      </span>
                    </div>
                  </div>

                  {/* Era */}
                  <div 
                    className="relative p-4 rounded-xl overflow-hidden"
                    style={{
                      background: 'rgba(212,175,55,0.04)',
                      border: '1px solid rgba(212,175,55,0.12)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={13} className="text-mythos-accent/50" />
                      <span className="text-[0.55rem] uppercase tracking-[0.2em] text-mythos-accent/40">
                        Çağ / Dönem
                      </span>
                    </div>
                    <span className="text-sm font-medium text-[#E8D48B]/90">
                      {entity.era || 'Bilinmiyor'}
                    </span>
                  </div>
                </motion.div>

                {/* ── Faction ── */}
                {entity.faction && (
                  <motion.div 
                    variants={itemVariants}
                    className="p-4 rounded-xl"
                    style={{
                      background: 'rgba(167,139,250,0.05)',
                      border: '1px solid rgba(167,139,250,0.12)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Shield size={13} className="text-purple-400/50" />
                      <span className="text-[0.55rem] uppercase tracking-[0.2em] text-purple-300/40">
                        Grup / Irk / Bağlılık
                      </span>
                    </div>
                    <span className="text-sm font-medium text-purple-200/80">
                      {entity.faction}
                    </span>
                  </motion.div>
                )}

                {/* ── Connections ── */}
                <motion.div 
                  variants={itemVariants}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.015)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {/* Connections header */}
                  <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{
                          background: 'rgba(212,175,55,0.08)',
                          border: '1px solid rgba(212,175,55,0.15)',
                        }}
                      >
                        <Link2 size={13} className="text-mythos-accent/70" />
                      </div>
                      <div>
                        <div className="text-[0.55rem] uppercase tracking-[0.2em] text-white/30">Kozmos Bağlantıları</div>
                      </div>
                    </div>
                    <span 
                      className="text-[0.6rem] uppercase tracking-wider px-2 py-0.5 rounded-md"
                      style={{
                        background: 'rgba(212,175,55,0.08)',
                        color: 'rgba(212,175,55,0.6)',
                      }}
                    >
                      {connections.length} bağlantı
                    </span>
                  </div>

                  {/* Connection items */}
                  {connections.length > 0 ? (
                    <div className="p-3 flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                      {connections.map((conn) => {
                        const isSource = conn.sourceId === entity.id;
                        const otherEntityId = isSource ? conn.targetId : conn.sourceId;
                        const otherEntity = getEntityById(otherEntityId);
                        if (!otherEntity) return null;
                        
                        const relStyle = getRelationStyle(conn.relation);
                        const OtherIcon = otherEntity.type === 'character' ? User : otherEntity.type === 'place' ? MapPin : Calendar;
                        
                        return (
                          <div 
                            key={conn.id} 
                            className="flex items-center justify-between p-2.5 rounded-lg transition-all hover:scale-[1.01]"
                            style={{
                              background: 'rgba(0,0,0,0.25)',
                              border: '1px solid rgba(255,255,255,0.04)',
                            }}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div 
                                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                                style={{ background: 'rgba(255,255,255,0.04)' }}
                              >
                                <OtherIcon size={12} className="text-white/40" />
                              </div>
                              <span className="text-xs text-white/80 font-medium truncate">{otherEntity.name}</span>
                            </div>
                            <span 
                              className="text-[0.55rem] uppercase tracking-[0.15em] px-2.5 py-1 rounded-md shrink-0 font-medium"
                              style={{
                                background: relStyle.bg,
                                border: `1px solid ${relStyle.border}`,
                                color: relStyle.text,
                              }}
                            >
                              {relStyle.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-4 py-5 flex flex-col items-center gap-2">
                      <Sparkles size={16} className="text-white/15" />
                      <span className="text-[0.6rem] text-white/20 tracking-wider">Henüz bağlantı yok</span>
                    </div>
                  )}
                </motion.div>

                {/* ── Lore Note / Description ── */}
                <motion.div variants={itemVariants} className="relative">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div 
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{
                        background: 'rgba(212,175,55,0.06)',
                        border: '1px solid rgba(212,175,55,0.1)',
                      }}
                    >
                      <Scroll size={13} className="text-mythos-accent/50" />
                    </div>
                    <span className="text-[0.6rem] text-white/35 uppercase tracking-[0.2em] font-serif">Açıklama / Lore Notu</span>
                  </div>
                  <div 
                    className="relative p-5 rounded-xl text-sm text-white/60 leading-relaxed min-h-[90px] whitespace-pre-wrap"
                    style={{
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    {/* Decorative quote mark */}
                    <div className="absolute top-3 left-4 text-mythos-accent/8 text-4xl font-serif leading-none select-none pointer-events-none">"</div>
                    <div className="relative z-[1]">
                      {entity.description || (
                        <span className="italic text-white/25">Bu varlık için henüz detaylı bir bilgi girilmemiş.</span>
                      )}
                    </div>
                  </div>
                </motion.div>

              </motion.div>

              {/* Bottom decorative border */}
              <div className="h-[1px] bg-gradient-to-r from-transparent via-mythos-accent/10 to-transparent" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
