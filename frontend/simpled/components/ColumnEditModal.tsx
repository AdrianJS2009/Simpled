'use client';
import { fadeIn, scaleUp } from '@/lib/animation-variants';
import { motion } from 'framer-motion';
import type React from 'react';
import { useState } from 'react';
import { toast } from 'react-toastify';

const API = 'http://localhost:5193';

export default function ColumnEditModal({
  columnId,
  currentTitle,
  boardId,
  token,
  onClose,
  onUpdated,
}: Readonly<{
  columnId: string;
  currentTitle: string;
  boardId: string;
  token: string;
  onClose: () => void;
  onUpdated: () => void;
}>) {
  const [title, setTitle] = useState(currentTitle);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/Columns/${columnId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: columnId,
          title,
          boardId,
        }),
      });

      if (!res.ok) throw new Error('Error al actualizar la columna.');

      toast.success('Columna actualizada.');
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar columna.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="bg-opacity-40 fixed inset-0 z-50 flex items-center justify-center bg-black"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeIn}
    >
      <motion.div
        className="w-full max-w-md rounded bg-white p-6 shadow-lg dark:bg-neutral-900"
        variants={scaleUp}
      >
        <h2 className="mb-4 text-lg font-semibold">Editar columna</h2>
        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nuevo título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded border px-3 py-2"
          />
          <div className="flex justify-end gap-2">
            <motion.button
              type="button"
              onClick={onClose}
              className="rounded border px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-800"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Cancelar
            </motion.button>
            <motion.button
              type="submit"
              disabled={loading}
              className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
