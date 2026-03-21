import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { AttachedFile } from '@/components/attachments';
import { getFileFormatIdOrExt, getFormatOptionForFile } from '@/components/attachments';

export function useChatAttachments() {
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<Set<string>>(new Set());
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [filesOverflow, setFilesOverflow] = useState(false);
  const [filesExpanded, setFilesExpanded] = useState(false);
  const [expandButtonClosing, setExpandButtonClosing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileListRef = useRef<HTMLDivElement>(null);
  const fileListScrollRef = useRef<HTMLDivElement>(null);
  const expandCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const availableFormatOptions = useMemo(() => {
    const seen = new Set<string>();
    const list: { id: string; label: string }[] = [];
    for (const { file } of attachedFiles) {
      const opt = getFormatOptionForFile(file);
      if (!seen.has(opt.id)) {
        seen.add(opt.id);
        list.push(opt);
      }
    }
    return list;
  }, [attachedFiles]);

  const filteredAttachedFiles = useMemo(
    () =>
      attachedFiles
        .map((item, originalIndex) => ({ item, originalIndex }))
        .filter(({ item }) => {
          if (selectedFormats.size > 0 && !selectedFormats.has(getFileFormatIdOrExt(item.file)))
            return false;
          if (
            fileSearchQuery.trim() &&
            !item.file.name.toLowerCase().includes(fileSearchQuery.trim().toLowerCase())
          )
            return false;
          return true;
        }),
    [attachedFiles, selectedFormats, fileSearchQuery]
  );

  useEffect(() => {
    if (availableFormatOptions.length === 0) return;
    const ids = new Set(availableFormatOptions.map((opt) => opt.id));
    const rafId = requestAnimationFrame(() => {
      setSelectedFormats((prev) => {
        const next = new Set([...prev].filter((id) => ids.has(id)));
        return next.size === prev.size ? prev : next;
      });
    });
    return () => cancelAnimationFrame(rafId);
  }, [availableFormatOptions]);

  useEffect(() => {
    if (attachedFiles.length === 0) {
      queueMicrotask(() => {
        setFilesOverflow(false);
        setFilesExpanded(false);
        setExpandButtonClosing(false);
        setSelectedFormats(new Set());
        setFileSearchQuery('');
      });
      return;
    }

    const element = fileListRef.current;
    if (!element) return;

    const checkOverflow = () => setFilesOverflow(element.scrollWidth > element.clientWidth);
    checkOverflow();

    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [attachedFiles.length, filesExpanded]);

  useEffect(() => {
    return () => {
      if (expandCloseTimeoutRef.current) clearTimeout(expandCloseTimeoutRef.current);
    };
  }, []);

  const releaseDraftAttachments = useCallback((filesToRelease: AttachedFile[]) => {
    filesToRelease.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
  }, []);

  const resetAttachments = useCallback(() => {
    setAttachedFiles((prev) => {
      releaseDraftAttachments(prev);
      return [];
    });
    setFilesOverflow(false);
    setFilesExpanded(false);
    setExpandButtonClosing(false);
    setSelectedFormats(new Set());
    setFileSearchQuery('');
  }, [releaseDraftAttachments]);

  const handleExpandToggle = useCallback(() => {
    setFilesExpanded((prev) => {
      if (prev) {
        setExpandButtonClosing(true);
        if (expandCloseTimeoutRef.current) clearTimeout(expandCloseTimeoutRef.current);
        expandCloseTimeoutRef.current = setTimeout(() => {
          setExpandButtonClosing(false);
          expandCloseTimeoutRef.current = null;
        }, 400);
      } else {
        if (expandCloseTimeoutRef.current) {
          clearTimeout(expandCloseTimeoutRef.current);
          expandCloseTimeoutRef.current = null;
        }
        setExpandButtonClosing(false);
      }
      return !prev;
    });
  }, []);

  const handleRemoveAllFiles = useCallback(() => {
    setAttachedFiles((prev) => {
      releaseDraftAttachments(prev);
      return [];
    });
  }, [releaseDraftAttachments]);

  const handleRemoveFile = useCallback((index: number) => {
    setAttachedFiles((prev) => {
      const item = prev[index];
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((_, currentIndex) => currentIndex !== index);
    });
  }, []);

  const handleAttach = useCallback((files: File[]) => {
    const nextItems: AttachedFile[] = Array.from(files).map((file) => ({
      file,
      previewUrl:
        file.type.startsWith('image/') ||
        /\.(png|jpe?g|gif|webp|bmp|svg|avif)(\?|$)/i.test(file.name)
          ? URL.createObjectURL(file)
          : null,
    }));
    setAttachedFiles((prev) => [...prev, ...nextItems]);
  }, []);

  const showExpandButton = filesOverflow || filesExpanded || expandButtonClosing;

  return {
    attachedFiles,
    filteredAttachedFiles,
    availableFormatOptions,
    selectedFormats,
    setSelectedFormats,
    fileSearchQuery,
    setFileSearchQuery,
    filesExpanded,
    showExpandButton,
    fileInputRef,
    fileListRef,
    fileListScrollRef,
    handleAttach,
    handleRemoveFile,
    handleRemoveAllFiles,
    handleExpandToggle,
    resetAttachments,
  };
}
