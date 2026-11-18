import { ApiError, request } from './client';

const MAX_KYC_DOCUMENT_SIZE = 10 * 1024 * 1024;
const KYC_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export type KycDocumentFile = {
  uri: string;
  name: string;
  mimeType?: string | null;
  size?: number | null;
};

function contentTypeFor(file: KycDocumentFile) {
  const byExtension: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    pdf: 'application/pdf',
  };
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const contentType = file.mimeType || byExtension[extension];
  if (!contentType || !KYC_CONTENT_TYPES.includes(contentType)) {
    throw new ApiError('Choose a JPG, PNG, WebP, or PDF document.', 400, 'invalid_kyc_document_type');
  }
  return contentType;
}

export async function uploadKycDocument(file: KycDocumentFile) {
  const contentType = contentTypeFor(file);
  if (typeof file.size === 'number' && file.size > MAX_KYC_DOCUMENT_SIZE) {
    throw new ApiError('KYC documents must be 10 MB or smaller.', 413, 'kyc_document_too_large');
  }

  let localResponse: Response;
  try {
    localResponse = await fetch(file.uri);
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Unable to read the selected KYC document.', 0, 'file_read_error');
  }
  if (!localResponse.ok) throw new ApiError('Unable to read the selected KYC document.', localResponse.status, 'file_read_error');
  const document = await localResponse.blob();
  if (!document.size) throw new ApiError('The selected KYC document is empty.', 400, 'empty_kyc_document');
  if (document.size > MAX_KYC_DOCUMENT_SIZE) {
    throw new ApiError('KYC documents must be 10 MB or smaller.', 413, 'kyc_document_too_large');
  }

  const grant = await request<Record<string, unknown>>('/v1/uploads/', {
    method: 'POST',
    body: JSON.stringify({ kind: 'kyc_document', contentType, size: document.size }),
  });
  const upload = grant.upload && typeof grant.upload === 'object'
    ? grant.upload as Record<string, unknown>
    : grant;
  const uploadId = typeof upload.id === 'string'
    ? upload.id
    : typeof upload.uploadId === 'string' ? upload.uploadId : '';
  const uploadUrl = typeof grant.uploadUrl === 'string'
    ? grant.uploadUrl
    : typeof upload.uploadUrl === 'string' ? upload.uploadUrl : '';
  if (!uploadId || !uploadUrl) {
    throw new ApiError('The server returned incomplete KYC upload details.', 200);
  }
  if (!/^https:\/\//i.test(uploadUrl)) {
    throw new ApiError('The server returned an insecure KYC upload URL.', 200);
  }

  const headers = new Headers();
  const uploadHeaders = grant.headers && typeof grant.headers === 'object'
    ? grant.headers
    : upload.headers;
  if (uploadHeaders && typeof uploadHeaders === 'object') {
    Object.entries(uploadHeaders as Record<string, unknown>).forEach(([name, value]) => {
      if (typeof value === 'string') headers.set(name, value);
    });
  }
  headers.set('Content-Type', contentType);

  let uploadResponse: Response;
  try {
    uploadResponse = await fetch(uploadUrl, { method: 'PUT', headers, body: document });
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Unable to upload the KYC document.', 0, 'kyc_upload_error');
  }
  if (!uploadResponse.ok) {
    throw new ApiError(`KYC document upload failed (${uploadResponse.status}).`, uploadResponse.status, 'kyc_upload_error');
  }

  await request(`/v1/uploads/${encodeURIComponent(uploadId)}/complete/`, { method: 'POST' });
  return uploadId;
}
