import { EventData, Page, Utils } from '@nativescript/core';
import { ChatViewModel } from '../view-models/chat-view-model';

export function onNavigatingTo(args: EventData) {
    const page = <Page>args.object;
    page.bindingContext = new ChatViewModel();
}