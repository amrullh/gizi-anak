'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
    User as FirebaseUser,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';

// Interface User disesuaikan dengan kebutuhan data Puskesmas & Role Bidan
interface User {
    uid: string;
    email: string | null;
    name?: string;
    role?: 'parent' | 'admin' | 'bidan';
    phone?: string;
    address?: string;
    ttl?: string;
    beratBadan?: number;
    tinggiBadan?: number;
    hb?: number;
    age?: number;
    lila?: number;
    isPregnant?: boolean;
    wilayah?: string; // Kunci utama untuk klasifikasi kerja Bidan & Parent
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (phone: string, password: string) => Promise<void>;
    register: (phone: string, password: string, name: string, role: string, wilayah?: string) => Promise<void>;
    registerByAdmin: (phone: string, password: string, name: string, role: string, wilayah?: string) => Promise<string>;
    logout: () => Promise<void>;
    updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Helper untuk mengubah nomor telepon menjadi format email virtual Firebase
    const formatEmail = (phone: string) => `${phone.trim()}@gizianak.local`;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            ...userData
                        } as User);
                    } else {
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            name: firebaseUser.displayName || '',
                            role: undefined,
                        });
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const login = async (phone: string, password: string) => {
        const email = formatEmail(phone);
        await signInWithEmailAndPassword(auth, email, password);
    };

    // REVISI: Menambahkan parameter wilayah pada register standar
    const register = async (phone: string, password: string, name: string, role: string, wilayah?: string) => {
        const email = formatEmail(phone);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        await setDoc(doc(db, 'users', userCredential.user.uid), {
            name,
            phone,
            email,
            role,
            wilayah: wilayah || '', // Simpan wilayah jika diinput saat register
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    };

    /**
     * Mendaftarkan user melalui API (Firebase Admin SDK) 
     * REVISI: Memastikan wilayah diteruskan ke body request API
     */
    const registerByAdmin = async (phone: string, password: string, name: string, role: string, wilayah?: string) => {
        const email = formatEmail(phone);

        const response = await fetch('/api/admin/create-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                name,
                role,
                phone,
                wilayah: wilayah || '' // Pastikan string kosong jika tidak ada wilayah
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Gagal mendaftarkan user');

        return data.uid;
    };

    const logout = async () => {
        await signOut(auth);
    };

    const updateUser = async (data: Partial<User>) => {
        if (!user) throw new Error('No user authenticated');
        await updateDoc(doc(db, 'users', user.uid), {
            ...data,
            updatedAt: serverTimestamp(),
        });
        setUser(prev => prev ? { ...prev, ...data } : null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            registerByAdmin,
            logout,
            updateUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}