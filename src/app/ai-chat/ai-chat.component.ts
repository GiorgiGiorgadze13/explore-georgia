import { Component, signal, computed, inject, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AiRecommendationService } from '../Services/ai-recommendation.service';
import { TravelPlanService } from '../Services/travel-plan.service';
import { LanguageService } from '../Services/language.service';
import { CardImageService } from '../Services/card-image.service';
import { CsvPlace } from '../Services/places.service';

export interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  text?: string;
  recommendations?: CsvPlace[];
  quickSuggestions?: string[];
  showAddAnotherButton?: boolean;
  selectedPlaceName?: string;
  timestamp?: Date;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chat.component.html',
  styleUrl: './ai-chat.component.css'
})
export class AiChatComponent implements OnInit {
  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLDivElement>;

  private aiService = inject(AiRecommendationService);
  public travelPlanService = inject(TravelPlanService);
  public langService = inject(LanguageService);
  public imageService = inject(CardImageService);
  private router = inject(Router);

  isChatOpen = signal<boolean>(false);
  messages = signal<ChatMessage[]>([]);
  userInput = signal<string>('');
  isTyping = signal<boolean>(false);
  showNewMessagePill = signal<boolean>(false);

  selectedPlaces = computed(() => this.travelPlanService.selectedPlaces());

  private userJustSentMessage = false;
  private lastUserMessageId: number | null = null;

  ngOnInit(): void {}

  toggleChat(): void {
    const newState = !this.isChatOpen();
    this.isChatOpen.set(newState);

    if (newState) {
      if (this.messages().length === 0) {
        this.addInitialBotGreeting();
      }
      setTimeout(() => this.scrollChatToBottom(), 50);
    }
  }

  private addInitialBotGreeting(): void {
    const greetingText = this.langService.t(
      'გამარჯობა! 🤖 მე ვარ Explore Georgia-ს AI მოგზაურობის ასისტენტი. რა ადგილის აღმოჩენა გსურთ საქართველოში?',
      'Hello! 🤖 I am Explore Georgia\'s AI Travel Assistant. What places in Georgia would you like to discover?',
      'Здравствуйте! 🤖 Я ИИ Помощник Explore Georgia. Какие места в Грузии вы хотите открыть для себя?'
    );

    const initialSuggestions = [
      '🏔️ მთები',
      '🌊 მდინარეები',
      '🌲 ბუნება',
      '🏛️ ისტორიული',
      '📍 მარტვილი',
      '💰 50-100 GEL'
    ];

    this.messages.set([
      {
        id: Date.now(),
        sender: 'bot',
        text: greetingText,
        quickSuggestions: initialSuggestions,
        timestamp: new Date()
      }
    ]);
  }

  onChatScroll(): void {
    if (!this.messagesContainer?.nativeElement) return;
    const el = this.messagesContainer.nativeElement;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

    if (distanceToBottom <= 100) {
      this.showNewMessagePill.set(false);
    }
  }

  sendMessage(overrideQuery?: string): void {
    const query = (overrideQuery !== undefined ? overrideQuery : this.userInput()).trim();
    if (!query) return;

    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date()
    };

    this.lastUserMessageId = userMsg.id;
    this.messages.update(prev => [...prev, userMsg]);
    this.userInput.set('');
    this.isTyping.set(true);

    // Scroll to user message
    this.userJustSentMessage = true;
    this.scrollToUserMessage(userMsg.id);

