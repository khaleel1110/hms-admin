import {Component, inject} from '@angular/core';
import {Auth, getAuth, sendPasswordResetEmail} from '@angular/fire/auth';
import {Router, RouterLink} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './forgot-password.component.html',

  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private auth = inject(Auth);
  router = inject(Router);

  forgotPasswordForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });
  env = environment;

  async onSubmit() {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.value.email as string;
      try {
        await sendPasswordResetEmail(this.auth, email);
        alert('Password reset email sent. Check your inbox.');
        this.router.navigate(['/authentication']);
      } catch (error: any) {
        alert(error.message);
      }
    }
  }

  async sendResetEmail() {
    const auth = getAuth();
    const email = 'khaleelmatic@gmail.com'; // Replace with a valid email
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent.');
    } catch (error) {
      console.error('Error sending password reset email:', error);
    }
  }
}
