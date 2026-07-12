import "./ScoreCard.css";

export default function ScoreCard({ label, score, tone = "forest" }) {
  return (
    <div className={`score-card score-${tone}`}>
      <div className="score-label">{label}</div>
      <div className="score-value">{score}<span className="score-max">/100</span></div>
      <div className="score-track">
        <div className="score-fill" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
