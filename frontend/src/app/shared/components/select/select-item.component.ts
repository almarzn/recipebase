import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  InjectionToken,
  inject,
  input,
  linkedSignal,
  signal,
} from "@angular/core";

import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCheck } from "@ng-icons/lucide";

import {
  selectItemIconVariants,
  selectItemVariants,
  type ZardSelectItemModeVariants,
  type ZardSelectSizeVariants,
} from "@/shared/components/select/select.variants";
import { mergeClasses, noopFn } from "@/shared/utils/merge-classes";

// Interface to avoid circular dependency
interface SelectHost {
  selectedValue(): string[];
  selectItem(value: string, label: string): void;
  navigateTo(item: ZardSelectItemComponent): void;
}

export const SELECT_ITEM_HOST = new InjectionToken<SelectHost>("SELECT_ITEM_HOST");

@Component({
  selector: "z-select-item, [z-select-item]",
  imports: [NgIcon],
  template: `
    @if (isSelected()) {
      <span [class]="iconClasses()">
        <ng-icon name="lucideCheck" [strokeWidth]="strokeWidth()" aria-hidden="true" data-testid="check-icon" />
      </span>
    }
    <span class="truncate">
      <ng-content />
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideCheck })],
  host: {
    role: "option",
    tabindex: "-1",
    "[class]": "classes()",
    "[attr.value]": "zValue()",
    "[attr.data-disabled]": 'zDisabled() ? "" : null',
    "[attr.data-selected]": 'isSelected() ? "" : null',
    "[attr.aria-selected]": "isSelected()",
    "(click)": "onClick()",
    "(mouseenter)": "onMouseEnter()",
    "(keydown.{tab}.prevent)": "noopFn",
  },
})
export class ZardSelectItemComponent {
  readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly zValue = input.required<string>();
  readonly zDisabled = input(false, { transform: booleanAttribute });
  readonly class = input<string>("");

  private readonly select = inject(SELECT_ITEM_HOST);

  readonly label = linkedSignal<string>(() => {
    const element = this.elementRef.nativeElement;
    return (element.textContent ?? element.innerText)?.trim() ?? "";
  });

  noopFn = noopFn;
  readonly zMode = signal<ZardSelectItemModeVariants>("normal");
  readonly zSize = signal<ZardSelectSizeVariants>("default");

  protected readonly classes = computed(() =>
    mergeClasses(selectItemVariants({ zMode: this.zMode(), zSize: this.zSize() }), this.class()),
  );

  protected readonly iconClasses = computed(() =>
    mergeClasses(selectItemIconVariants({ zMode: this.zMode(), zSize: this.zSize() })),
  );

  protected readonly strokeWidth = computed(() => (this.zMode() === "compact" ? 3 : 2));

  protected readonly isSelected = computed(() => this.select.selectedValue().includes(this.zValue()) ?? false);

  onMouseEnter() {
    if (this.zDisabled()) {
      return;
    }
    this.select.navigateTo(this);
  }

  onClick() {
    if (this.zDisabled()) {
      return;
    }
    this.select.selectItem(this.zValue(), this.label());
  }
}
