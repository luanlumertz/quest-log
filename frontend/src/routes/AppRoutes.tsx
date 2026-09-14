import { Navigate, Route, Routes } from "react-router";

import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { Dashboard } from "../pages/Dashboard";
import { SearchGames } from "../pages/SearchGames";
import { GameDetails } from "../pages/GameDetails";
import { Library } from "../pages/Library";
import { LibraryGameDetails } from "../pages/LibraryGameDetails";
import { NotFound } from "../pages/NotFound";

import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/games/search" element={<SearchGames />} />
        <Route path="/games/:externalId" element={<GameDetails />} />
        <Route path="/library" element={<Library />} />
        <Route path="/library/:gameId" element={<LibraryGameDetails />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
