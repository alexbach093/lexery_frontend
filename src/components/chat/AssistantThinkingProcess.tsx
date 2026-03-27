'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import {
  SearchIcon,
  ThinkingLawsIcon,
  ThinkingSparkleIcon,
  ThinkingWorkspaceIcon,
} from '@/components/icons';
import { cn } from '@/lib/utils';

type ThinkingTraceQuery = {
  icon: 'search' | 'site_logo' | 'law';
  label: string;
};

const THINKING_RADA_LOGO_SRC = '/rada-logo.png';

const THINKING_PHASES = [
  {
    label: 'Розуміння запиту',
    summary:
      'Перегляну запит, зберу найрелевантніший контекст і окреслю відповідь, перш ніж формувати фінальний результат.',
  },
  {
    label: 'Планування підходу',
    summary:
      'Ось план. Пройдуся по кожному кроку послідовно, щоб фінальна відповідь була структурованою та цілісною.',
  },
];

const THINKING_PLAN_ITEMS = [
  'Переглянути запит користувача й визначити головну ціль',
  'Звірити активний контекст чату та останні повідомлення',
  'Окреслити структуру відповіді перед написанням',
  'Скласти відповідь із потрібним рівнем деталізації',
  'Відшліфувати формулювання й фінальну подачу',
];

const THINKING_TRACE_ITEMS = [
  {
    title: 'Збираючи контекст запиту, історію діалогу та всі видимі вкладення',
    icon: ThinkingSparkleIcon,
    queries: [] as ThinkingTraceQuery[],
  },
  {
    title: 'Підбираючи релевантний контекст workspace для наступного кроку',
    icon: ThinkingWorkspaceIcon,
    queries: [
      { icon: 'search', label: 'UI layout tabs timeline steps' },
      { icon: 'search', label: 'assistant links images query card' },
      { icon: 'search', label: 'vertical progress reasoning list' },
      { icon: 'site_logo', label: 'rada.gov.ua official parliament pages' },
      { icon: 'site_logo', label: 'zakon.rada.gov.ua legal documents portal' },
    ],
  },
  {
    title: 'Формуючи список законів',
    icon: ThinkingLawsIcon,
    queries: [
      {
        icon: 'law',
        label: 'Конституція України',
        href: 'https://zakon.rada.gov.ua/go/254%D0%BA/96-%D0%B2%D1%80',
      },
      {
        icon: 'law',
        label: 'Закон України "Про доступ до публічної інформації"',
        href: 'https://zakon.rada.gov.ua/go/2939-17',
      },
      {
        icon: 'law',
        label: 'Закон України "Про звернення громадян"',
        href: 'https://zakon.rada.gov.ua/go/393/96-%D0%B2%D1%80',
      },
      {
        icon: 'law',
        label: 'Закон України "Про Кабінет Міністрів України"',
        href: 'https://zakon.rada.gov.ua/go/794-18',
      },
    ],
  },
];

const THINKING_LEADING_ICON_WRAPPER_CLASS =
  'flex h-6 w-6 shrink-0 items-center justify-center text-[#8F8F8F]';
const THINKING_LEADING_ICON_CLASS =
  'h-[18px] w-[18px] shrink-0 text-[#8F8F8F] [&_path]:stroke-[1.2]';
const THINKING_TRACE_ICON_CLASS = 'h-[18px] w-[18px] shrink-0 text-[#8F8F8F] [&_path]:stroke-[1.2]';
const THINKING_SECONDARY_SEARCH_ICON_CLASS =
  'h-4 w-4 shrink-0 text-[#969696] [&_path]:stroke-[1.9]';
const THINKING_SECONDARY_SITE_LOGO_CLASS = 'h-4 w-4 shrink-0 object-contain';
const THINKING_SECONDARY_LAW_ICON_CLASS = 'h-4 w-4 shrink-0 text-[#969696]';
const THINKING_ROW_LAYOUT_CLASS = 'grid grid-cols-[20px_minmax(0,1fr)] items-stretch gap-x-3';
const THINKING_TRACE_LINE_MASK_CLASS =
  'absolute left-1/2 top-1/2 h-[30px] w-6 -translate-x-1/2 -translate-y-1/2 bg-white';

