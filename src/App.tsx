import { Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import SideDock from "./components/SideDock";
import AccountPage from "./pages/AccountPage";
import EventsPage from "./pages/EventsPage";
import HomePage from "./pages/HomePage";
import PrizeBoxPage from "./pages/PrizeBoxPage";
import ProductPage from "./pages/ProductPage";
import RankingPage from "./pages/RankingPage";
import ShopHistoryPage from "./pages/ShopHistoryPage";
import ShopItemPage from "./pages/ShopItemPage";
import ShopPage from "./pages/ShopPage";
import TopUpPage from "./pages/TopUpPage";

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f4f4f6]">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/history" element={<ShopHistoryPage />} />
          <Route path="/shop/:id" element={<ShopItemPage />} />
          <Route path="/box" element={<PrizeBoxPage />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/topup" element={<TopUpPage />} />
        </Routes>
      </main>
      <Footer />
      <SideDock />
    </div>
  );
}

export default App;
