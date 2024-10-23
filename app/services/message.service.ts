import { Observable } from '@nativescript/core';
import { firebase } from '@nativescript/firebase-core';
import { AuthService } from './auth.service';

export interface Message {
    id: string;
    text: string;
    timestamp: number;
    senderId: string;
    receiverId: string;
}

export class MessageService extends Observable {
    private static instance: MessageService;
    private firestore: firebase.Firestore;
    private authService: AuthService;
    private _messages: Message[] = [];
    private unsubscribe: () => void;

    private constructor() {
        super();
        this.firestore = firebase.firestore();
        this.authService = AuthService.getInstance();
        this.setupMessagesListener();
    }

    public static getInstance(): MessageService {
        if (!MessageService.instance) {
            MessageService.instance = new MessageService();
        }
        return MessageService.instance;
    }

    private async setupMessagesListener() {
        const currentUser = firebase.auth().currentUser;
        const partnerId = await this.authService.getCurrentUserPartner();
        
        if (!currentUser || !partnerId) return;

        this.unsubscribe = this.firestore
            .collection('messages')
            .where('participants', 'array-contains', currentUser.uid)
            .orderBy('timestamp', 'asc')
            .onSnapshot((snapshot) => {
                const messages = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.senderId === currentUser.uid || data.senderId === partnerId) {
                        messages.push({
                            id: doc.id,
                            ...data
                        });
                    }
                });
                this._messages = messages;
                this.notifyPropertyChange('messages', messages);
            });
    }

    getMessages(): Message[] {
        return this._messages;
    }

    async sendMessage(text: string): Promise<void> {
        const currentUser = firebase.auth().currentUser;
        const partnerId = await this.authService.getCurrentUserPartner();
        
        if (!currentUser || !partnerId) return;

        const message = {
            text,
            senderId: currentUser.uid,
            receiverId: partnerId,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            participants: [currentUser.uid, partnerId]
        };

        await this.firestore.collection('messages').add(message);
    }

    async sendVibration(): Promise<void> {
        // Implement vibration logic here
        const currentUser = firebase.auth().currentUser;
        const partnerId = await this.authService.getCurrentUserPartner();
        
        if (!currentUser || !partnerId) return;

        await this.firestore.collection('vibrations').add({
            senderId: currentUser.uid,
            receiverId: partnerId,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    dispose() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}