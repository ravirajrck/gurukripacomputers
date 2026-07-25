import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SITE_CONFIG } from '../../../config/site-config';

@Component({
  selector: 'app-footer',
  imports: [RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  siteData = SITE_CONFIG;
  currentYear: number = new Date().getFullYear();
}
