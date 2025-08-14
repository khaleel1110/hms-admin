import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {Auth, getIdTokenResult, signInWithEmailAndPassword, user, User} from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss'
})
export class LogInComponent {
  private router = inject(Router);
  private auth = inject(Auth);
  user$ = user(this.auth);
  userSubscription: Subscription;
  userX: User | null = null;
  showPassword = signal(false);
  isSigningIn = signal(false);

  profileForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(30)])
  });

  constructor() {
    this.userSubscription = this.user$.subscribe((aUser: User | null) => {
      this.userX = aUser;
      if (aUser) {
        // Check role immediately after login
        this.checkUserRole(aUser);
      }
    });
  }

  async handleSubmit() {
    if (this.profileForm.invalid) {
      return;
    }

    this.isSigningIn.set(true);
    try {
      await signInWithEmailAndPassword(
        this.auth,
        this.profileForm.value.email as string,
        this.profileForm.value.password as string
      );
      // Role check is handled in the user$ subscription
    } catch (error: any) {
      alert(error.message);
      this.isSigningIn.set(false);
    }
  }

  private async checkUserRole(user: User) {
    try {
      const idTokenResult = await getIdTokenResult(user);
      const role = idTokenResult.claims['role'];

      if (role === 'admin' || role === 'student') {
        await this.router.navigate(['admin/dashboard']);
      } else {
        alert('No role assigned. Contact support.');
        await this.router.navigate(['authentication']);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      await this.router.navigate(['authentication']);
    } finally {
      this.isSigningIn.set(false);
    }
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  toggleShowPassword() {
    this.showPassword.set(!this.showPassword());
  }
}
