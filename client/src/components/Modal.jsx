import { useEffect } from 'react';

export default function Modal({ title, onClose, children, maxWidth = 600 }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth }}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close btn" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
