import { Heart } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWishlist } from '../hooks/useWishlist';

/**
 * Heart toggle used on both ProductCard (small, floating) and ProductDetail
 * (larger, inline). Guests are sent to log in rather than the button
 * silently failing — the wishlist is per-account.
 */
export default function WishlistButton({ productId, size = 'md', className = '' }) {
  const { isAuthenticated } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const active = isWishlisted(productId);
  const dimensions = size === 'lg' ? 'h-11 w-11' : 'h-9 w-9';
  const iconSize = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  async function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setBusy(true);
    try {
      await toggle(productId);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-pressed={active}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      title={active ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`flex ${dimensions} items-center justify-center rounded-full bg-white/90 shadow-sm ring-1 ring-gray-200 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <Heart
        className={`${iconSize} transition ${active ? 'fill-primary-600 text-primary-600' : 'text-gray-500'}`}
        aria-hidden="true"
      />
    </button>
  );
}
