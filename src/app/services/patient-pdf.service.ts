import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {environment} from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class PatientPdfService {
  private http = inject(HttpClient);
  private apiUrl = environment.useEmulator
    ? 'http://127.0.0.1:5001/hospital-management-fdb22/us-central1/pdf_function-generatePatientPDF'
    : `https://us-central1-${environment.firebaseApp.projectId}.cloudfunctions.net/pdf_function-generatePatientPDF`;

  getDownloadLink(): Observable<string> {
    return this.http.get<{ downloadLink: string }>(this.apiUrl).pipe(
      map((response) => response.downloadLink)
    );
  }
}
