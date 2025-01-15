import React from 'react';
    import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
    import { AuthForm } from './components/AuthForm';
    import { DashboardLayout } from './components/DashboardLayout';
    import { PDFTemplateList } from './components/PDFTemplateList';
    import { PDFTemplateUpload } from './components/PDFTemplateUpload';
    import { PDFTemplateDetails } from './components/PDFTemplateDetails';
    import { UserList } from './components/UserList';
    import { UserForm } from './components/UserForm';
    import { Toaster } from 'react-hot-toast';
    import { supabase } from './lib/supabase';

    function App() {
      const [session, setSession] = React.useState(supabase.auth.getSession());

      React.useEffect(() => {
        supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session);
        });
      }, []);

      return (
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Toaster position="top-right" />
            <Routes>
              <Route
                path="/"
                element={
                  !session ? (
                    <AuthForm />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                }
              />
              <Route
                path="/dashboard"
                element={
                  session ? (
                    <DashboardLayout>
                      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
                      {/* Dashboard content will go here */}
                    </DashboardLayout>
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/templates"
                element={
                  session ? (
                    <DashboardLayout>
                      <div className="mb-6 flex justify-between items-center">
                        <h1 className="text-2xl font-bold">PDF Templates</h1>
                        <button
                          onClick={() => navigate('/templates/new')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          New Template
                        </button>
                      </div>
                      <PDFTemplateList />
                    </DashboardLayout>
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/templates/new"
                element={
                  session ? (
                    <DashboardLayout>
                      <div className="mb-6">
                        <h1 className="text-2xl font-bold">Upload New Template</h1>
                        <p className="mt-2 text-gray-600">
                          Upload a PDF template to start creating vehicle usage forms.
                        </p>
                      </div>
                      <PDFTemplateUpload />
                    </DashboardLayout>
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/templates/:id"
                element={
                  session ? (
                    <DashboardLayout>
                      <PDFTemplateDetails />
                    </DashboardLayout>
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/users"
                element={
                  session ? (
                    <DashboardLayout>
                      <UserList />
                    </DashboardLayout>
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/users/new"
                element={
                  session ? (
                    <DashboardLayout>
                      <h1 className="text-2xl font-bold mb-6">Create New User</h1>
                      <UserForm />
                    </DashboardLayout>
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/users/:id"
                element={
                  session ? (
                    <DashboardLayout>
                      <h1 className="text-2xl font-bold mb-6">Edit User</h1>
                      <UserForm />
                    </DashboardLayout>
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
            </Routes>
          </div>
        </Router>
      );
    }

    export default App;
