import Nav from '../components/Nav.jsx';
import StudyMonograph from '../components/StudyMonograph/StudyMonograph.jsx';
import { useBookmarks } from '../hooks/useBookmarks.js';
import topicsData from '../data/topicsData.js';
import { Link } from 'react-router-dom';

export default function Saved() {
  const { bookmarks, toggle, isBookmarked } = useBookmarks();

  const allStudies = topicsData.flatMap(t => t.studies);
  const saved = allStudies.filter(s => bookmarks.has(s.id));

  return (
    <div className="saved-page">
      <Nav />
      <div className="saved-inner">
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '2rem', marginBottom: '0.5rem' }}>Saved studies</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          {saved.length} bookmarked {saved.length === 1 ? 'study' : 'studies'}
        </p>

        {saved.length === 0 ? (
          <div className="saved-empty">
            <h3>No saved studies yet</h3>
            <p style={{ marginBottom: '1.25rem' }}>Bookmark studies from topic pages to find them here.</p>
            <Link to="/" className="btn-primary">Browse topics</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {saved.map(study => (
              <StudyMonograph
                key={study.id}
                study={study}
                variant="expanded"
                isBookmarked={isBookmarked(study.id)}
                onBookmarkToggle={() => toggle(study.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
