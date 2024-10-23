import { Observable } from '@nativescript/core';
import { firebase } from '@nativescript/firebase-core';
import '@nativescript/firebase-auth';
import '@nativescript/firebase-firestore';

export class AuthService extends Observable {
    private static instance: AuthService;
    private auth: firebase.Auth;
    private firestore: firebase.Firestore;

    private constructor() {
        super();
        this.auth = firebase.auth();
        this.firestore = firebase.firestore();
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    async login(email: string, password: string): Promise<firebase.User> {
        const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
        return userCredential.user;
    }

    async register(email: string, password: string): Promise<firebase.User> {
        const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Generate referral code
        const referralCode = this.generateReferralCode();
        await this.firestore.collection('users').doc(user.uid).set({
            email: email,
            referralCode: referralCode,
            partnerId: null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return user;
    }

    async joinWithReferral(referralCode: string): Promise<boolean> {
        const currentUser = this.auth.currentUser;
        if (!currentUser) return false;

        const querySnapshot = await this.firestore
            .collection('users')
            .where('referralCode', '==', referralCode)
            .get();

        if (querySnapshot.empty) return false;

        const partnerDoc = querySnapshot.docs[0];
        const partnerData = partnerDoc.data();

        if (partnerData.partnerId) return false;

        // Create relationship
        const batch = this.firestore.batch();
        batch.update(this.firestore.collection('users').doc(currentUser.uid), {
            partnerId: partnerDoc.id
        });
        batch.update(this.firestore.collection('users').doc(partnerDoc.id), {
            partnerId: currentUser.uid
        });

        await batch.commit();
        return true;
    }

    async getCurrentUserPartner(): Promise<string | null> {
        const currentUser = this.auth.currentUser;
        if (!currentUser) return null;

        const userDoc = await this.firestore
            .collection('users')
            .doc(currentUser.uid)
            .get();

        const userData = userDoc.data();
        return userData?.partnerId || null;
    }

    async getReferralCode(): Promise<string | null> {
        const currentUser = this.auth.currentUser;
        if (!currentUser) return null;

        const userDoc = await this.firestore
            .collection('users')
            .doc(currentUser.uid)
            .get();

        const userData = userDoc.data();
        return userData?.referralCode || null;
    }

    private generateReferralCode(): string {
        return Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    async signOut(): Promise<void> {
        await this.auth.signOut();
    }
}