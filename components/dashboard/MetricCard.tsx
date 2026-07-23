export function MetricCard({
  label,
  value,
  unit,
  sub,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
}) {
  return (
    <div className="surface-card p-6 flex flex-col justify-between min-h-[130px]">
      <span className="oryzo-label text-slate text-[12px]">{label}</span>
      <div className="mt-4">
        <span className="oryzo-label text-ink-plum text-[38px] leading-[0.9]">
          {value}
        </span>
        {unit ? (
          <span className="oryzo-label text-slate text-[13px] ml-2">{unit}</span>
        ) : null}
      </div>
      {sub ? (
        <span className="oryzo-label text-slate text-[10px] mt-2">{sub}</span>
      ) : null}
    </div>
  );
}
