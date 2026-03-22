'use client';

export function DeleteChatsConfirmDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      onClick={onCancel}
      className="absolute inset-0 z-40 box-border flex items-center justify-center bg-white/88"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-chats-confirm-title"
        aria-describedby="delete-chats-confirm-description"
        onClick={(event) => event.stopPropagation()}
        className="box-border flex h-38 w-109 flex-col items-center justify-start rounded-[28px] border border-[#D9D9D9] bg-white pt-7 pr-6 pb-5.5 pl-6"
      >
        <h3
          id="delete-chats-confirm-title"
          className="m-0 text-center font-sans text-[16px] leading-5.5 font-bold tracking-normal text-black"
        >
          Очистити історію чатів - ви впевнені?
        </h3>
        <p
          id="delete-chats-confirm-description"
          className="mt-1.5 text-center font-sans text-[12px] leading-4.25 font-normal tracking-normal text-black/40"
        >
          Щоб очистити пам&apos;ять із чатів, зайдіть у{' '}
          <span className="underline">налаштування.</span>
        </p>
        <div className="mt-3.75 flex items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10.5 w-25.5 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white px-4 font-sans text-[15px] leading-5.25 font-normal tracking-normal whitespace-nowrap text-black transition-colors hover:bg-[#F4F4F4]"
          >
            Скасувати
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-10.5 min-w-43 cursor-pointer items-center justify-center rounded-full border-none bg-[#FF4747] px-4.5 font-sans text-[15px] leading-5.25 font-normal tracking-normal whitespace-nowrap text-white transition-colors hover:bg-[#ff3333]"
          >
            Підтвердити видалення
          </button>
        </div>
      </div>
    </div>
  );
}
