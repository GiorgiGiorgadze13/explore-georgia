import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface SeoConfig {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  private readonly defaultTitle = 'Explore Georgia | აღმოაჩინე საქართველო - მოგზაურობა, ტურიზმი და კულტურა';
  private readonly defaultDescription = 'აღმოაჩინეთ საქართველოს ულამაზესი კუთხეები, ისტორიული ადგილები, ტრადიციები, ღონისძიებები და ტურისტული მარშრუტები | Explore Georgia travel & culture platform.';
  private readonly defaultKeywords = 'საქართველო, ტურიზმი, მოგზაურობა, თბილისი, ბათუმი, ყაზბეგი, სვანეთი, Georgia, travel, Caucasus, tourism, Georgian culture, traditional food, wine, hiking Georgia';
  private readonly defaultImage = 'https://exploregeorgia.ge/assets/images/hero-georgia.jpg';
  private readonly siteUrl = 'https://exploregeorgia.ge';

  constructor() {
    this.listenToRouteChanges();
  }

  private listenToRouteChanges(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(() => {
      let route = this.activatedRoute;
      while (route.firstChild) {
        route = route.firstChild;
      }
      route.data.subscribe((data) => {
        this.updateSeo({
          title: data['title'],
          description: data['description'],
          keywords: data['keywords'],
          image: data['image'],
          url: this.siteUrl + this.router.url,
          type: data['ogType'] || 'website'
        });
      });
    });
  }

  public updateSeo(config: SeoConfig = {}): void {
    const title = config.title
      ? `${config.title} | Explore Georgia`
      : this.defaultTitle;
    const description = config.description || this.defaultDescription;
    const keywords = config.keywords || this.defaultKeywords;
    const image = config.image || this.defaultImage;
    const url = config.url || (this.siteUrl + this.router.url);
    const type = config.type || 'website';

    // 1. Update HTML document title
    this.titleService.setTitle(title);

    // 2. Primary Meta Tags
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ name: 'keywords', content: keywords });

    // 3. Open Graph / Facebook
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:image', content: image });
    this.metaService.updateTag({ property: 'og:url', content: url });
    this.metaService.updateTag({ property: 'og:type', content: type });
    this.metaService.updateTag({ property: 'og:site_name', content: 'Explore Georgia' });

    // 4. Twitter Cards
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
    this.metaService.updateTag({ name: 'twitter:image', content: image });

    // 5. Canonical Link
    this.updateCanonicalUrl(url);
  }

  private updateCanonicalUrl(url: string): void {
    let link: HTMLLinkElement | null = document.querySelector("link[rel='canonical']");
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
