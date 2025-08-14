import {Component, inject} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Auth, createUserWithEmailAndPassword, signInWithPopup, updateProfile, User} from '@angular/fire/auth';
import {GoogleAuthProvider} from 'firebase/auth';
import {hasCustomClaim, redirectUnauthorizedTo} from '@angular/fire/auth-guard';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {NgIf} from '@angular/common';


@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
    NgIf
  ],
  templateUrl: './sign-up.component.html',

  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {

  private auth = inject(Auth);
  provider = new GoogleAuthProvider();
  router=inject(Router);
  profileForm = new FormGroup({
    fullname: new FormControl('', [Validators.required, Validators.email]),
    lastname: new FormControl('', [Validators.required, Validators.email]),
    email: new FormControl('', [Validators.required, Validators.email]),


    password: new FormControl('',
      [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(30)
      ]),
    confirmPassword: new FormControl('',
      [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(30)
      ]),

  });
  /*

    handleSubmit() { alert( this.profileForm.value.fullname+' '+this.profileForm.value.lastname+' '+
      this.profileForm.value.email+' '+this.profileForm.value.password+' '+this.profileForm.value.confirPassword+" successfully"
    )

    }*/



  createAccount() {
    createUserWithEmailAndPassword(this.auth, this.profileForm.value.email as string, this.profileForm.value.password as string)
      .then((result) => {
        const user = result.user;
        console.log('User created successfully:', user);

        // Update the user's profile
        updateProfile(user, {
          displayName: `${this.profileForm.value.fullname} ${this.profileForm.value.lastname}`,
          photoURL: "https://example.com/jane-q-user/profile.jpg"
        }).then(() => {
          console.log('Profile updated successfully');
          alert('User created and profile updated!');
        }).catch((error) => {
          console.error('Error updating profile:', error);
          alert('Error updating profile: ' + error.message);
        });
      })
      .catch((error) => {
        console.error('Error creating user:', error);
        alert('Error creating user: ' + error.message);
      });
    if (this.profileForm.valid) {
      console.log("Account Created Successfully!", this.profileForm.value);
    } else {
      console.log("Please fill all required fields and accept the Terms and Conditions.");
    }


  }

  googlesignin() {


    () => hasCustomClaim('user');
    let redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

    signInWithPopup(this.auth, this.provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        // The signed-in user info.
        const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        /*this.router.navigateByUrl("/admin/dashboard")*/
        this.router.navigate(['/admin/dashboard']);
        alert('user logged in')


        // ...
      }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.

      alert(errorMessage);
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    });
  }

}
