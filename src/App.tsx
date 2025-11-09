import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import LoginPage from './pages/Login'
import DashboardPage from './pages/Dashboard'
import RegisterPlayerPage from './pages/RegisterPlayer'
import EditPlayerPage from './pages/EditPlayer'
import PlayersListPage from './pages/PlayersList'
import AttendancePage from './pages/Attendance'
import HistoryPage from './pages/History'
import TeamDrawPage from './pages/TeamDraw'
import RequireAuth from './components/RequireAuth'

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/players/new" element={<RegisterPlayerPage />} />
        <Route path="/players/:id/edit" element={<EditPlayerPage />} />
        <Route path="/players" element={<PlayersListPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/team-draw" element={<TeamDrawPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
