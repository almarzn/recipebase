import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  forwardRef,
  input,
  linkedSignal,
  type ModelSignal,
  model,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import type { FormValueControl } from "@angular/forms/signals";
import type { ClassValue } from "clsx";
import { mergeClasses } from "@/shared/utils/merge-classes";
import { segmentedItemVariants, segmentedVariants, type ZardSegmentedVariants } from "./segmented.variants";

export interface SegmentedOption {
  value: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: "z-segmented-item",
  template: `
    <ng-content />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ZardSegmentedItemComponent {
  readonly value = input.required<string>();
  readonly label = input.required<string>();
  readonly zDisabled = input(false, { transform: booleanAttribute });
}

@Component({
  selector: "z-segmented",
  template: `
    <div [class]="classes()" role="tablist" [attr.aria-label]="zAriaLabel()">
      @for (option of zOptions(); track option.value) {
        <button
          type="button"
          role="tab"
          [class]="getItemClasses(option.value)"
          [disabled]="option.disabled || disabledState()"
          [attr.aria-selected]="isSelected(option.value)"
          [attr.aria-controls]="option.value + '-panel'"
          [attr.id]="option.value + '-tab'"
          (click)="selectOption(option.value)"
        >
          {{ option.label }}
        </button>
      } @empty {
        @for (item of items(); track item.value()) {
          <button
            type="button"
            role="tab"
            [class]="getItemClasses(item.value())"
            [disabled]="item.zDisabled() || disabledState()"
            [attr.aria-selected]="isSelected(item.value())"
            [attr.aria-controls]="item.value() + '-panel'"
            [attr.id]="item.value() + '-tab'"
            (click)="selectOption(item.value())"
          >
            {{ item.label() }}
          </button>
        }
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ZardSegmentedComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "wrapperClasses()",
  },
  exportAs: "zSegmented",
})
export class ZardSegmentedComponent implements FormValueControl<string | undefined> {
  private readonly itemComponents = contentChildren(ZardSegmentedItemComponent);

  readonly class = input<ClassValue>("");
  readonly zSize = input<ZardSegmentedVariants["zSize"]>("default");
  readonly zOptions = input<SegmentedOption[]>([]);
  readonly zDisabled = input(false, { transform: booleanAttribute });
  readonly zAriaLabel = input<string>("Segmented control");

  protected readonly disabledState = linkedSignal(() => this.zDisabled());
  protected readonly items = signal<readonly ZardSegmentedItemComponent[]>([]);

  readonly value: ModelSignal<string | undefined> = model();

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (value: string) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched = () => {};

  constructor() {
    effect(() => {
      this.items.set(this.itemComponents());
    });
  }

  protected readonly classes = computed(() => mergeClasses(segmentedVariants({ zSize: this.zSize() }), this.class()));

  protected readonly wrapperClasses = computed(() => "inline-block");

  protected getItemClasses(value: string): string {
    return segmentedItemVariants({
      zSize: this.zSize(),
      isActive: this.isSelected(value),
    });
  }

  protected isSelected(value: string): boolean {
    return this.value() === value;
  }

  protected selectOption(value: string) {
    if (this.disabledState()) {
      return;
    }

    const option = this.zOptions().find((opt) => opt.value === value);
    const item = this.items().find((item) => item.value() === value);

    if (option?.disabled || item?.zDisabled()) {
      return;
    }

    this.value.set(value);
    this.onChange(value);
    this.onTouched();
  }
}
