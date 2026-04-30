import { useState } from 'react';

const TABS = ['NNT', 'RR', 'ES', 'CI', 'GR'];

export function useQuickCalc() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTabState] = useState(() => {
    return localStorage.getItem('pausemd_quickcalc_tab') || 'NNT';
  });

  function setActiveTab(tab) {
    localStorage.setItem('pausemd_quickcalc_tab', tab);
    setActiveTabState(tab);
  }

  function toggle() { setOpen(o => !o); }
  function close() { setOpen(false); }
  function openTo(tab) { setActiveTab(tab); setOpen(true); }

  return { open, toggle, close, openTo, activeTab, setActiveTab, tabs: TABS };
}