    // 2. Query AI Recommendation Service
    this.aiService.getRecommendations(query).subscribe({
      next: (res) => {
        this.isTyping.set(false);
        const botMsg: ChatMessage = {
          id: Date.now() + 1,
          sender: 'bot',
          text: res.botMessageText,
          recommendations: res.recommendations,
          quickSuggestions: res.quickSuggestions,
          timestamp: new Date()
        };

        this.messages.update(prev => [...prev, botMsg]);
        this.handleBotReplyScroll();
      },
      error: (err) => {
        console.error('AI Recommendation Error:', err);
        this.isTyping.set(false);
        const errorMsg: ChatMessage = {
          id: Date.now() + 1,
          sender: 'bot',
          text: this.langService.t(
            '⚠️ უკაცრავად, მონაცემების დამუშავებისას დაფიქსირდა შეცდომა. გთხოვთ სცადოთ ხელახლა.',
            '⚠️ Sorry, an error occurred while processing your request. Please try again.',
            '⚠️ Извините, произошла ошибка при обработке запроса. Пожалуйста, попробуйте еще раз.'
          ),
          timestamp: new Date()
        };
        this.messages.update(prev => [...prev, errorMsg]);
        this.handleBotReplyScroll();
      }
    });
  }

  private handleBotReplyScroll(): void {
    setTimeout(() => {
      const el = this.messagesContainer?.nativeElement;
      if (!el) return;

      if (this.userJustSentMessage && this.lastUserMessageId) {
        this.scrollToUserMessage(this.lastUserMessageId);
        this.showNewMessagePill.set(false);
      } else {
        const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        const isNearBottom = distanceToBottom < 150;

        if (isNearBottom) {
          this.scrollChatToBottom();
          this.showNewMessagePill.set(false);
        } else {
          this.showNewMessagePill.set(true);
        }
      }

      this.userJustSentMessage = false;
    }, 60);
  }

  scrollToBottomManual(): void {
    this.showNewMessagePill.set(false);
    this.scrollChatToBottom();
  }

  private scrollToUserMessage(msgId?: number): void {
    setTimeout(() => {
      if (!this.messagesContainer?.nativeElement) return;
      const containerEl = this.messagesContainer.nativeElement;
      const targetId = msgId || this.lastUserMessageId;

      if (targetId) {
        const msgEl = containerEl.querySelector(`#msg-${targetId}`) as HTMLElement;
        if (msgEl) {
          const targetScrollTop = msgEl.getBoundingClientRect().top - containerEl.getBoundingClientRect().top + containerEl.scrollTop - 12;
          containerEl.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: 'smooth'
          });
          return;
        }
      }

      this.scrollChatToBottom();
    }, 60);
  }

  private scrollChatToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer?.nativeElement) {
        const el = this.messagesContainer.nativeElement;
        el.scrollTo({
          top: el.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 50);
  }

  onQuickSuggestionClick(chipText: string): void {
    let cleaned = chipText.replace(/^[^\w\u10A0-\u10FF]+/u, '').trim();
    if (cleaned.includes('/')) {
      cleaned = cleaned.split('/')[0].trim();
    }
    this.sendMessage(cleaned || chipText);
  }

  openPlaceDetails(place: CsvPlace, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    this.travelPlanService.addPlace(place);
    const image = this.imageService.getImageForItem(place.id, place.name, place.category, place.region);

    this.router.navigate(['/details'], {
      queryParams: {
        id: place.id,
        title: place.name,
        location: place.region,
        badge: place.category || place.group_key || 'ადგილი',
        image: image,
        description: place.description,
        rating: place.rating ? `${place.rating} (50 შეფასება)` : '4.9 (50 შეფასება)',
        price: 150
      },
      state: {
        card: {
          id: place.id,
          title: place.name,
          location: place.region,
          badge: place.category || place.group_key || 'ადგილი',
          image: image,
          description: place.description,
          rating: place.rating ? `${place.rating} (50 შეფასება)` : '4.9 (50 შეფასება)',
          price: 150
        }
      }
    });
  }

  selectPlace(place: CsvPlace, event: Event): void {
    event.stopPropagation();
    const added = this.travelPlanService.addPlace(place);

    const confirmText = added
      ? this.langService.t(
          `✅ არჩეულია: ${place.name} (${place.region})`,
          `✅ Selected: ${place.name} (${place.region})`,
          `✅ Выбрано: ${place.name} (${place.region})`
        )
      : this.langService.t(
          `ℹ️ ${place.name} უკვე არჩეულია თქვენს გეგმაში.`,
          `ℹ️ ${place.name} is already in your travel plan.`,
          `ℹ️ ${place.name} уже в вашем плане.`
        );

    const botConfirmMsg: ChatMessage = {
      id: Date.now(),
      sender: 'bot',
      text: confirmText,
      showAddAnotherButton: true,
      selectedPlaceName: place.name,
      timestamp: new Date()
    };

    this.messages.update(prev => [...prev, botConfirmMsg]);
    this.handleBotReplyScroll();
  }

  onAddAnotherPlace(): void {
    const promptText = this.langService.t(
      'ჩაწერთ თქვენი შემდეგი სასურველი ლოკაცია (მაგ. "მთა სამეგრელოში 100 ლარამდე" ან "ჩანჩქერი აჭარაში"):',
      'Enter your next desired destination (e.g. "mountain in Samegrelo under 100 GEL" or "waterfall in Adjara"):',
      'Введите ваше следующее место (напр. "гора в Самегрело до 100 лари" или "водопад в Аджарии"):'
    );

    const nextMsg: ChatMessage = {
      id: Date.now(),
      sender: 'bot',
      text: promptText,
      quickSuggestions: ['🏔️ მთები', '🌊 მდინარეები', '🌲 ბუნება', '📍 მარტვილი', '💰 100 GEL'],
      timestamp: new Date()
    };

    this.messages.update(prev => [...prev, nextMsg]);
    this.handleBotReplyScroll();
  }

  getPlaceImage(place: CsvPlace): string {
    return this.imageService.getImageForItem(place.id, place.name, place.category, place.region);
  }
}
