import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Watch from "./pages/Watch.jsx";
import Channel from "./pages/Channel.jsx";
import CreateChannel from "./pages/CreateChannel.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <Routes>
      {/* Auth pages use their own full-screen Google-style layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/watch/:id" element={<Watch />} />
        <Route
          path="/channel/new"
          element={
            <ProtectedRoute>
              <CreateChannel />
            </ProtectedRoute>
          }
        />
        <Route path="/channel/:id" element={<Channel />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
