import { useNavigate } from "react-router-dom";

export default function DisplayQuizResults({ result, restart, saveStatus, saveError }) {
    const navigate = useNavigate();

    const handleRecClick = () => {
        navigate("/recommended");
    };

    return (
        <div className={styles.wrap}>
            <div className={styles.result}>
                <div className={styles.vibeBadge}>your vibe is</div>
                <h1 className={styles.vibeName}>{result.name}</h1>
                <p className={styles.vibeDesc}>{result.desc}</p>
                <div className={styles.traitRow}>
                    {result.traits.map((t) => (
                        <span key={t} className={styles.trait}>
                            {t}
                        </span>
                    ))}
                </div>
                {saveStatus === "saving" ? (
                    <p className={styles.statusMessage}>Saving your result...</p>
                ) : null}
                {saveStatus === "saved" ? (
                    <p className={styles.statusSuccess}>Saved to your profile.</p>
                ) : null}
                {saveStatus === "error" ? (
                    <p className={styles.statusError}>{saveError}</p>
                ) : null}
                <div className={styles.resultActions}>
                    <button 
                    type="button" 
                    className={`${styles.btn} ${styles.btnGhost}`} 
                    onClick={restart}>
                        Retake quiz
                    </button>
                    <button
                    onClick={handleRecClick}
                    type="button" 
                    className={`${styles.btn} ${styles.btnPrimary}`}>
                        Find my games
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
        wrap: "mx-auto max-w-[520px] py-6 font-sans",

        result: "py-4 text-center",

        vibeBadge: "mb-4 inline-block rounded-full bg-[#EEEDFE] px-[18px] py-[6px] text-[13px] font-medium text-[#26215C]",

        vibeName: "mb-2 text-[2rem] font-medium text-[#1a1a18]",

        vibeDesc: "mx-auto mb-6 max-w-[400px] text-sm leading-6 text-[#5a5a55]",

        traitRow: "mb-6 flex flex-wrap justify-center gap-2",

        trait: "rounded-full border border-black/10 px-[10px] py-1 text-xs text-[#5a5a55]",

        statusMessage: "mb-4 text-sm text-zinc-500",

        statusSuccess: "mb-4 text-sm text-emerald-600",

        statusError: "mb-4 text-sm text-red-600",

        resultActions: "flex justify-center gap-[10px]",

        btn: "rounded-lg border px-5 py-[9px] text-sm transition-colors duration-150",

        btnGhost: "border-black/15 bg-transparent text-[#1a1a18] hover:bg-zinc-50",

        btnPrimary: "border-[#7F77DD] bg-[#7F77DD] text-white hover:bg-[#6f67cf]",
};