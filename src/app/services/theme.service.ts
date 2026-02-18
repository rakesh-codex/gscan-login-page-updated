import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDark = signal(false);

  constructor() {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      this.isDark.set(true);
      document.body.classList.add('dark-theme');
    }
  }

  toggle(): void {
    this.isDark.update(v => !v);
    if (this.isDark()) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }
}
