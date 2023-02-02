import * as Google from 'expo-auth-session/providers/google'

import { GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signOut } from '@firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react'

import { auth } from '../firebase';

const AuthContext = createContext({});

const config = {
    androidClientId: '1085887580219-388eg6qrvkv38frvqnq8efkohgd3pt02.apps.googleusercontent.com',
    iosClientId: '1085887580219-v9nhu684eqer5t7q3janbpiggg2ql7t9.apps.googleusercontent.com',
    expoClientId: '1085887580219-jschvne39r36tapl36ubqmk3ktgve2r4.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    permissions: ['public_profile', 'email', 'gender', 'location']
}

export const AuthProvider = ({ children }) => {

    const [accessToken, setAccessToken] = useState('')
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest(config);
    const [user, setUser] = useState(null);

    // check if user is logged in or not
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                setAccessToken(user.accessToken);
            } else {
                setUser(null);
            }

            // setLoadingInitial(false);
        });
        return unsubscribe;
    }, [])

    // sign in with google account and add that credentials to firebase
    const signInWithGoogle = async () => {
        try {
            const { type, params } = await promptAsync();
            if (type === 'success') {
                const { id_token } = params;
                const credential = GoogleAuthProvider.credential(id_token);
                await signInWithCredential(auth, credential);
            }
            // Promise.reject();
        } catch (error) {
            console.log(error);
        }
    }

    // sign out from firebase

    const signOut = async () => {
        await signOut(auth).then
            (() => {
                setUser(null);
            }
            )
            .catch((error) => {
                console.log(error);
            })
    }

    return (
        <AuthContext.Provider value={{
            user,
            signInWithGoogle,
            signOut,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export default function useAuth() {
    return useContext(AuthContext);
}
