import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AppDownload from './pages/AppDownload';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import MealPlan from './pages/MealPlan';
import Workout from './pages/Workout';
import Feedback from './pages/Feedback';
import ProtectedRoute from './components/ProtectedRoute';
import { ADMIN_LOGIN_PATH } from './config/adminPath';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppDownload />} />
        {/* Hidden admin login: no button on the public site, reachable only by typing the URL */}
        <Route path={ADMIN_LOGIN_PATH} element={<Login />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meal-plan"
          element={
            <ProtectedRoute>
              <MealPlan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workout"
          element={
            <ProtectedRoute>
              <Workout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback"
          element={
            <ProtectedRoute>
              <Feedback />
            </ProtectedRoute>
          }
        />
        {/* Any unknown URL goes to the public page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;