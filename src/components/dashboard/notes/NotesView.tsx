import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUniverseStore } from '@/store/useUniverseStore';
import { Plus, Trash2, X, Edit3, Save } from 'lucide-react';
import { useConfirmStore } from '@/store/useConfirmStore';
import type { Note } from '@/types';

export function NotesView() {
  const { getNotesForCurrentUniverse, addNote, updateNote, deleteNote } = useUniverseStore();
  const notes = getNotesForCurrentUniverse();
  const { showConfirm } = useConfirmStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleOpenModal = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setTitle(note.title);
      setContent(note.content);
    } else {
      setEditingNote(null);
      setTitle('');
      setContent('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
    setTitle('');
    setContent('');
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;

    if (editingNote) {
      updateNote(editingNote.id, {
        title: title.trim() || 'İsimsiz Not',
        content: content.trim()
      });
    } else {
      addNote({
        title: title.trim() || 'İsimsiz Not',
        content: content.trim()
      });
    }
    handleCloseModal();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirm({
      title: 'Notu Sil',
      message: 'Bu notu silmek istediğinize emin misiniz?',
      danger: true,
      confirmText: 'Sil',
      onConfirm: () => deleteNote(id),
    });
  };

  return (
    <div className="p-8 w-full h-full flex flex-col gap-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-white/90 flex items-center gap-3">
            Notlar
          </h1>
          <p className="text-sm text-white/40 mt-1">
            Evreninle ilgili serbest notlar al ve fikirlerini düzenle.
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-mythos-accent text-black rounded-md font-medium text-sm hover:bg-mythos-accent/90 transition-colors"
        >
          <Plus size={16} />
          Yeni Not
        </button>
      </div>

      {notes.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col items-center justify-center border border-white/5 bg-white/[0.02] rounded-xl p-8 text-center"
        >
          <p className="text-white/40 text-sm mb-4">Henüz hiç not eklenmemiş.</p>
          <button 
            onClick={() => handleOpenModal()}
            className="text-mythos-accent text-sm hover:underline"
          >
            İlk notunu ekle
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => handleOpenModal(note)}
                className="group relative glass-panel rounded-xl p-5 border border-white/5 hover:border-mythos-accent/30 transition-all cursor-pointer flex flex-col min-h-[160px]"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-serif text-white/90 text-sm truncate pr-4">{note.title}</h3>
                  <button 
                    onClick={(e) => handleDelete(note.id, e)}
                    className="absolute top-4 right-4 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="text-xs text-white/50 flex-1 overflow-hidden relative">
                  <div className="line-clamp-4 whitespace-pre-wrap">{note.content}</div>
                  {/* Fade out bottom text if it's too long */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#111113] to-transparent pointer-events-none" />
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-white/30">
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  <Edit3 size={10} className="group-hover:text-mythos-accent transition-colors" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Note Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0A0A0B] border border-glass-border rounded-xl shadow-2xl flex flex-col overflow-hidden"
              style={{ maxHeight: '85vh' }}
            >
              <div className="flex items-center justify-between p-4 border-b border-glass-border bg-white/[0.02]">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Not Başlığı..."
                  className="bg-transparent border-none outline-none font-serif text-lg text-white/90 w-full placeholder:text-white/30"
                  autoFocus
                />
                <button 
                  onClick={handleCloseModal}
                  className="p-1 text-white/40 hover:text-white transition-colors shrink-0"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Notunu buraya yaz..."
                  className="w-full min-h-[300px] bg-transparent border-none outline-none text-sm text-white/70 resize-none placeholder:text-white/20"
                />
              </div>

              <div className="p-4 border-t border-glass-border bg-white/[0.02] flex items-center justify-end gap-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-medium text-white/50 hover:text-white transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-mythos-accent text-black rounded-md font-medium text-xs hover:bg-mythos-accent/90 transition-colors"
                >
                  <Save size={14} />
                  Kaydet
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
