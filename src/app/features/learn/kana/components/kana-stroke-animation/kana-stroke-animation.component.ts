import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  afterNextRender,
  OnDestroy,
  inject,
  ChangeDetectionStrategy,
  signal,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'app-kana-stroke-animation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kana-stroke-animation.component.html',
  styleUrl: './kana-stroke-animation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KanaStrokeAnimationComponent implements OnDestroy {
  @Input() strokeSvgPath: string | null = null;

  @ViewChild('animationCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  activeStrokeIndex = signal<number>(0);
  totalStrokes = signal<number>(0);

  private ctx!: CanvasRenderingContext2D;
  private animationId: any = null;
  private strokesData: Point[][] = [];
  
  private currentStroke = 0;
  private currentPoint = 0;
  private delayCounter = 0;
  private readonly delayBetweenStrokes = 15; // frames

  constructor() {
    effect(() => {
      if (this.strokeSvgPath) {
        this.parsePathData();
        this.restart();
      }
    });

    afterNextRender(() => {
      this.initCanvas();
      this.startAnimation();
    });
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const context = canvas.getContext('2d');
    if (context) {
      this.ctx = context as any;
    }
  }

  private parsePathData() {
    if (!this.strokeSvgPath) {
      this.strokesData = [];
      this.totalStrokes.set(0);
      return;
    }
    const paths = this.strokeSvgPath.split(';');
    this.strokesData = paths.map(path => this.parseSvgPathToPoints(path)).filter(s => s.length > 0);
    this.totalStrokes.set(this.strokesData.length);
  }

  private parseSvgPathToPoints(path: string): Point[] {
    const points: Point[] = [];
    const tokens = path.match(/[a-df-z]+|[-+]?[0-9]*\.?[0-9]+/gi) || [];

    let currentCmd = '';
    let i = 0;
    let lastPt: Point = { x: 0, y: 0 };

    while (i < tokens.length) {
      const token = tokens[i];
      if (isNaN(Number(token))) {
        currentCmd = token;
        i++;
      }

      const cmd = currentCmd.toUpperCase();

      if (cmd === 'M' || cmd === 'L') {
        const x = Number(tokens[i++]);
        const y = Number(tokens[i++]);
        if (!isNaN(x) && !isNaN(y)) {
          lastPt = { x, y };
          points.push(lastPt);
        }
      } else if (cmd === 'C') {
        const x1 = Number(tokens[i++]);
        const y1 = Number(tokens[i++]);
        const x2 = Number(tokens[i++]);
        const y2 = Number(tokens[i++]);
        const x3 = Number(tokens[i++]);
        const y3 = Number(tokens[i++]);

        if (!isNaN(x1) && !isNaN(y1) && !isNaN(x2) && !isNaN(y2) && !isNaN(x3) && !isNaN(y3)) {
          const p0 = lastPt;
          const p1 = { x: x1, y: y1 };
          const p2 = { x: x2, y: y2 };
          const p3 = { x: x3, y: y3 };

          const steps = 15;
          for (let s = 1; s <= steps; s++) {
            const t = s / steps;
            const mt = 1 - t;
            const x = mt*mt*mt*p0.x + 3*mt*mt*t*p1.x + 3*mt*t*t*p2.x + t*t*t*p3.x;
            const y = mt*mt*mt*p0.y + 3*mt*mt*t*p1.y + 3*mt*t*t*p2.y + t*t*t*p3.y;
            points.push({ x, y });
          }
          lastPt = p3;
        }
      } else {
        i++;
      }
    }

    // Resample the parsed path to make the animation speed uniform
    return this.resamplePoints(points, 40);
  }

  private resamplePoints(points: Point[], N: number): Point[] {
    if (points.length === 0) return [];
    if (points.length === 1) return Array(N).fill(points[0]);

    let length = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    if (length === 0) return Array(N).fill(points[0]);

    const interval = length / (N - 1);
    let accumulateDist = 0;
    const resampled: Point[] = [points[0]];

    let i = 1;
    const ptsCopy = [...points];

    while (i < ptsCopy.length && resampled.length < N - 1) {
      const dx = ptsCopy[i].x - ptsCopy[i - 1].x;
      const dy = ptsCopy[i].y - ptsCopy[i - 1].y;
      const d = Math.sqrt(dx * dx + dy * dy);

      if (accumulateDist + d >= interval) {
        const ratio = (interval - accumulateDist) / d;
        const nx = ptsCopy[i - 1].x + ratio * dx;
        const ny = ptsCopy[i - 1].y + ratio * dy;
        const newPt = { x: nx, y: ny };
        resampled.push(newPt);
        ptsCopy.splice(i, 0, newPt);
        accumulateDist = 0;
      } else {
        accumulateDist += d;
      }
      i++;
    }

    while (resampled.length < N) {
      resampled.push(points[points.length - 1]);
    }

    return resampled;
  }

  restart() {
    this.currentStroke = 0;
    this.currentPoint = 0;
    this.delayCounter = 0;
    this.activeStrokeIndex.set(0);
  }

  private startAnimation() {
    const tick = () => {
      this.drawFrame();
      this.animationId = requestAnimationFrame(tick);
    };
    tick();
  }

  private drawFrame() {
    if (!this.ctx || this.strokesData.length === 0) return;

    const canvas = this.canvasRef.nativeElement;
    const w = canvas.width;
    const h = canvas.height;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, w, h);

    // Draw grid helper lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(w / 2, 0); this.ctx.lineTo(w / 2, h);
    this.ctx.moveTo(0, h / 2); this.ctx.lineTo(w, h / 2);
    this.ctx.stroke();

    // 1. Draw fully completed strokes (in light gray or subtle color)
    for (let i = 0; i < this.currentStroke; i++) {
      this.drawStroke(this.strokesData[i], this.strokesData[i].length, 'rgba(255, 255, 255, 0.15)', 8);
    }

    // 2. Draw current active stroke up to currentPoint index
    if (this.currentStroke < this.strokesData.length) {
      const stroke = this.strokesData[this.currentStroke];
      this.drawStroke(stroke, this.currentPoint, '#6366f1', 8);

      // Draw brush head indicator
      if (this.currentPoint > 0 && this.currentPoint < stroke.length) {
        const pt = stroke[this.currentPoint - 1];
        const scaleX = w / 100;
        const scaleY = h / 100;
        
        this.ctx.fillStyle = '#818cf8';
        this.ctx.beginPath();
        this.ctx.arc(pt.x * scaleX, pt.y * scaleY, 8, 0, 2 * Math.PI);
        this.ctx.fill();

        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }
    }

    // Animation progress logic
    if (this.currentStroke < this.strokesData.length) {
      const stroke = this.strokesData[this.currentStroke];
      if (this.currentPoint < stroke.length) {
        this.currentPoint += 1.5; // step increment speed
      } else {
        // Active stroke completed, delay before next stroke
        this.delayCounter++;
        if (this.delayCounter >= this.delayBetweenStrokes) {
          this.delayCounter = 0;
          this.currentStroke++;
          this.currentPoint = 0;
          if (this.currentStroke < this.strokesData.length) {
            this.activeStrokeIndex.set(this.currentStroke);
          }
        }
      }
    } else {
      // Loop loop pause
      this.delayCounter++;
      if (this.delayCounter >= 60) { // Wait 1 second before restarting
        this.restart();
      }
    }
  }

  private drawStroke(stroke: Point[], limit: number, color: string, thickness: number) {
    if (stroke.length < 2) return;
    
    const canvas = this.canvasRef.nativeElement;
    const scaleX = canvas.width / 100;
    const scaleY = canvas.height / 100;
    const end = Math.min(stroke.length, Math.floor(limit));

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = thickness;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    this.ctx.beginPath();
    this.ctx.moveTo(stroke[0].x * scaleX, stroke[0].y * scaleY);
    for (let i = 1; i < end; i++) {
      this.ctx.lineTo(stroke[i].x * scaleX, stroke[i].y * scaleY);
    }
    this.ctx.stroke();
  }

  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
