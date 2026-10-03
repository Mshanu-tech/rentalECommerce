import { useCallback, useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';

// Every product image is exported at exactly this size so the catalog, cards and gallery
// all get identical, square photos.
export const PRODUCT_IMAGE_SIZE = 1000;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not read this image.'));
    img.src = src;
  });
}

async function cropToFile(src, area, originalFile) {
  const img = await loadImage(src);
  const canvas = document.createElement('canvas');
  canvas.width = PRODUCT_IMAGE_SIZE;
  canvas.height = PRODUCT_IMAGE_SIZE;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);

  const type = originalFile.type === 'image/png' ? 'image/png' : originalFile.type === 'image/webp' ? 'image/webp' : 'image/jpeg';
  const ext = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg';
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, 0.92));
  if (!blob) throw new Error('Could not crop this image.');
  const baseName = originalFile.name.replace(/\.[^.]+$/, '') || 'product';
  return new File([blob], `${baseName}.${ext}`, { type });
}

/**
 * Modal that crops one image to a fixed square. `file` is the image being cropped;
 * `onDone(croppedFile)` or `onCancel()` is called when the admin finishes.
 */
export default function ImageCropper({ file, index, total, onDone, onCancel }) {
  const [src, setSrc] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setArea(null);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onCropComplete = useCallback((_, pixels) => setArea(pixels), []);

  async function handleApply() {
    if (!area) return;
    setSaving(true);
    setError('');
    try {
      onDone(await cropToFile(src, area, file));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Crop image">
      <div className="w-full max-w-lg rounded-t-3xl bg-white p-4 shadow-xl sm:rounded-3xl sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Crop image</h2>
          {total > 1 && <span className="text-xs text-gray-500">{index + 1} of {total}</span>}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Drag to reposition and zoom to fit. All product images are saved at the same square size.
        </p>

        <div className="relative mt-4 h-72 w-full overflow-hidden rounded-2xl bg-gray-900 sm:h-80">
          {src && (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </div>

        <label className="mt-4 flex items-center gap-3 text-xs font-medium text-gray-600">
          Zoom
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-primary-600"
          />
        </label>

        {error && <p className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-600">{error}</p>}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={saving || !area}
            className="rounded-full bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {saving ? 'Cropping…' : index + 1 < total ? 'Crop & next' : 'Crop & add'}
          </button>
        </div>
      </div>
    </div>
  );
}
