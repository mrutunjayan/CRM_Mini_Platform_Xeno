import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute.jsx';
import ContactDetails from './pages/ContactDetails.jsx';
import Contacts from './pages/Contacts.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Deals from './pages/Deals.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

export default function App() {
  return <Routes>
    <Route element={<GuestRoute />}>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Route>
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="contacts/:id" element={<ContactDetails />} />
        <Route path="deals" element={<Deals />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}