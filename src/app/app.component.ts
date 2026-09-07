import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SeoService } from './Services/seo.service';
import { AiChatComponent } from './ai-chat/ai-chat.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AiChatComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private seoService = inject(SeoService);
  title = 'explore-georgia';
}
