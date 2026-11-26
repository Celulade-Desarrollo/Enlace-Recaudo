
const STORAGE_KEY = 'enlace_auth';

// Credenciales login dummy
const DUMMY_USER = 'transportista';
const DUMMY_PASS = 'enlace123';

export interface AuthUser {
  username: string;
  nombre: string;
  rol: string;
}

export const authService = {
  /**
   * Intenta hacer login con las credenciales dadas.
   * Retorna el usuario si es correcto, null si no.
   */
  login(username: string, password: string): AuthUser | null {
    if (username.toLowerCase().trim() === DUMMY_USER && password === DUMMY_PASS) {
      const user: AuthUser = {
        username: DUMMY_USER,
        nombre: 'Luis Martínez',
        rol: 'transportista',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  },

  /**
   * Cierra la sesión actual.
   */
  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Revisa si hay una sesión activa guardada.
   */
  getStoredUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  /**
   * Revisa si el usuario está autenticado.
   */
  isAuthenticated(): boolean {
    return this.getStoredUser() !== null;
  },
};

