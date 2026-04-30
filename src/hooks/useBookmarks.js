import { useState } from 'react';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('pausemd_bookmarks') || '[]'));
    } catch { return new Set(); }
  });

  function save(set) {
    localStorage.setItem('pausemd_bookmarks', JSON.stringify([...set]));
    setBookmarks(new Set(set));
  }

  function toggle(studyId) {
    const next = new Set(bookmarks);
    if (next.has(studyId)) next.delete(studyId);
    else next.add(studyId);
    save(next);
  }

  function isBookmarked(studyId) {
    return bookmarks.has(studyId);
  }

  return { bookmarks, toggle, isBookmarked };
}
