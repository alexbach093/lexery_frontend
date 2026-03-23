'use client';

import { useRouter } from 'next/navigation';
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { SettingsGearIcon, SettingsDatabaseIcon, SettingsShieldIcon } from '@/components/icons';
import { getAppPreferences, setMemoryEnabledPreference } from '@/lib/app-preferences';
import { getSettingsPath, getWorkspaceHomePath } from '@/lib/app-routes';
import { clearChatLibrary } from '@/lib/chat-library';
import type { SectionId, SettingRow } from '@/types';

import { SECTIONS } from '../settings/constants';
import { DeleteAccountConfirmDialog } from '../settings/DeleteAccountConfirmDialog';
import { DeleteChatsConfirmDialog } from '../settings/DeleteChatsConfirmDialog';
import {
  SettingsCloseButton,
  SettingsTab,
  ActionButton,
  SelectLikeControl,
  ToggleControl,
} from '../settings/SettingsControls';
import { SettingRowItem } from '../settings/SettingsRowItem';

interface SettingsScreenProps {
  activeSection: SectionId;
}

export function SettingsScreen({ activeSection }: SettingsScreenProps) {
  const router = useRouter();
  const [memoryEnabled, setMemoryEnabled] = useState(() => getAppPreferences().memoryEnabled);
  const [deleteChatsConfirmOpen, setDeleteChatsConfirmOpen] = useState(false);
  const [deleteAccountConfirmOpen, setDeleteAccountConfirmOpen] = useState(false);

  const sectionIcons = useMemo<Record<SectionId, ReactNode>>(
    () => ({
      general: <SettingsGearIcon width={18} height={18} aria-hidden="true" />,
      info: <SettingsDatabaseIcon width={18} height={18} aria-hidden="true" />,
      security: <SettingsShieldIcon width={18} height={18} aria-hidden="true" />,
    }),
    []
  );

  const activeSectionData = SECTIONS.find((section) => section.id === activeSection) ?? SECTIONS[0];

  const handleClose = useCallback(() => {
    router.replace(getWorkspaceHomePath());
  }, [router]);

  const handleSectionSelect = useCallback(
    (sectionId: SectionId) => {
      if (sectionId === activeSection) {
        return;
      }

      router.push(getSettingsPath(sectionId));
    },
    [activeSection, router]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      if (deleteChatsConfirmOpen || deleteAccountConfirmOpen) {
        setDeleteChatsConfirmOpen(false);
        setDeleteAccountConfirmOpen(false);
        return;
      }

      handleClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [deleteAccountConfirmOpen, deleteChatsConfirmOpen, handleClose]);

  const handleDeleteChatsConfirm = useCallback(async () => {
    try {
      await clearChatLibrary();
    } finally {
      setDeleteChatsConfirmOpen(false);
      router.replace(getWorkspaceHomePath());
    }
  }, [router]);

  const handleBackdropClick = (event: ReactMouseEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    handleClose();
  };

  const renderControl = (row: SettingRow) => {
    if (row.kind === 'theme') {
      return (
        <SelectLikeControl>
          <span>Світла</span>
        </SelectLikeControl>
      );
    }

    if (row.kind === 'value') {
      return (
        <SelectLikeControl>
          <span>{row.value}</span>
        </SelectLikeControl>
      );
    }

    if (row.kind === 'toggle') {
      return (
        <ToggleControl
          checked={memoryEnabled}
          onClick={() => {
            setMemoryEnabled((currentValue) => {
              const nextValue = !currentValue;
              setMemoryEnabledPreference(nextValue);
              return nextValue;
            });
          }}
        />
      );
    }

    return (
      <ActionButton
        danger={row.danger}
        disabled={row.disabled}
        onClick={
          row.id === 'delete-chats'
            ? () => {
                setDeleteAccountConfirmOpen(false);
                setDeleteChatsConfirmOpen(true);
              }
            : row.id === 'delete-account'
              ? () => {
                  setDeleteChatsConfirmOpen(false);
                  setDeleteAccountConfirmOpen(true);
                }
              : undefined
        }
      >
        {row.actionLabel}
      </ActionButton>
    );
  };

  return (
    <main
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 box-border flex items-center justify-center bg-white/80 p-6 backdrop-blur-sm"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Налаштування"
        onClick={(event) => event.stopPropagation()}
        className="relative grid min-h-141 w-full max-w-188 grid-cols-[186px_minmax(0,1fr)] overflow-hidden rounded-[22px] border border-[#D9D9D9] bg-white"
      >
        {deleteAccountConfirmOpen && (
          <DeleteAccountConfirmDialog onClose={() => setDeleteAccountConfirmOpen(false)} />
        )}
        {deleteChatsConfirmOpen && (
          <DeleteChatsConfirmDialog
            onCancel={() => setDeleteChatsConfirmOpen(false)}
            onConfirm={handleDeleteChatsConfirm}
          />
        )}

        <aside className="flex min-h-141 flex-col border-r border-[#ECECEC] bg-[#FDFDFD]">
          <div className="px-3 pt-3 pb-2.5">
            <SettingsCloseButton onClick={handleClose} />
          </div>

          <div
            role="tablist"
            aria-orientation="vertical"
            className="flex flex-col px-2 pt-1.5 pb-3"
          >
            {SECTIONS.map((section) => (
              <SettingsTab
                key={section.id}
                label={section.label}
                active={activeSection === section.id}
                icon={sectionIcons[section.id]}
                onClick={() => handleSectionSelect(section.id)}
              />
            ))}
          </div>
        </aside>

        <section className="flex min-h-141 flex-col bg-white">
          <div className="scrollbar-subtle min-h-0 flex-1 overflow-y-auto px-4.5 pt-4.5">
            <div className="flex min-h-13 items-center border-b border-[#ECECEC]">
              <h2 className="m-0 font-sans text-[17px] leading-6 font-normal tracking-normal text-[#171717]">
                {activeSectionData.label}
              </h2>
            </div>

            <div>
              {activeSectionData.rows.map((row, index) => (
                <SettingRowItem
                  key={row.id}
                  row={row}
                  control={renderControl(row)}
                  isLast={index === activeSectionData.rows.length - 1}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default SettingsScreen;
