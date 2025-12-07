export async function fileTo128DataUrl(file: File): Promise<string> {
  try {
    if (!file || !file.type.startsWith('image/')) return '';

    const objectUrl = URL.createObjectURL(file);

    const img = await loadImage(objectUrl);

    const size = 128;

    // Compute centered square crop
    const minSide = Math.min(img.width, img.height);
    const sx = Math.floor((img.width - minSide) / 2);
    const sy = Math.floor((img.height - minSide) / 2);

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

    URL.revokeObjectURL(objectUrl);

    return canvas.toDataURL('image/png');
  } catch {
    return '';
  }
}

/** Loads an image and rejects with an Error object (ESLint compliant) */
async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image: ' + url));
    img.src = url;
  });
}
