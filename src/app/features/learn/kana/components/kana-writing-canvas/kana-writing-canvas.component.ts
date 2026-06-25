import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  afterNextRender,
  ChangeDetectionStrategy,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'app-kana-writing-canvas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kana-writing-canvas.component.html',
  styleUrl: './kana-writing-canvas.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KanaWritingCanvasComponent {
  @Input() strokeSvgPath: string | null = null;
  @Input() isSubmitting = false;

  @Output() submitDrawing = new EventEmitter<Point[][]>();

  @ViewChild('drawingCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  showTemplate = signal<boolean>(false);
  strokes: Point[][] = [];

  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private currentStroke: Point[] = [];
  private templateStrokes: Point[][] = [];

  constructor() {
    afterNextRender(() => {
      this.initCanvas();
      this.parseTemplatePath();
      this.redraw();
    });
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const context = canvas.getContext('2d');
    if (context) {
      this.ctx = context;
    }
  }

  private parseTemplatePath() {
    if (!this.strokeSvgPath) {
      this.templateStrokes = [];
      return;
    }
    const paths = this.strokeSvgPath.split(';');
    this.templateStrokes = paths.map(path => this.parseSvgPathToPoints(path)).filter(s => s.length > 0);
  }

  toggleTemplate() {
    this.showTemplate.update(val => !val);
    this.redraw();
  }

  clearCanvas() {
    this.strokes = [];
    this.currentStroke = [];
    this.redraw();
  }

  submit() {
    if (this.strokes.length > 0) {
      this.submitDrawing.emit(this.strokes);
    }
  }

  // ── MOUSE EVENTS ───────────────────────────────────────────────────────────

  onMouseDown(e: MouseEvent) {
    this.isDrawing = true;
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    this.currentStroke = [{ x, y }];
    this.strokes.push(this.currentStroke);
    this.redraw();
  }

  onMouseMove(e: MouseEvent) {
    if (!this.isDrawing) return;
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    this.currentStroke.push({ x, y });
    this.redraw();
  }

  onMouseUp() {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.currentStroke = [];
    }
  }

  // ── TOUCH EVENTS ───────────────────────────────────────────────────────────

  onTouchStart(e: TouchEvent) {
    if (e.touches.length === 0) return;
    this.isDrawing = true;

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    this.currentStroke = [{ x, y }];
    this.strokes.push(this.currentStroke);
    this.redraw();
    e.preventDefault(); // Stop mobile scroll
  }

  onTouchMove(e: TouchEvent) {
    if (!this.isDrawing || e.touches.length === 0) return;

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    this.currentStroke.push({ x, y });
    this.redraw();
    e.preventDefault();
  }

  onTouchEnd() {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.currentStroke = [];
    }
  }

  // ── DRAWING LOGIC ──────────────────────────────────────────────────────────

  private redraw() {
    if (!this.ctx) return;

    const canvas = this.canvasRef.nativeElement;
    const w = canvas.width;
    const h = canvas.height;

    // Clear
    this.ctx.clearRect(0, 0, w, h);

    // Draw helper grid lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(w / 2, 0); this.ctx.lineTo(w / 2, h);
    this.ctx.moveTo(0, h / 2); this.ctx.lineTo(w, h / 2);
    this.ctx.stroke();

    // Draw sample template if enabled
    if (this.showTemplate() && this.templateStrokes.length > 0) {
      const scaleX = w / 100;
      const scaleY = h / 100;
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      this.ctx.lineWidth = 16;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';

      for (const stroke of this.templateStrokes) {
        if (stroke.length < 2) continue;
        this.ctx.beginPath();
        this.ctx.moveTo(stroke[0].x * scaleX, stroke[0].y * scaleY);
        for (let i = 1; i < stroke.length; i++) {
          this.ctx.lineTo(stroke[i].x * scaleX, stroke[i].y * scaleY);
        }
        this.ctx.stroke();
      }
    }

    // Draw user strokes
    const scaleX = w / 100;
    const scaleY = h / 100;
    this.ctx.strokeStyle = '#10b981'; // Emerald color for writing strokes
    this.ctx.lineWidth = 8;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    for (const stroke of this.strokes) {
      if (stroke.length === 0) continue;
      this.ctx.beginPath();
      this.ctx.moveTo(stroke[0].x * scaleX, stroke[0].y * scaleY);

      if (stroke.length === 1) {
        this.ctx.arc(stroke[0].x * scaleX, stroke[0].y * scaleY, 4, 0, 2 * Math.PI);
      } else {
        for (let i = 1; i < stroke.length; i++) {
          this.ctx.lineTo(stroke[i].x * scaleX, stroke[i].y * scaleY);
        }
      }
      this.ctx.stroke();
    }
  }

  // ── SVG PATH PARSER (SAME AS BACKEND FOR TRACE RENDERING) ─────────────────

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

          const steps = 10;
          for (let s = 1; s <= steps; s++) {
            const t = s / steps;
            const mt = 1 - t;
            const x = mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x;
            const y = mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y;
            points.push({ x, y });
          }
          lastPt = p3;
        }
      } else {
        i++;
      }
    }
    return points;
  }
}
