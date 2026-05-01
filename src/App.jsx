import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import QuickCalcPanel from './components/QuickCalc/QuickCalcPanel.jsx';
import OnboardingGate from './components/Onboarding/OnboardingGate.jsx';

const Landing             = lazy(() => import('./pages/Landing.jsx'));
const Home                = lazy(() => import('./pages/Home.jsx'));
const Calculator          = lazy(() => import('./pages/Calculator.jsx'));
const Topic               = lazy(() => import('./pages/Topic.jsx'));
const Saved               = lazy(() => import('./pages/Saved.jsx'));
const Settings            = lazy(() => import('./pages/Settings.jsx'));
const DrugDetail          = lazy(() => import('./pages/DrugDetail.jsx'));
const InteractionChecker  = lazy(() => import('./pages/InteractionChecker.jsx'));
const DiseaseDetail       = lazy(() => import('./pages/DiseaseDetail.jsx'));
const DrugBrowse          = lazy(() => import('./pages/DrugBrowse.jsx'));
const DiseaseBrowse       = lazy(() => import('./pages/DiseaseBrowse.jsx'));
const Procedures          = lazy(() => import('./pages/Procedures.jsx'));
const ProcedureDetail     = lazy(() => import('./pages/ProcedureDetail.jsx'));
const Calculators         = lazy(() => import('./pages/Calculators.jsx'));
const ClinicalCalculator  = lazy(() => import('./pages/ClinicalCalculator.jsx'));

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
        <Route path="/" element={
          <Suspense fallback={<PageLoader />}><Home /></Suspense>
        } />
        <Route path="/landing" element={
          <Suspense fallback={<PageLoader />}><Landing /></Suspense>
        } />
        <Route path="/calc" element={
          <Suspense fallback={<PageLoader />}><Calculator /></Suspense>
        } />
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
        <Route path="/drugs" element={
          <Suspense fallback={<PageLoader />}><DrugBrowse /></Suspense>
        } />
        <Route path="/diseases" element={
          <Suspense fallback={<PageLoader />}><DiseaseBrowse /></Suspense>
        } />
        <Route path="/procedures" element={
          <Suspense fallback={<PageLoader />}><Procedures /></Suspense>
        } />
        <Route path="/procedure/:slug" element={
          <Suspense fallback={<PageLoader />}><ProcedureDetail /></Suspense>
        } />
        <Route path="/calculators" element={
          <Suspense fallback={<PageLoader />}><Calculators /></Suspense>
        } />
        <Route path="/calculator/:slug" element={
          <Suspense fallback={<PageLoader />}><ClinicalCalculator /></Suspense>
        } />
      </Routes>
      <QuickCalcPanel />
    </BrowserRouter>
  );
}
