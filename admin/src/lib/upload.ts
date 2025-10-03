export type UploadResult = { url: string; public_id?: string };
import { API_BASE_URL } from './api';

// Upload a single file to Cloudinary unsigned upload
export async function uploadToCloudinary(file: File): Promise<UploadResult> {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloud || !preset) {
    throw new Error('Missing Cloudinary env: set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET');
  }
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', preset);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Upload failed: ${res.status} ${txt}`);
  }
  const data = await res.json();
  return { url: data.secure_url || data.url, public_id: data.public_id };
}

// Signed upload: request signature from backend and upload with progress
export async function uploadToCloudinarySignedWithProgress(
  file: File,
  folder = 'niraya/products',
  onProgress?: (loaded: number, total: number, percent: number) => void
): Promise<UploadResult> {
  const authHeader = (() => {
    if (typeof window === 'undefined') return {} as Record<string, string>;
    try { const t = localStorage.getItem('niraya_admin_token'); return t ? { Authorization: `Bearer ${t}` } : {}; } catch { return {}; }
  })();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...authHeader };
  const res = await fetch(`${API_BASE_URL}/media/sign`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({ folder }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to get Cloudinary signature: ${res.status} ${text}`);
  }
  const { cloudName, apiKey, timestamp, signature } = await res.json();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
    xhr.open('POST', url);
    xhr.upload.onprogress = (e: ProgressEvent) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(e.loaded, e.total, percent);
      }
    };
    xhr.onload = () => {
      try {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          resolve({ url: data.secure_url || data.url, public_id: data.public_id });
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.responseText || ''}`));
        }
      } catch (err) {
        reject(err as any);
      }
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    const form = new FormData();
    form.append('file', file);
    form.append('api_key', apiKey);
    form.append('timestamp', String(timestamp));
    form.append('signature', signature);
    form.append('folder', folder);
    xhr.send(form);
  });
}

export async function uploadManyToCloudinarySignedWithProgress(
  files: File[],
  folder = 'niraya/products',
  onOverallProgress?: (percent: number) => void
): Promise<UploadResult[]> {
  const totalBytes = files.reduce((sum, f) => sum + (f.size || 0), 0) || 1;
  let loadedSum = 0;
  const results: UploadResult[] = [];
  for (let i = 0; i < files.length; i++) {
    let lastLoaded = 0;
    // eslint-disable-next-line no-await-in-loop
    const res = await uploadToCloudinarySignedWithProgress(files[i], folder, (loaded) => {
      loadedSum += loaded - lastLoaded;
      lastLoaded = loaded;
      if (onOverallProgress) onOverallProgress(Math.min(100, Math.round((loadedSum / totalBytes) * 100)));
    });
    results.push(res);
  }
  if (onOverallProgress) onOverallProgress(100);
  return results;
}

export async function uploadManyToCloudinary(files: File[]): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  for (const f of files) {
    // sequential to avoid overly aggressive rate limits
    // could be parallelized if needed
    // eslint-disable-next-line no-await-in-loop
    const r = await uploadToCloudinary(f);
    results.push(r);
  }
  return results;
}

// Progress-enabled single upload using XMLHttpRequest
export function uploadToCloudinaryWithProgress(
  file: File,
  onProgress?: (loaded: number, total: number, percent: number) => void
): Promise<UploadResult> {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string | undefined;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string | undefined;
  if (!cloud || !preset) {
    return Promise.reject(new Error('Missing Cloudinary env: set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET'));
  }
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `https://api.cloudinary.com/v1_1/${cloud}/upload`;
    xhr.open('POST', url);
    xhr.upload.onprogress = (e: ProgressEvent) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(e.loaded, e.total, percent);
      }
    };
    xhr.onload = () => {
      try {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          resolve({ url: data.secure_url || data.url, public_id: data.public_id });
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.responseText || ''}`));
        }
      } catch (err) {
        reject(err);
      }
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', preset);
    xhr.send(form);
  });
}

// Progress-enabled multiple uploads (sequential). onOverallProgress gets 0-100 across all files
export async function uploadManyToCloudinaryWithProgress(
  files: File[],
  onOverallProgress?: (percent: number) => void
): Promise<UploadResult[]> {
  const totalBytes = files.reduce((sum, f) => sum + (f.size || 0), 0) || 1;
  let loadedSum = 0;
  const results: UploadResult[] = [];
  for (let i = 0; i < files.length; i++) {
    let lastLoaded = 0;
    // eslint-disable-next-line no-await-in-loop
    const res = await uploadToCloudinaryWithProgress(files[i], (loaded) => {
      loadedSum += loaded - lastLoaded;
      lastLoaded = loaded;
      if (onOverallProgress) onOverallProgress(Math.min(100, Math.round((loadedSum / totalBytes) * 100)));
    });
    results.push(res);
  }
  if (onOverallProgress) onOverallProgress(100);
  return results;
}
