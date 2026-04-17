const avatarGradients = [
  "from-[#ffbca5] to-[#ff7d73]",
  "from-[#ffd9a8] to-[#ffa850]",
  "from-[#8fd7ff] to-[#5f9cff]",
  "from-[#9df0d6] to-[#35c68b]",
];

export function TrustedFamiliesCard() {
  return (
    <section className="rounded-[28px] border border-white/80 bg-white/88 p-4 shadow-[0_20px_48px_rgba(193,165,231,0.18)] sm:p-5">
      <div className="flex items-center gap-3 rounded-[22px] border border-[#eadff8] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,248,252,0.94))] px-4 py-4 shadow-[0_16px_32px_rgba(172,139,219,0.1)]">
        <div className="flex -space-x-2.5">
          {avatarGradients.map((gradient, index) => (
            <div
              key={gradient}
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br ${gradient} text-xs font-black text-white shadow-[0_8px_18px_rgba(117,88,189,0.16)] sm:h-11 sm:w-11 sm:text-sm`}
            >
              {String.fromCharCode(65 + index)}
            </div>
          ))}
        </div>
        <div className="min-w-0">
          <p className="text-[17px] font-extrabold leading-6 text-[#3e3973] sm:text-[20px]">
            Trusted by 10,000+ Families
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-[#6d6993] sm:gap-3 sm:text-[15px]">
            <span className="flex items-center gap-1 text-[#ffb400]">
              <StarRow />
            </span>
            <span>4.8/5 (2,500+ Reviews)</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function StarRow() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5 fill-current sm:h-4 sm:w-4"
          aria-hidden="true"
        >
          <path d="M12 2.5l2.87 5.82 6.42.93-4.64 4.52 1.1 6.4L12 17.15l-5.75 3.02 1.1-6.4L2.71 9.25l6.42-.93L12 2.5z" />
        </svg>
      ))}
    </>
  );
}
