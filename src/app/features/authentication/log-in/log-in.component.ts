import {Component, inject, signal} from '@angular/core';
import {Router} from '@angular/router';
import {Auth, getIdTokenResult, signInWithEmailAndPassword, user, User} from '@angular/fire/auth';
import {Subscription} from 'rxjs';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './log-in.component.html',

  styleUrl: './log-in.component.scss'
})
export class LogInComponent {
  router = inject(Router);
  private auth = inject(Auth);
  user$ = user(this.auth);
  userSubscription: Subscription;
  userX: User | null = null;
  showPassword = signal(false);
  isSigningIn = signal(false);

  profileForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(30)]),
  });

  constructor() {
    this.userSubscription = this.user$.subscribe((aUser: User | null) => {
      console.log(aUser);
      this.userX = aUser;
    });
  }

  async handleSubmit() {
    this.isSigningIn.set(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        this.profileForm.value.email as string,
        this.profileForm.value.password as string
      );

      // Fetch the ID token result to check custom claims
      const idTokenResult = await getIdTokenResult(userCredential.user);
      const role = idTokenResult.claims['role']; // Get the custom claim 'role'

      // Redirect based on role
      if (role === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      } else if (role === 'student') {
        this.router.navigate(['/admin/dashboard']);
        //window.location.href = environment.studentAccountLink; // Redirect to the external URL for students
      } else {
        alert('No role assigned. Contact support.');
        this.router.navigate(['/authentication']);
      }
    } catch (error: any) {
      alert(error.message);
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
