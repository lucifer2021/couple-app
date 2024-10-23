import { Observable, Utils } from '@nativescript/core';
import { MessageService, Message } from '../services/message.service';

export class ChatViewModel extends Observable {
    private messageService: MessageService;
    private _messages: Message[] = [];
    private _messageText: string = '';

    constructor() {
        super();
        this.messageService = MessageService.getInstance();
        this._messages = this.messageService.getMessages();
        
        // Listen for message updates
        this.messageService.on('propertyChange', (data: any) => {
            if (data.propertyName === 'messages') {
                this.messages = data.value;
            }
        });
    }

    get messages(): Message[] {
        return this._messages;
    }

    set messages(value: Message[]) {
        if (this._messages !== value) {
            this._messages = value;
            this.notifyPropertyChange('messages', value);
        }
    }

    get messageText(): string {
        return this._messageText;
    }

    set messageText(value: string) {
        if (this._messageText !== value) {
            this._messageText = value;
            this.notifyPropertyChange('messageText', value);
        }
    }

    async onSendMessage() {
        if (!this.messageText.trim()) return;
        await this.messageService.sendMessage(this.messageText);
        this.messageText = '';
    }

    async onVibratePress() {
        await this.messageService.sendVibration();
    }

    formatTime(timestamp: number): string {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}