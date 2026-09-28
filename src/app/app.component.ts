import { Component, inject } from "@angular/core";
import { NavigationEnd, RouterOutlet } from "@angular/router";
import { NavbarComponent } from "./core/components/navbar/navbar.component";
import { FooterComponent } from "./core/components/footer/footer.component";
import { SidebarComponent } from "./core/components/sidebar/sidebar.component";
import { SidebarService } from "./core/services/sidebar.service";
import { CommonModule } from "@angular/common";
import { Router} from  '@angular/router';
import { filter } from "rxjs";

@Component({
  selector: "app-root",
  imports: [
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    SidebarComponent,
    CommonModule,
  ],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {
  title = "product-catelog";

  public sidebarService = inject(SidebarService); // Service inject ki

  showNavbarFooter: boolean = true;

  constructor(private router: Router) {

    this.router.events.pipe(filter((event:any) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url.includes("/admin")) {
          this.showNavbarFooter = false;
        } else {
          this.showNavbarFooter = true;
        }
        console.log(this.showNavbarFooter)
      });
  }
}
