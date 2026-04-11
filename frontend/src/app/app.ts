import { Component, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { BottomTabBarComponent } from "@/features/app/bottom-tab-bar.component";
import { NavbarComponent } from "@/features/app/navbar.component";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, NavbarComponent, BottomTabBarComponent],
  templateUrl: "./app.html",
  styleUrl: "./app.css",
  host: {
    class: "flex flex-col min-h-screen items-stretch bg-background",
  },
})
export class App {
  protected readonly title = signal("frontend");
}
