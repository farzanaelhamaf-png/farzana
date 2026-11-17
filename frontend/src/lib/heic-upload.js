export function isHeicImage(file) {
  return /\.(heic|heif)$/i.test(file.name) || /^image\/hei[cf](?:$|-)/i.test(file.type);
}

export async function prepareImageFile(file) {
  if (!isHeicImage(file)) return file;

  const { default: convertHeic } = await import('heic2any');
  const converted = await convertHeic({
    blob: file,
    toType: 'image/jpeg',
    quality: 0.9,
  });
  const blob = Array.isArray(converted) ? converted[0] : converted;

  if (!blob) throw new Error('HEIC-bildet kunne ikke konverteres.');

  const name = file.name.replace(/\.(heic|heif)$/i, '') || 'image';
  return new File([blob], `${name}.jpg`, {
    type: 'image/jpeg',
    lastModified: file.lastModified,
  });
}
