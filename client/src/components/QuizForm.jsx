
export default function QuizForm({ questions, current, answers, progress, select, goNext, goBack }) {
  const q = questions[current];

  return (
    <div className={styles.wrap}>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <p className={styles.stepLabel}>
        Question {current + 1} of {questions.length}
      </p>

      <p className={styles.question}>{q.q}</p>

      <div className={styles.options}>
        {q.opts.map((option, index) => (
          <button
            key={index}
            type="button"
            className={`${styles.opt}  ${
              answers[current] === index ? styles.optSelected : styles.optHover
            }`}
            onClick={() => select(index)}
          >
            <span className={styles.optIcon}>{option.icon}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.nav}>
        <button
          type="button"
          className={`${styles.btn} ${current === 0 ? styles.btnMuted : styles.btnGhost}`}
          onClick={goBack}
          disabled={current === 0}
        >
          Back
        </button>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnPrimary} ${
            answers[current] === undefined ? styles.btnMuted : ""
          }`}
          onClick={goNext}
          disabled={answers[current] === undefined}
        >
          {current === questions.length - 1 ? "See my vibe →" : "Next"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrap: "mx-auto max-w-[520px] py-6 font-sans",

  progressBar: "mb-8 h-[3px] overflow-hidden rounded-full bg-black/10",

  progressFill: "h-full rounded-full bg-[#7F77DD] transition-[width] duration-300 ease-out",

  stepLabel: "mb-2 text-xs tracking-[0.03em] text-zinc-500",

  question: "mb-6 min-h-[3.5rem] text-[1.2rem] leading-[1.4] font-medium text-[#1a1a18]",

  options: "flex flex-col gap-[10px]",

  opt: "flex w-full items-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-[13px] text-left text-sm text-black ",

  optHover: "hover:border-black/20 hover:bg-zinc-50",

  optSelected: "border-violet-500 shadow-lg text-violet-900",

  optIcon: "flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-[#f0efe9] text-base",

  nav: "flex justify-between items-center mt-6",

  btn: "rounded-lg border px-5 py-[9px] text-sm transition-colors duration-150",

  btnGhost: "border-black/15 bg-transparent text-[#1a1a18] hover:bg-zinc-50",

  btnPrimary: "border-[#7F77DD] bg-[#7F77DD] text-white hover:bg-[#6f67cf]",

  btnMuted: "opacity-35 disabled:cursor-not-allowed",
};