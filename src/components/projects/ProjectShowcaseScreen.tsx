import ScreenBackButton from '../ScreenBackButton';

interface ProjectStat {
  label: string;
  value: string;
}

type ProjectShowcaseScreenProps = Readonly<{
  onBack: () => void;
  iconSrc: string;
  iconAlt: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryCta?: { label: string; href: string };
  stats: ProjectStat[];
  features: string[];
  featuresTitle?: string;
  previewImages: string[];
  previewTitle?: string;
  description: string;
  stack: string;
  /** Aspect ratio of the icon: apps are rounded squares, books are portrait covers. */
  iconShape?: 'square' | 'cover';
}>;

export default function ProjectShowcaseScreen({
  onBack,
  iconSrc,
  iconAlt,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  secondaryCta,
  stats,
  features,
  featuresTitle = 'Key features',
  previewImages,
  previewTitle = 'Preview',
  description,
  stack,
  iconShape = 'square',
}: ProjectShowcaseScreenProps) {
  const iconBoxClass =
    iconShape === 'cover'
      ? 'h-[130px] w-[84px] rounded-[10px]'
      : 'h-[110px] w-[110px] rounded-[24px]';
  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-[#F5F0E8] text-[#1A3333]">
      <header className="relative z-30 shrink-0 px-3 pb-2 pt-3 md:pb-4 md:pt-14">
        <div className="relative min-h-[44px]">
          <ScreenBackButton
            onBack={onBack}
            label="Back to home"
            iconClassName="text-[#1A3333]"
            buttonClassName="hover:bg-black/5"
          />
        </div>
      </header>

      <div
        className="relative z-10 min-h-0 flex-1 overflow-y-auto px-5 pb-8 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <section className="mt-1 flex items-center gap-3">
          <div
            className={`${iconBoxClass} shrink-0 overflow-hidden border border-black/10 bg-white shadow-[0_8px_22px_rgba(26,51,51,0.14)]`}
          >
            <img
              src={iconSrc}
              alt={iconAlt}
              width={256}
              height={256}
              decoding="async"
              draggable={false}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-bold leading-[1.02] tracking-tight">{title}</h1>
            <p className="mt-1 text-[13px] leading-tight text-[#1A3333]/65">{subtitle}</p>
            <a
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex rounded-[999px] bg-[#E07B2A] px-6 py-2 text-[15px] font-semibold leading-none text-white transition-colors hover:bg-[#C96A1F]"
            >
              {ctaLabel}
            </a>
            {secondaryCta ? (
              <a
                href={secondaryCta.href}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 mt-3 inline-flex rounded-[999px] border border-[#2D8C8C] px-4 py-[7px] text-[14px] font-semibold leading-none text-[#1A5C5C] transition-colors hover:bg-[#2D8C8C]/10"
              >
                {secondaryCta.label}
              </a>
            ) : null}
          </div>
        </section>

        <hr className="my-6 border-[#1A3333]/10" />

        <section className="grid grid-cols-3 divide-x divide-[#1A3333]/10">
          {stats.map((item) => (
            <div key={item.label} className="px-2 text-center">
              <p className="text-[11px] font-semibold uppercase leading-tight tracking-[0.04em] text-[#1A3333]/55">
                {item.label}
              </p>
              <p className="mt-1.5 text-[16px] font-semibold leading-none">{item.value}</p>
            </div>
          ))}
        </section>

        <hr className="my-6 border-[#1A3333]/10" />

        <section>
          <h2 className="text-[20px] font-bold leading-none tracking-tight">{featuresTitle}</h2>
          <ul className="mt-4 space-y-1.5">
            {features.map((feature) => (
              <li key={feature} className="flex gap-3 text-[14px] leading-snug">
                <span className="pt-[2px] text-[#2D8C8C]">—</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6 -mx-5">
          <h2 className="px-5 text-[20px] font-bold leading-none tracking-tight">{previewTitle}</h2>
          <div
            className="mt-4 flex gap-3 overflow-x-auto pb-1 pl-5 pr-1 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {previewImages.map((preview, idx) => (
              <img
                key={preview}
                src={preview}
                alt={`${title} preview ${idx + 1}`}
                width={600}
                height={1298}
                decoding="async"
                draggable={false}
                className="h-[300px] w-auto max-w-none shrink-0 rounded-[18px] border border-black/5 object-contain"
              />
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-[20px] font-bold leading-none tracking-tight">About</h2>
          <p className="mt-3 text-[13px] leading-[1.45] text-[#1A3333]/90">{description}</p>
          <p className="mt-4 text-[12px] leading-tight text-[#1A3333]/55">{stack}</p>
        </section>
      </div>
    </div>
  );
}
