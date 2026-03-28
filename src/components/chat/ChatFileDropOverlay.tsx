'use client';

import { PaperclipIcon } from '@/components/icons';

export function ChatFileDropOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-90 flex items-center justify-center bg-white/50 px-6 backdrop-blur-[10px]"
      aria-hidden="true"
    >
      <div className="flex w-full max-w-96 flex-col items-center rounded-[32px] bg-[#FCFCFC]/96 px-8 py-9 text-center">
        <div className="mb-6 flex h-17 w-17 items-center justify-center rounded-[22px] bg-[#F1F4F8]">
          <PaperclipIcon width={28} height={28} className="text-[#5A9BFF]" aria-hidden="true" />
        </div>
        <p className="font-sans text-[17px] leading-[24px] font-semibold tracking-[-0.02em] text-[#202020]">
          Готово до додавання
        </p>
        <p className="mt-2 max-w-62 font-sans text-[14px] leading-[22px] font-medium tracking-[-0.01em] text-[#7C828D]">
          Відпустіть файл у будь-якому місці, щоб прикріпити його до повідомлення.
        </p>
      </div>
    </div>
  );
}

export default ChatFileDropOverlay;
