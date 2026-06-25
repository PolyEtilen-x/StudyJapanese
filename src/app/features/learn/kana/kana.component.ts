import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KanaCharacter, KanaService } from '../../../core/kana/kana.service';
import { KanaStrokeAnimationComponent } from './components/kana-stroke-animation/kana-stroke-animation.component';
import { KanaWritingCanvasComponent } from './components/kana-writing-canvas/kana-writing-canvas.component';
import { KanaQuizComponent } from './components/kana-quiz/kana-quiz.component';

interface GroupedRow {
  rowName: string;
  characters: KanaCharacter[];
}

@Component({
  selector: 'app-kana',
  standalone: true,
  imports: [
    CommonModule,
    KanaStrokeAnimationComponent,
    KanaWritingCanvasComponent,
    KanaQuizComponent
  ],
  templateUrl: './kana.component.html',
  styleUrl: './kana.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KanaComponent implements OnInit {
  activeTab = signal<'HIRAGANA' | 'KATAKANA'>('HIRAGANA');
  
  isKatakanaLocked = signal<boolean>(true);
  hiraganaScore = signal<number>(0);
  groupedRows = signal<GroupedRow[]>([]);
  
  selectedChar = signal<KanaCharacter | null>(null);
  modalTab = signal<'WRITE' | 'QUIZ'>('WRITE');
  
  isWritingSubmitting = signal<boolean>(false);
  writingResult = signal<{ score: number } | null>(null);

  rawCharacters: KanaCharacter[] = [];

  constructor(private readonly kanaService: KanaService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.kanaService.getKanaList().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.rawCharacters = res.data.characters;
          this.isKatakanaLocked.set(res.data.isKatakanaLocked);
          this.hiraganaScore.set(res.data.hiraganaOverallScore);
          this.groupCharacters();
        }
      },
      error: (err) => console.error('Failed to load Kana list', err)
    });
  }

  switchTab(tab: 'HIRAGANA' | 'KATAKANA') {
    if (tab === 'KATAKANA' && this.isKatakanaLocked()) {
      alert(`🔒 Bảng Katakana đang khóa!\nHọc viên cần đạt điểm trung bình Hiragana từ 80% trở lên để mở khóa.\nTiến độ hiện tại của bạn: ${this.hiraganaScore()}%`);
      return;
    }
    this.activeTab.set(tab);
    this.groupCharacters();
  }

  private groupCharacters() {
    const activeType = this.activeTab();
    const filtered = this.rawCharacters.filter((c) => c.type === activeType);
    
    // Group by rowGroup in standard row order
    const rowOrder = [
      'a-row',
      'ka-row',
      'sa-row',
      'ta-row',
      'na-row',
      'ha-row',
      'ma-row',
      'ya-row',
      'ra-row',
      'wa-row',
      'n-row',
    ];

    const groupMap = new Map<string, KanaCharacter[]>();
    for (const r of rowOrder) {
      groupMap.set(r, []);
    }

    for (const char of filtered) {
      const row = char.rowGroup || 'a-row';
      if (!groupMap.has(row)) {
        groupMap.set(row, []);
      }
      groupMap.get(row)!.push(char);
    }

    const grouped: GroupedRow[] = [];
    for (const [rowName, chars] of groupMap.entries()) {
      if (chars.length > 0) {
        grouped.push({
          rowName: rowName.replace('-row', ' row'),
          characters: chars.sort((a, b) => a.orderIndex - b.orderIndex),
        });
      }
    }

    this.groupedRows.set(grouped);
  }

  getScoreColor(score: number): string {
    if (score === 0) return 'rgba(255, 255, 255, 0.1)';
    if (score < 50) return '#ef4444'; // Red
    if (score < 80) return '#f59e0b'; // Amber
    return '#10b981'; // Emerald Green
  }

  openDetail(char: KanaCharacter) {
    this.selectedChar.set(char);
    this.modalTab.set('WRITE');
    this.writingResult.set(null);
    this.playSelectedAudio();
  }

  closeDetail() {
    this.selectedChar.set(null);
    this.loadData(); // Reload progress stats
  }

  playSelectedAudio() {
    const char = this.selectedChar();
    if (char && char.audioUrl) {
      const audio = new Audio(char.audioUrl);
      audio.play().catch((e) => console.error('Audio play failed', e));
    }
  }

  onSubmitWriting(strokes: { x: number; y: number }[][]) {
    const char = this.selectedChar();
    if (!char) return;

    this.isWritingSubmitting.set(true);
    this.writingResult.set(null);

    this.kanaService.submitWriting(char.id, strokes).subscribe({
      next: (res) => {
        this.isWritingSubmitting.set(false);
        if (res.success && res.data) {
          const score = res.data.similarityScore;
          this.writingResult.set({ score });
        }
      },
      error: (err) => {
        this.isWritingSubmitting.set(false);
        console.error('Failed to submit drawing', err);
      }
    });
  }
}