interface AssistantThinkingProcessProps {
  isPinned?: boolean;
}

export function AssistantThinkingProcess({ isPinned = false }: AssistantThinkingProcessProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [collapsedPhaseIndexes, setCollapsedPhaseIndexes] = useState<number[]>([]);
  const [expandedPinnedPhaseIndexes, setExpandedPinnedPhaseIndexes] = useState<number[]>([]);
  const [collapsedTraceIndexes, setCollapsedTraceIndexes] = useState<number[]>([]);

  useEffect(() => {
    if (isPinned) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveStepIndex((currentIndex) => (currentIndex + 1) % THINKING_PHASES.length);
    }, 2200);

    return () => window.clearInterval(intervalId);
  }, [isPinned]);

  const togglePhase = (index: number) => {
    const isActive = index === activeStepIndex;

    if (!isPinned && !isActive) {
      setCollapsedPhaseIndexes((currentIndexes) =>
        currentIndexes.filter((currentIndex) => currentIndex !== index)
      );
      setActiveStepIndex(index);
      return;
    }

    if (isPinned && !isActive) {
      setExpandedPinnedPhaseIndexes((currentIndexes) =>
        currentIndexes.includes(index)
          ? currentIndexes.filter((currentIndex) => currentIndex !== index)
          : [...currentIndexes, index].sort((left, right) => left - right)
      );
      return;
    }

    setCollapsedPhaseIndexes((currentIndexes) =>
      currentIndexes.includes(index)
        ? currentIndexes.filter((currentIndex) => currentIndex !== index)
        : [...currentIndexes, index].sort((left, right) => left - right)
    );
  };

  const toggleTraceStage = (index: number) => {
    setCollapsedTraceIndexes((currentIndexes) =>
      currentIndexes.includes(index)
        ? currentIndexes.filter((currentIndex) => currentIndex !== index)
        : [...currentIndexes, index].sort((left, right) => left - right)
    );
  };

  return (
    <div className="w-full min-w-0" aria-live="polite" aria-label="Процес міркування">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2.5">
          {THINKING_PHASES.map((phase, index) => {
            const isActive = index === activeStepIndex;
            const isExpanded =
              (isPinned && expandedPinnedPhaseIndexes.includes(index)) ||
              (isActive && !collapsedPhaseIndexes.includes(index));

            return (
              <div key={phase.label} className="transition-all duration-400 ease-out">
                <div className={cn('mb-1.5', THINKING_ROW_LAYOUT_CLASS, 'text-[#8E8E8E]')}>
                  <span className={THINKING_LEADING_ICON_WRAPPER_CLASS}>
                    <ThinkingSparkleIcon
                      width={18}
                      height={18}
                      className={THINKING_LEADING_ICON_CLASS}
                      aria-hidden="true"
                    />
                  </span>
                  <button
                    type="button"
                    onClick={() => togglePhase(index)}
                    aria-expanded={isExpanded}
                    className="flex min-w-0 items-center text-left"
                  >
                    <span className="font-sans text-[14px] leading-6 font-medium tracking-[0.01em] text-[#8E8E8E] transition-colors hover:text-[#666666]">
                      {phase.label} · 1 с
                    </span>
                  </button>
                </div>

                {isExpanded ? (
                  <p className="min-w-0 pl-5.5 font-sans text-[14px] leading-7 font-normal tracking-[-0.01em] text-[#2A2A2A]">
                    {phase.summary}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="w-full rounded-[18px] border border-[#ECECEC] bg-white px-4 py-3.5">
          <div className="flex flex-col gap-3">
            {THINKING_PLAN_ITEMS.map((item, index) => (
              <div key={item} className="flex items-start gap-3">
                <span
                  className={cn(
                    'mt-1 h-4.5 w-4.5 shrink-0 rounded-full border transition-colors duration-300',
                    index <= activeStepIndex
                      ? 'border-[#D2D2D2] bg-[#FAFAFA]'
                      : 'border-[#E5E5E5] bg-transparent'
                  )}
                />
                <p className="font-sans text-[14px] leading-6 font-normal tracking-[-0.01em] text-[#555555]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="font-sans text-[14px] leading-7 font-normal tracking-[-0.01em] text-[#2A2A2A]">
          Ось мій план. Я послідовно пройду кожен етап перед тим, як віддати фінальну відповідь.
        </p>

        <div className="relative">
          <span
            aria-hidden="true"
            className="absolute top-[7px] -bottom-[19px] left-3 w-px -translate-x-1/2 bg-[#ECECEC]"
          />

          <div className="relative flex flex-col gap-7">
            {THINKING_TRACE_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const isExpanded = !collapsedTraceIndexes.includes(index);
              const hasQueries = item.queries.length > 0;
              const isLawList = hasQueries && item.queries.every((query) => query.icon === 'law');

              return (
                <div key={item.title} className="grid grid-cols-[24px_minmax(0,1fr)] gap-x-4">
                  <div className="relative z-10 flex justify-center">
                    <span className="relative flex h-6 w-6 items-center justify-center">
                      <span aria-hidden="true" className={THINKING_TRACE_LINE_MASK_CLASS} />
                      <Icon
                        width={18}
                        height={18}
                        className={
                          Icon === ThinkingSparkleIcon
                            ? cn(THINKING_TRACE_ICON_CLASS, 'relative z-10')
                            : cn(THINKING_TRACE_ICON_CLASS, 'relative z-10 [&_path]:stroke-[1.95]')
                        }
                        aria-hidden="true"
                      />
                    </span>
                  </div>

                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleTraceStage(index)}
                      aria-expanded={isExpanded}
                      className="flex min-h-6 w-full items-center text-left"
                    >
                      <span className="min-w-0 font-sans text-[14px] leading-6 font-normal tracking-[-0.01em] text-[#6D6D6D]">
                        {item.title}
                      </span>
                    </button>

                    {isExpanded && hasQueries ? (
                      <div className="min-w-0 pt-3">
                        {isLawList ? (
                          <div className="flex flex-col gap-3">
                            {item.queries.map((query) => (
                              <div
                                key={`${query.icon}-${query.label}`}
                                className="grid grid-cols-[18px_minmax(0,1fr)] items-start gap-x-3"
                              >
                                <span className="mt-0.5 flex h-5 w-5 items-center justify-center">
                                  <Image
                                    src={THINKING_RADA_LOGO_SRC}
                                    alt="zakon.rada.gov.ua"
                                    width={16}
                                    height={16}
                                    className={THINKING_SECONDARY_SITE_LOGO_CLASS}
                                  />
                                </span>
                                <a
                                  href={query.href}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(event) => event.stopPropagation()}
                                  className="inline-block w-fit font-sans text-[12px] leading-6 font-normal tracking-[-0.01em] text-[#6F6F6F] underline decoration-[#C7C7C7] underline-offset-[3px] transition-colors hover:text-[#4F4F4F]"
                                >
                                  {query.label}
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2.5 pl-0.5">
                            {item.queries.map((query) => (
                              <div
                                key={`${query.icon}-${query.label}`}
                                className="grid grid-cols-[18px_minmax(0,1fr)] items-start gap-x-3"
                              >
                                <span className="mt-0.5 flex h-5 w-5 items-center justify-center text-[#969696]">
                                  {query.icon === 'site_logo' ? (
                                    <Image
                                      src={THINKING_RADA_LOGO_SRC}
                                      alt="rada.gov.ua"
                                      width={16}
                                      height={16}
                                      className={THINKING_SECONDARY_SITE_LOGO_CLASS}
                                    />
                                  ) : query.icon === 'law' ? (
                                    <ThinkingLawsIcon
                                      width={16}
                                      height={16}
                                      className={THINKING_SECONDARY_LAW_ICON_CLASS}
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    <SearchIcon
                                      width={16}
                                      height={16}
                                      className={THINKING_SECONDARY_SEARCH_ICON_CLASS}
                                      aria-hidden="true"
                                    />
                                  )}
                                </span>
                                <p className="font-sans text-[12px] leading-6 font-normal tracking-[-0.01em] text-[#7F7F7F]">
                                  {query.label}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssistantThinkingProcess;
