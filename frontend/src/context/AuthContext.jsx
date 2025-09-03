import { createContext } from 'react';

const AuthContext = createContext({
  user: null,
  loading: true,
  setUser: () => {},
  checkAuth: async () => {}, 
});

export default AuthContext;
