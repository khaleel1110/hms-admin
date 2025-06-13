import {Component, effect, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {Router} from '@angular/router';
import {Auth, signOut, User, user} from '@angular/fire/auth';
import {Subscription} from 'rxjs';
import {GoogleAuthProvider} from "firebase/auth";
@Component({
  selector: 'app-aside-user-footer',
  standalone: true,
  imports: [],
  templateUrl: './aside-user-footer.component.html',
  styleUrl: './aside-user-footer.component.scss'
})
export class AsideUserFooterComponent {


  router = inject(Router);
  private auth = inject(Auth);
  provider = new GoogleAuthProvider();
  user$ = user(this.auth);
  userSubscription: Subscription;
  userX: User | null = null;
  userImage?: string;

  constructor() {

/*    effect(() => {
      if (this.userX?.photoURL) {
        this.userImage = this.userX.photoURL;
      } else if (this.agent()?.imageUrl) {
        this.userImage = this.agent()?.imageUrl!;

      } else {
        this.userImage = `https://ui-avatars.com/api/?name=${this.userX?.displayName ?? 'Tibet'}&background=random`;
      }
    });*/

    this.userSubscription = this.user$.subscribe((aUser: User | null) => {
      //handle user state changes here. Note, that user will be null if there is no currently logged in user.
      console.log(aUser);
      this.userX = aUser;
    })


  }


  logOut() {
    signOut(this.auth).then(() => {
      // Sign-out successful.
      location.href = '/authentication';
      // this.router.navigate(['/authentication']);
      // alert('logged out successfully');
    }).catch((error) => {
      alert(error);
      // An error happened.

    });
  }
}
