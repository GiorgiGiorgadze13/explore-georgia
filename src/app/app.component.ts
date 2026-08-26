import { Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SeoService } from './Services/seo.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, AfterViewInit {
  private seoService = inject(SeoService);
  private router = inject(Router);
  title = 'explore-georgia';

  ngOnInit(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.refreshIosScroll();
    });
  }

  ngAfterViewInit(): void {
    this.refreshIosScroll();
  }

  private refreshIosScroll(): void {
    if (typeof window === 'undefined') return;

    const triggerLayout = () => {
      window.dispatchEvent(new Event('resize'));
      if (document.body) {
        const _ = document.body.offsetHeight;
      }
    };

    requestAnimationFrame(triggerLayout);
    setTimeout(triggerLayout, 100);
    setTimeout(triggerLayout, 300);
    setTimeout(triggerLayout, 600);
    setTimeout(triggerLayout, 1200);
  }
}
