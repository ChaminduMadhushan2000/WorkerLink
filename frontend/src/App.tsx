import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PageLoader } from './components/ui/Spinner';

// Lazy load all pages
const Landing = lazy(() => import('./pages/Landing').then((m) => ({ default: m.Landing })));
const Login = lazy(() => import('./pages/auth/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./pages/auth/Register').then((m) => ({ default: m.Register })));
const CustomerDashboard = lazy(() => import('./pages/customer/Dashboard').then((m) => ({ default: m.CustomerDashboard })));
const CreateJobPost = lazy(() => import('./pages/customer/CreateJobPost').then((m) => ({ default: m.CreateJobPost })));
const MyJobPosts = lazy(() => import('./pages/customer/MyJobPosts').then((m) => ({ default: m.MyJobPosts })));
const JobPostDetail = lazy(() => import('./pages/customer/JobPostDetail').then((m) => ({ default: m.JobPostDetail })));
const ContractorDashboard = lazy(() => import('./pages/contractor/Dashboard').then((m) => ({ default: m.ContractorDashboard })));
const BrowseJobs = lazy(() => import('./pages/contractor/BrowseJobs').then((m) => ({ default: m.BrowseJobs })));
const ContractorJobDetail = lazy(() => import('./pages/contractor/JobDetail').then((m) => ({ default: m.ContractorJobDetail })));
const MyProposals = lazy(() => import('./pages/contractor/MyProposals').then((m) => ({ default: m.MyProposals })));
const ContractorProfile = lazy(() => import('./pages/contractor/Profile').then((m) => ({ default: m.ContractorProfile })));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard').then((m) => ({ default: m.AdminDashboard })));
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

export function App(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <PageLoader />
            </div>
          }>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Customer */}
              <Route path="/customer/dashboard" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/customer/job-posts" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <MyJobPosts />
                </ProtectedRoute>
              } />
              <Route path="/customer/job-posts/create" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CreateJobPost />
                </ProtectedRoute>
              } />
              <Route path="/customer/job-posts/:id" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <JobPostDetail />
                </ProtectedRoute>
              } />

              {/* Contractor */}
              <Route path="/contractor/dashboard" element={
                <ProtectedRoute allowedRoles={['contractor']}>
                  <ContractorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/contractor/browse" element={
                <ProtectedRoute allowedRoles={['contractor']}>
                  <BrowseJobs />
                </ProtectedRoute>
              } />
              <Route path="/contractor/browse/:id" element={
                <ProtectedRoute allowedRoles={['contractor']}>
                  <ContractorJobDetail />
                </ProtectedRoute>
              } />
              <Route path="/contractor/proposals" element={
                <ProtectedRoute allowedRoles={['contractor']}>
                  <MyProposals />
                </ProtectedRoute>
              } />
              <Route path="/contractor/profile" element={
                <ProtectedRoute allowedRoles={['contractor']}>
                  <ContractorProfile />
                </ProtectedRoute>
              } />

              {/* Admin */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0C1F3F',
              color: '#fff',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: '13px',
              fontWeight: '500',
              borderRadius: '10px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#F59E0B', secondary: '#0C1F3F' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#fff' },
              style: { background: '#FEF2F2', color: '#991B1B' },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
