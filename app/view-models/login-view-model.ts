import { Observable, Frame, Utils } from '@nativescript/core';
import { AuthService } from '../services/auth.service';

export class LoginViewModel extends Observable {
    private authService: AuthService;
    private _email: string = '';
    private _password: string = '';
    private _referralCode: string = '';
    private _referralCodeInput: string = '';
    private _hasReferralCode: boolean = false;

    constructor() {
        super();
        this.authService = AuthService.getInstance();
        this.checkExistingUser();
    }

    private async checkExistingUser() {
        const referralCode = await this.authService.getReferralCode();
        if (referralCode) {
            this._referralCode = referralCode;
            this._hasReferralCode = true;
            this.notifyPropertyChange('referralCode', referralCode);
            this.notifyPropertyChange('hasReferralCode', true);

            const hasPartner = await this.authService.getCurrentUserPartner();
            if (hasPartner) {
                Frame.topmost().navigate({
                    moduleName: 'pages/chat-page',
                    clearHistory: true
                });
            }
        }
    }

    get email(): string {
        return this._email;
    }

    set email(value: string) {
        if (this._email !== value) {
            this._email = value;
            this.notifyPropertyChange('email', value);
        }
    }

    get password(): string {
        return this._password;
    }

    set password(value: string) {
        if (this._password !== value) {
            this._password = value;
            this.notifyPropertyChange('password', value);
        }
    }

    get referralCode(): string {
        return this._referralCode;
    }

    get referralCodeInput(): string {
        return this._referralCodeInput;
    }

    set referralCodeInput(value: string) {
        if (this._referralCodeInput !== value) {
            this._referralCodeInput = value;
            this.notifyPropertyChange('referralCodeInput', value);
        }
    }

    get hasReferralCode(): boolean {
        return this._hasReferralCode;
    }

    async onLogin() {
        try {
            await this.authService.login(this.email, this.password);
            await this.checkExistingUser();
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please check your credentials.');
        }
    }

    async onRegister() {
        try {
            await this.authService.register(this.email, this.password);
            await this.checkExistingUser();
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed. Please try again.');
        }
    }

    async onJoinPartner() {
        try {
            const success = await this.authService.joinWithReferral(this.referralCodeInput);
            if (success) {
                Frame.topmost().navigate({
                    moduleName: 'pages/chat-page',
                    clearHistory: true
                });
            } else {
                alert('Invalid or already used referral code.');
            }
        } catch (error) {
            console.error('Join partner error:', error);
            alert('Failed to join partner. Please try again.');
        }
    }

    onShareCode() {
        if (Utils.isAndroid) {
            const intent = new android.content.Intent(android.content.Intent.ACTION_SEND);
            intent.setType("text/plain");
            intent.putExtra(android.content.Intent.EXTRA_TEXT, 
                `Join me on Couple Chat! Use my referral code: ${this.referralCode}`);
            Utils.android.getApplicationContext().startActivity(
                android.content.Intent.createChooser(intent, "Share via")
            );
        } else if (Utils.isIOS) {
            const activityController = UIActivityViewController.alloc()
                .initWithActivityItemsApplicationActivities(
                    [`Join me on Couple Chat! Use my referral code: ${this.referralCode}`],
                    null
                );
            const viewController = Frame.topmost().currentPage.ios;
            viewController.presentViewControllerAnimatedCompletion(
                activityController,
                true,
                null
            );
        }
    }
}