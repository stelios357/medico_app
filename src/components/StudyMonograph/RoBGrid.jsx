const JUDGMENT_COLOR = {
  low:            'var(--teal)',
  'some-concerns': 'var(--amber)',
  high:           'var(--red)',
};

const JUDGMENT_LABEL = {
  low:            'Low risk',
  'some-concerns': 'Some concerns',
  high:           'High risk',
};

export default function RoBGrid({ domains = [] }) {
  return (
    <div className="rob-grid" role="table" aria-label="Risk of bias assessment">
      <div className="rob-grid-header" role="row">
        <span role="columnheader">Domain</span>
        <span role="columnheader">Judgment</span>
      </div>
      {domains.map(({ domain, judgment }, i) => {
        const color = JUDGMENT_COLOR[judgment] ?? 'var(--muted)';
        const label = JUDGMENT_LABEL[judgment] ?? judgment;
        return (
          <div key={i} className="rob-row" role="row">
            <span className="rob-domain" role="cell">{domain}</span>
            <span className="rob-cell" role="cell">
              <span
                className="rob-circle"
                style={{ background: color }}
                title={label}
                aria-label={label}
              />
              <span className="rob-judgment-text">{label}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
