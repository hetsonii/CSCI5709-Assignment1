/**
 * AISummary component
 * Props:
 *   summary  - string of AI-generated text
 *   tags     - array of key-issue tag strings
 */
export default function AISummary({ summary, tags = [] }) {
  if (!summary) return null;

  return (
    <div className="ai-summary">
      <div className="ai-summary__header">
        <span className="ai-summary__badge">✦ AI-Generated Summary</span>
      </div>
      <p className="ai-summary__text">{summary}</p>

      {tags.length > 0 && (
        <div className="ai-summary__tags">
          <strong className="ai-summary__tags-label">Key Issues</strong>
          <div className="ai-summary__tag-list">
            {tags.map((tag) => (
              <span key={tag} className="ai-summary__tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}