import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { api } from "../api/api";

interface User {
    id: string;
    name: string;
    email: string;
}

interface SignInCredentials {
    email: string;
    password: string;
}

interface AuthContextData {
    user: User | null;
    isAuthenticated: boolean;
    signIn: (credentials: SignInCredentials) => Promise<void>;
    signOut: () => void;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);

    const isAuthenticated = !!user;

    useEffect(() => {
        const storedUser = localStorage.getItem("@finance:user");
        const storedToken = sessionStorage.getItem("@finance:token");

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        }
    }, []);

    async function signIn({ email, password }: SignInCredentials) {
        const response = await api.post("/auth/login", { email, password });

        const { accessToken, refreshToken, user } = response.data;

        sessionStorage.setItem("@finance:token", accessToken);
        localStorage.setItem("@finance:refreshToken", refreshToken);
        localStorage.setItem("@finance:user", JSON.stringify(user));

        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        setUser(user);
    }

    function signOut() {
        sessionStorage.removeItem("@finance:token");
        localStorage.removeItem("@finance:user");
        localStorage.removeItem("@finance:refreshToken");
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
