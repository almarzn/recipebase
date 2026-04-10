import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-import',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="px-24 py-12">
      <h1 class="text-4xl font-serif">Import</h1>
    </div>
  `,
})
export class ImportPage {}
