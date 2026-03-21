/** Формати файлів для фільтра — кнопки-чіпи, множинний вибір */
export const FILE_FORMAT_OPTIONS: {
  id: string;
  label: string;
  exts: string[];
  mime?: string;
}[] = [
  { id: 'jpeg', label: 'JPEG', exts: ['jpg', 'jpeg'], mime: 'image/jpeg' },
  { id: 'png', label: 'PNG', exts: ['png'], mime: 'image/png' },
  { id: 'gif', label: 'GIF', exts: ['gif'], mime: 'image/gif' },
  { id: 'webp', label: 'WebP', exts: ['webp'], mime: 'image/webp' },
  { id: 'svg', label: 'SVG', exts: ['svg'], mime: 'image/svg' },
  { id: 'pdf', label: 'PDF', exts: ['pdf'], mime: 'application/pdf' },
  { id: 'doc', label: 'DOC', exts: ['doc'], mime: 'application/msword' },
  {
    id: 'docx',
    label: 'DOCX',
    exts: ['docx'],
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  { id: 'txt', label: 'TXT', exts: ['txt'], mime: 'text/plain' },
  { id: 'xls', label: 'XLS', exts: ['xls'], mime: 'application/vnd.ms-excel' },
  {
    id: 'xlsx',
    label: 'XLSX',
    exts: ['xlsx'],
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  { id: 'ppt', label: 'PPT', exts: ['ppt'], mime: 'application/vnd.ms-powerpoint' },
  {
    id: 'pptx',
    label: 'PPTX',
    exts: ['pptx'],
    mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  },
];

export function getFileFormatId(file: File): string | null {
  const name = file.name.toLowerCase();
  const ext = name.includes('.') ? name.replace(/.*\./, '').replace(/\?.*$/, '') : '';
  for (const opt of FILE_FORMAT_OPTIONS) {
    if (opt.exts.some((e) => e === ext) || (opt.mime && file.type === opt.mime)) return opt.id;
  }
  return null;
}

/** Повертає id формату для файлу; для невідомого — розширення (lowercase). */
export function getFileFormatIdOrExt(file: File): string {
  const id = getFileFormatId(file);
  if (id != null) return id;
  const name = file.name.toLowerCase();
  const ext = name.includes('.') ? name.replace(/.*\./, '').replace(/\?.*$/, '') : '';
  return ext || 'other';
}

/** Опція формату для чіпа фільтра (id + підпис). */
export function getFormatOptionForFile(file: File): { id: string; label: string } {
  const id = getFileFormatId(file);
  if (id != null) {
    const opt = FILE_FORMAT_OPTIONS.find((o) => o.id === id);
    return { id, label: opt?.label ?? id.toUpperCase() };
  }
  const name = file.name.toLowerCase();
  const ext = name.includes('.') ? name.replace(/.*\./, '').replace(/\?.*$/, '') : '';
  const label = ext ? ext.toUpperCase() : 'Інше';
  return { id: ext || 'other', label };
}
