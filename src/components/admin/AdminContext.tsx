/**
 * AdminContext — Context React pour le mode admin WYSIWYG
 * Fournit isAdmin (derive de useAuth) et isEditing (mode edition actif)
 * Provider qui wrappe l'app quand l'admin est connecte
 */

import React, { createContext, useContext, useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface AdminContextValue {
  /** L'utilisateur est authentifie en tant qu'admin */
  isAdmin: boolean;
  /** Le mode edition est actif (controles visibles) */
  isEditing: boolean;
  /** Basculer le mode edition */
  toggleEditing: () => void;
  /** Activer le mode edition */
  setEditing: (value: boolean) => void;
}

const AdminContext = createContext<AdminContextValue>({
  isAdmin: false,
  isEditing: false,
  toggleEditing: () => {},
  setEditing: () => {},
});

export const useAdmin = (): AdminContextValue => {
  const context = useContext(AdminContext);
  return context;
};

interface AdminProviderProps {
  children: React.ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const { isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const value = useMemo<AdminContextValue>(
    () => ({
      isAdmin,
      isEditing: isAdmin && isEditing,
      toggleEditing: () => setIsEditing((prev) => !prev),
      setEditing: (v: boolean) => setIsEditing(v),
    }),
    [isAdmin, isEditing]
  );

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext;
