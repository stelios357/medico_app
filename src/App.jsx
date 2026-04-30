import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Landing from './pages/Landing.jsx';
import Home from './pages/Home.jsx';
import Calculator from './pages/Calculator.jsx';
import QuickCalcPanel from './components/QuickCalc/QuickCalcPanel.jsx';
import OnboardingGate from './components/Onboarding/OnboardingGate.jsx';

const Topic               = lazy(() => import('./pages/Topic.jsx'));
const Saved               = lazy(() => import('./pages/Saved.jsx'));
const Settings            = lazy(() => import('./pages/Settings.jsx'));
const DrugDetail          = lazy(() => import('./pages/DrugDetail.jsx'));
const InteractionChecker  = lazy(() => import('./pages/InteractionChecker.jsx'));
const DiseaseDetail       = lazy(() => import('./pages/DiseaseDetail.jsx'));

function PageLoader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <span style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--muted)', letterSpacing: '0.06em' }}>Loading…</span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <OnboardingGate />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/calc" element={<Calculator />} />
        <Route path="/topic/:slug" element={
          <Suspense fallback={<PageLoader />}><Topic /></Suspense>
        } />
        <Route path="/saved" element={
          <Suspense fallback={<PageLoader />}><Saved /></Suspense>
        } />
        <Route path="/settings" element={
          <Suspense fallback={<PageLoader />}><Settings /></Suspense>
        } />
        <Route path="/drug/:id" element={
          <Suspense fallback={<PageLoader />}><DrugDetail /></Suspense>
        } />
        <Route path="/disease/:id" element={
          <Suspense fallback={<PageLoader />}><DiseaseDetail /></Suspense>
        } />
        <Route path="/interactions" element={
          <Suspense fallback={<PageLoader />}><InteractionChecker /></Suspense>
        } />
      </Routes>
      <QuickCalcPanel />
    </BrowserRouter>
  );
}
