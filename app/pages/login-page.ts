import { EventData, Page } from '@nativescript/core';
import { LoginViewModel } from '../view-models/login-view-model';

export function onNavigatingTo(args: EventData) {
    const page = <Page>args.object;
    page.bindingContext = new LoginViewModel();
}