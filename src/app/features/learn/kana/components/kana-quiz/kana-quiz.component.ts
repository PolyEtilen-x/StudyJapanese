import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectionStrategy,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { KanaCharacter, KanaService } from '../../../../../core/kana/kana.service';

interface QuizQuestion {
  type: 'AUDIO_TO_CHAR' | 'CHAR_TO_ROMAJI';
  character: KanaCharacter;
  options: string[];
  correctAnswer: string;
}

@Component({
  selector: 'app-kana-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kana-quiz.component.html',
  styleUrl: './kana-quiz.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KanaQuizComponent implements OnInit {
  @Input() characters: KanaCharacter[] = [];
  @Input() currentKana: KanaCharacter | null = null;
  @Output() close = new EventEmitter<void>();

  totalQuestions = 5;
  currentIndex = signal<number>(0);
  correctCount = signal<number>(0);
  isFinished = signal<boolean>(false);
  
  questions: QuizQuestion[] = [];
  currentQuestion = signal<QuizQuestion>({} as QuizQuestion);
  selectedOption = signal<string | null>(null);

  constructor(private readonly kanaService: KanaService) {}

  ngOnInit() {
    this.generateQuestions();
    if (this.questions.length > 0) {
      this.currentQuestion.set(this.questions[0]);
      this.playAudioAfterDelay();
    }
  }

  private generateQuestions() {
    if (this.characters.length === 0) return;

    // Filter characters of the same type (Hiragana or Katakana)
    const type = this.currentKana?.type || 'HIRAGANA';
    const pool = this.characters.filter(c => c.type === type);

    this.questions = [];
    
    // Add the active character as the first question
    if (this.currentKana) {
      this.questions.push(this.createQuestion(this.currentKana, pool));
    }

    // Add 4 more random questions from pool
    while (this.questions.length < this.totalQuestions) {
      const randomChar = pool[Math.floor(Math.random() * pool.length)];
      if (!this.questions.some(q => q.character.id === randomChar.id)) {
        this.questions.push(this.createQuestion(randomChar, pool));
      }
    }

    // Shuffle questions
    this.questions.sort(() => Math.random() - 0.5);
  }

  private createQuestion(char: KanaCharacter, pool: KanaCharacter[]): QuizQuestion {
    const isAudio = Math.random() > 0.5;
    const type = isAudio ? 'AUDIO_TO_CHAR' : 'CHAR_TO_ROMAJI';
    
    // Select correct option
    const correctAnswer = isAudio ? char.character : char.romaji;
    
    // Select 3 distractors
    const distractors = new Set<string>();
    while (distractors.size < 3) {
      const rand = pool[Math.floor(Math.random() * pool.length)];
      const optionValue = isAudio ? rand.character : rand.romaji;
      if (rand.id !== char.id && optionValue !== correctAnswer) {
        distractors.add(optionValue);
      }
    }

    // Combine and shuffle options
    const options = [correctAnswer, ...Array.from(distractors)].sort(() => Math.random() - 0.5);

    return {
      type,
      character: char,
      options,
      correctAnswer
    };
  }

  playAudio() {
    const q = this.currentQuestion();
    if (q.type === 'AUDIO_TO_CHAR' && q.character.audioUrl) {
      const audio = new Audio(q.character.audioUrl);
      audio.play().catch(e => console.error('Audio playback failed', e));
    }
  }

  private playAudioAfterDelay() {
    setTimeout(() => {
      this.playAudio();
    }, 300);
  }

  selectOption(option: string) {
    this.selectedOption.set(option);
    const q = this.currentQuestion();
    const isCorrect = option === q.correctAnswer;

    if (isCorrect) {
      this.correctCount.update(c => c + 1);
    }

    // Call API to submit progress
    this.kanaService.submitQuiz(q.character.id, isCorrect).subscribe({
      error: (err) => console.error('Failed to submit quiz progress', err)
    });

    // Advance to next question after delay
    setTimeout(() => {
      const nextIndex = this.currentIndex() + 1;
      if (nextIndex < this.totalQuestions) {
        this.currentIndex.set(nextIndex);
        this.selectedOption.set(null);
        this.currentQuestion.set(this.questions[nextIndex]);
        this.playAudioAfterDelay();
      } else {
        this.isFinished.set(true);
      }
    }, 1500);
  }

  onClose() {
    this.close.emit();
  }
}
