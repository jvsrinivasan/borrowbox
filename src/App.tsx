import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import { ToastContainer } from './components/Toast';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BrowsePage from './pages/BrowsePage';
import ItemDetailPage from './pages/ItemDetailPage';
import AddEditListingPage from './pages/AddEditListingPage';
import MyListingsPage from './pages/MyListingsPage';
import RequestsPage from './pages/RequestsPage';
import MyBorrowingsPage from './pages/MyBorrowingsPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import CommunityPage from './pages/CommunityPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-stone-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/items/:id" element={<ItemDetailPage />} />
              <Route path="/add-listing" element={<AddEditListingPage />} />
              <Route path="/edit-listing/:id" element={<AddEditListingPage />} />
              <Route path="/my-listings" element={<MyListingsPage />} />
              <Route path="/requests" element={<RequestsPage />} />
              <Route path="/my-borrowings" element={<MyBorrowingsPage />} />
              <Route path="/transactions" element={<TransactionHistoryPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <footer className="text-center py-4 text-sm text-stone-400 border-t border-stone-200">
            Built with IBM Bob ❤️
          </footer>
        </div>
        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center text-center px-4">
      <div>
        <p className="text-6xl font-extrabold text-stone-200 mb-4">404</p>
        <p className="text-stone-600 font-semibold text-lg mb-2">Page not found</p>
        <a href="/" className="text-amber-700 text-sm underline">Go home</a>
      </div>
    </div>
  );
}
