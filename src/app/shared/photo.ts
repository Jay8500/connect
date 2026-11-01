import { Component, inject, input } from '@angular/core';
import { Store } from '../core/store';
import { Icon } from './icon';
import { Toast } from './ui';

const MAX_BYTES = 15 * 1024 * 1024;
const SIZE = 320; // square, enough for every avatar size and tiny on data

/**
 * Camera badge for my avatar: pick a photo → it is cropped, compressed and shown everywhere at once.
 * No confirm step; the toast offers Undo instead.
 */
@Component({
  selector: 'app-photo-button',
  imports: [Icon],
  host: { class: 'contents' },
  template: `
    <button type="button" (click)="file.click()" [class]="cls()" aria-label="Change profile photo" title="Change profile photo">
      <svg lucideIcon="camera" [size]="iconSize()" />
    </button>
    <input #file type="file" accept="image/*" class="hidden" (change)="pick($event)" />
  `,
})
export class PhotoButton {
  private readonly store = inject(Store);
  private readonly toast = inject(Toast);
  readonly cls = input('grid h-9 w-9 place-items-center rounded-full bg-brand text-white shadow-md ring-4 ring-white');
  readonly iconSize = input(17);

  async pick(e: Event) {
    const input = e.target as HTMLInputElement;
    const f = input.files?.[0];
    input.value = ''; // same photo can be picked again
    if (!f) return;
    if (!f.type.startsWith('image/')) return this.toast.show('Please choose a photo');
    if (f.size > MAX_BYTES) return this.toast.show('Photo is too big (max 15 MB)');
    try {
      const before = this.store.myPhoto();
      this.store.setMyPhoto(await squareJpeg(f));
      this.toast.show('Profile photo updated', { label: 'Undo', run: () => this.store.setMyPhoto(before) });
    } catch {
      this.toast.show('Couldn’t read that photo. Try another one.');
    }
  }
}

/** Centre-crop to a square and compress to a small JPEG. */
async function squareJpeg(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const side = Math.min(bmp.width, bmp.height);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  canvas.getContext('2d')!.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
  bmp.close();
  return canvas.toDataURL('image/jpeg', 0.85);
}
