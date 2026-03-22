'use client';

import { CloseAltIcon } from '@/components/icons';

export function DeleteAccountConfirmDialog({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      className="absolute inset-0 z-45 box-border flex items-center justify-center bg-white/90 p-6 backdrop-blur-sm"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-account-confirm-title"
        aria-describedby="delete-account-confirm-description"
        onClick={(event) => event.stopPropagation()}
        className="scrollbar-subtle box-border max-h-[calc(100%-48px)] w-[min(620px,calc(100%-48px))] overflow-y-auto rounded-[28px] border border-[#D9D9D9] bg-white"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#EEEEEE] px-6 pt-6 pb-4">
          <h3
            id="delete-account-confirm-title"
            className="m-0 font-sans text-[18px] leading-6.5 font-semibold tracking-normal text-black"
          >
            Видалити обліковий запис - ви впевнені?
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрити підтвердження видалення облікового запису"
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border-none bg-transparent text-[#171717] transition-colors hover:bg-[#F4F4F4] active:bg-[#F4F4F4]"
          >
            <CloseAltIcon width={20} height={20} aria-hidden="true" />
          </button>
        </div>

        <div id="delete-account-confirm-description" className="px-6 pt-4.5">
          <ul className="m-0 flex list-outside list-disc flex-col gap-2.5 pl-5.5 font-sans text-[14px] leading-5 font-normal tracking-normal text-black">
            <li>Видалення облікового запису є незворотним і його не можна скасувати.</li>
            <li>Ви не зможете створити новий обліковий запис із цією ж електронною адресою.</li>
            <li>
              Ваші дані буде видалено протягом 30 днів, але частина даних може зберігатися довше,
              якщо цього вимагає або дозволяє закон.
            </li>
          </ul>
        </div>

        <div className="mt-5.5 flex justify-end border-t border-[#EEEEEE] px-6 pt-3.5 pb-5.5">
          <button
            type="button"
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border-none bg-black px-6 font-sans text-[14px] leading-5 font-normal tracking-normal whitespace-nowrap text-white transition-colors hover:bg-black/80"
          >
            Остаточно видалити
          </button>
        </div>
      </div>
    </div>
  );
}
