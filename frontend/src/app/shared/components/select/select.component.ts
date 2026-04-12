import { Overlay, OverlayModule, OverlayPositionBuilder, type OverlayRef } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import { isPlatformBrowser } from "@angular/common";
import {
  type AfterContentInit,
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  ElementRef,
  effect,
  Injector,
  inject,
  input,
  model,
  type OnDestroy,
  output,
  PLATFORM_ID,
  runInInjectionContext,
  signal,
  type TemplateRef,
  ViewContainerRef,
  viewChild,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import type { FormValueControl } from "@angular/forms/signals";

import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideChevronDown, lucideListChevronsUpDown } from "@ng-icons/lucide";
import type { ClassValue } from "clsx";
import { filter } from "rxjs";

import { ZardBadgeComponent } from "@/shared/components/badge";
import {
  selectContentVariants,
  selectTriggerVariants,
  selectVariants,
  type ZardSelectSizeVariants,
} from "@/shared/components/select/select.variants";
import { SELECT_ITEM_HOST, ZardSelectItemComponent } from "@/shared/components/select/select-item.component";
import { mergeClasses } from "@/shared/utils/merge-classes";

const COMPACT_MODE_WIDTH_THRESHOLD = 100;

@Component({
  selector: "z-select, [z-select]",
  imports: [OverlayModule, ZardBadgeComponent, NgIcon],
  template: `
    <button
      type="button"
      role="combobox"
      aria-controls="dropdown"
      [class]="triggerClasses()"
      [disabled]="disabled()"
      [attr.aria-expanded]="isOpen()"
      [attr.aria-haspopup]="'listbox'"
      [attr.data-placeholder]="!value() ? '' : null"
      (blur)="!isOpen() && isFocus.set(false)"
      (click)="toggle()"
      (focus)="onFocus()"
    >
      <span class="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        @for (label of selectedLabels(); track label) {
          @if (zMultiple()) {
            <z-badge zType="secondary">
              <span class="truncate">{{ label }}</span>
            </z-badge>
          } @else {
            <span class="truncate">{{ label }}</span>
          }
        } @empty {
          <span class="text-muted-foreground truncate">{{ zPlaceholder() }}</span>
        }
      </span>
      <ng-icon
        [name]="zIcon() === 'down' ? 'lucideChevronDown' : 'lucideListChevronsUpDown'"
        class="size-4! opacity-50"
      />
    </button>

    <ng-template #dropdownTemplate>
      <div
        id="dropdown"
        [class]="contentClasses()"
        role="listbox"
        [attr.data-state]="'open'"
        (keydown.{arrowdown,arrowup,enter,space,escape,home,end}.prevent)="
          onDropdownKeydown($event)
        "
        tabindex="-1"
      >
        <div class="p-1">
          <ng-content />
        </div>
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideChevronDown, lucideListChevronsUpDown })],
  host: {
    "[attr.data-active]": 'isFocus() ? "" : null',
    "[attr.data-disabled]": 'disabled() ? "" : null',
    "[attr.data-state]": 'isOpen() ? "open" : "closed"',
    "[class]": "classes()",
    "(keydown.{enter,space,arrowdown,arrowup,escape}.prevent)": "onTriggerKeydown($event)",
  },
  providers: [
    {
      provide: SELECT_ITEM_HOST,
      useFactory: () => {
        const selectComponent = inject(ZardSelectComponent);

        return {
          selectedValue: () =>
            selectComponent.zMultiple() ? (selectComponent.value() as string[]) : [selectComponent.value() as string],
          selectItem: (value: string, label: string) => selectComponent.selectItem(value, label),
          navigateTo: (item: ZardSelectItemComponent) => selectComponent.navigateTo(item),
        };
      },
    },
  ],
})
export class ZardSelectComponent implements FormValueControl<string | string[]>, AfterContentInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);
  private readonly overlay = inject(Overlay);
  private readonly overlayPositionBuilder = inject(OverlayPositionBuilder);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly platformId = inject(PLATFORM_ID);

  readonly dropdownTemplate = viewChild.required<TemplateRef<void>>("dropdownTemplate");
  readonly selectItems = contentChildren(ZardSelectItemComponent);

  private overlayRef?: OverlayRef;
  private portal?: TemplatePortal;

  readonly class = input<ClassValue>("");
  readonly zLabel = input<string>("");
  readonly zMaxLabelCount = input<number>(1);
  readonly zMultiple = input<boolean>(false);
  readonly zPlaceholder = input<string>("Select an option...");
  readonly zSize = input<ZardSelectSizeVariants>("default");

  readonly zSelectionChange = output<string | string[]>();
  readonly zIcon = input<"expand" | "down">("down");

  // Signal forms API - these are the form control state
  value = model<string | string[]>("");
  disabled = model<boolean>(false);

  readonly isOpen = signal(false);
  readonly focusedIndex = signal<number>(-1);
  protected readonly isFocus = signal(false);
  protected readonly isCompact = signal(false);

  constructor() {
    effect(() => {
      if (this.disabled() && this.isOpen()) {
        this.close();
      }
    });
  }

  protected onFocus(): void {
    if (this.isCompact()) {
      this.isFocus.set(true);
    }
  }

  // Compute the label based on selected value
  readonly selectedLabels = computed<string[]>(() => {
    const selectedValue = this.value();
    if (this.zMultiple() && Array.isArray(selectedValue)) {
      return this.provideLabelsForMultiselectMode(selectedValue);
    }

    return this.provideLabelForSingleSelectMode(selectedValue as string);
  });

  protected readonly classes = computed(() => mergeClasses(selectVariants(), this.class()));
  protected readonly contentClasses = computed(() => mergeClasses(selectContentVariants()));
  protected readonly triggerClasses = computed(() =>
    mergeClasses(
      selectTriggerVariants({
        zSize: this.zSize(),
      }),
    ),
  );

  ngAfterContentInit() {
    const hostWidth = this.elementRef.nativeElement.offsetWidth || 0;
    for (const item of this.selectItems()) {
      item.zSize.set(this.zSize());

      if (hostWidth <= COMPACT_MODE_WIDTH_THRESHOLD) {
        this.isCompact.set(true);
        item.zMode.set("compact");
      }
    }
  }

  ngOnDestroy() {
    this.destroyOverlay();
  }

  onTriggerKeydown(event: Event) {
    if (this.disabled()) {
      return;
    }

    const { key } = event as KeyboardEvent;
    switch (key) {
      case "Enter":
      case " ":
      case "ArrowDown":
      case "ArrowUp":
        if (!this.isOpen()) {
          this.open();
        }
        break;
      case "Escape":
        if (this.isOpen()) {
          this.close();
        }
        break;
    }
  }

  onDropdownKeydown(e: Event) {
    const { key } = e as KeyboardEvent;
    const items = this.getSelectItems();

    switch (key) {
      case "ArrowDown":
        this.navigateItems(1, items);
        break;
      case "ArrowUp":
        this.navigateItems(-1, items);
        break;
      case "Enter":
      case " ":
        this.selectFocusedItem(items);
        break;
      case "Escape":
        this.close();
        this.focusButton();
        break;
      case "Home":
        this.focusFirstItem(items);
        break;
      case "End":
        this.focusLastItem(items);
        break;
    }
  }

  toggle() {
    if (this.disabled()) {
      return;
    }

    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  selectItem(itemValue: string, label: string) {
    if (this.disabled()) {
      return;
    }

    if (itemValue === undefined || itemValue === null || itemValue === "") {
      console.warn("Attempted to select item with invalid value:", { value: itemValue, label });
      return;
    }

    this.value.update((selectedValues) => {
      if (Array.isArray(selectedValues)) {
        return selectedValues.includes(itemValue)
          ? selectedValues.filter((v) => v !== itemValue)
          : [...selectedValues, itemValue];
      }

      return itemValue;
    });

    if (this.zMultiple()) {
      // in multiple mode it can happen that button changes size because of selection badges,
      // which requires overlay position to update
      this.updateOverlayPosition();
    } else {
      this.close();

      // Return focus to the button after selection
      setTimeout(() => {
        this.focusButton();
      }, 0);
    }
  }

  navigateTo(_element: ZardSelectItemComponent): void {
    const index = this.selectItems().indexOf(_element);
    if (index === -1) return;

    this.focusedIndex.set(index);
    this.updateItemFocus(this.getSelectItems(true), index);
  }

  private updateOverlayPosition(): void {
    setTimeout(() => {
      this.overlayRef?.updatePosition();
    }, 0);
  }

  private provideLabelsForMultiselectMode(selectedValue: string[]): string[] {
    const labelsToShowCount = selectedValue.length - this.zMaxLabelCount();
    const labels = [];
    let index = 0;
    for (const value of selectedValue) {
      const matchingItem = this.getMatchingItem(value);
      if (matchingItem) {
        labels.push(matchingItem.label());
        index++;
      }
      if (labelsToShowCount && this.zMaxLabelCount() && index === this.zMaxLabelCount()) {
        labels.push(`${labelsToShowCount} more item${labelsToShowCount > 1 ? "s" : ""} selected`);
        break;
      }
    }
    return labels;
  }

  private provideLabelForSingleSelectMode(selectedValue: string): string[] {
    const manualLabel = this.zLabel();
    if (manualLabel) {
      return [manualLabel];
    }

    const matchingItem = this.getMatchingItem(selectedValue);
    if (matchingItem) {
      return [matchingItem.label()];
    }

    return selectedValue ? [selectedValue] : [];
  }

  private open() {
    if (this.isOpen() || this.disabled()) {
      return;
    }

    // Create overlay if it doesn't exist
    if (!this.overlayRef) {
      this.createOverlay();
    }

    if (!this.overlayRef) {
      return;
    }

    const hostWidth = this.elementRef.nativeElement.offsetWidth || 0;

    if (this.overlayRef.hasAttached()) {
      this.overlayRef.detach();
    }

    this.portal = new TemplatePortal(this.dropdownTemplate(), this.viewContainerRef);

    this.overlayRef.attach(this.portal);
    this.overlayRef.updateSize({ width: hostWidth });
    this.isOpen.set(true);
    this.updateFocusWhenNormalMode();

    this.determinePortalWidthOnOpen(hostWidth);
  }

  private setFocusOnOpen(): void {
    this.focusDropdown();
    this.focusSelectedItem();
  }

  private close() {
    if (this.overlayRef?.hasAttached()) {
      this.overlayRef.detach();
    }
    this.isOpen.set(false);
    this.focusedIndex.set(-1);
    this.updateFocusWhenNormalMode();
  }

  private updateFocusWhenNormalMode(): void {
    if (!this.isCompact()) {
      this.isFocus.set(!this.isOpen());
    }
  }

  private getMatchingItem(value: string): ZardSelectItemComponent | undefined {
    return this.selectItems()?.find((item) => item.zValue() === value);
  }

  private determinePortalWidthOnOpen(portalWidth: number): void {
    runInInjectionContext(this.injector, () => {
      afterNextRender(() => {
        if (!this.overlayRef?.hasAttached()) {
          return;
        }

        const overlayPaneElement = this.overlayRef.overlayElement;
        const textElements = Array.from(
          overlayPaneElement.querySelectorAll<HTMLElement>(
            "z-select-item > span.truncate, [z-select-item] > span.truncate",
          ),
        );
        let isOverflow = false;
        for (const textElement of textElements) {
          if (textElement.scrollWidth > textElement.clientWidth + 1) {
            isOverflow = true;
            break;
          }
        }

        if (!isOverflow) {
          this.setFocusOnOpen();
          return;
        }

        const selectItems = this.selectItems();
        let itemMaxWidth = 0;
        for (const item of selectItems) {
          itemMaxWidth = Math.max(itemMaxWidth, item.elementRef.nativeElement.scrollWidth);
        }

        const [selectItem] = selectItems;
        if (isOverflow && selectItem) {
          const elementStyles = getComputedStyle(selectItem.elementRef.nativeElement);
          const leftPadding = Number.parseFloat(elementStyles.getPropertyValue("padding-left")) || 0;
          const rightPadding = Number.parseFloat(elementStyles.getPropertyValue("padding-right")) || 0;
          itemMaxWidth += leftPadding + rightPadding;
        }

        itemMaxWidth = Math.max(itemMaxWidth, portalWidth);
        this.overlayRef.updateSize({ width: itemMaxWidth });
        this.overlayRef.updatePosition();

        this.setFocusOnOpen();
      });
    });
  }

  private createOverlay() {
    if (this.overlayRef) {
      return;
    } // Already created

    if (isPlatformBrowser(this.platformId)) {
      try {
        const positionStrategy = this.overlayPositionBuilder
          .flexibleConnectedTo(this.elementRef)
          .withPositions([
            {
              originX: "center",
              originY: "bottom",
              overlayX: "center",
              overlayY: "top",
              offsetY: 4,
            },
            {
              originX: "center",
              originY: "top",
              overlayX: "center",
              overlayY: "bottom",
              offsetY: -4,
            },
          ])
          .withPush(false);

        const elementWidth = this.elementRef.nativeElement.offsetWidth || 200;

        this.overlayRef = this.overlay.create({
          positionStrategy,
          hasBackdrop: false,
          scrollStrategy: this.overlay.scrollStrategies.reposition(),
          width: elementWidth,
          maxHeight: 384, // max-h-96 equivalent
        });
        this.overlayRef
          .outsidePointerEvents()
          .pipe(
            filter((event) => !this.elementRef.nativeElement.contains(event.target)),
            takeUntilDestroyed(this.destroyRef),
          )
          .subscribe(() => {
            this.isFocus.set(false);
            this.close();
          });
      } catch (error) {
        console.error("Error creating overlay:", error);
      }
    }
  }

  private destroyOverlay() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = undefined;
    }
  }

  private getSelectItems(ignoreFilter = false): HTMLElement[] {
    if (!this.overlayRef?.hasAttached()) {
      return [];
    }
    const dropdownElement = this.overlayRef.overlayElement;
    return Array.from(dropdownElement.querySelectorAll<HTMLElement>("z-select-item, [z-select-item]")).filter(
      (item) => ignoreFilter || item.dataset["disabled"] === undefined,
    );
  }

  private navigateItems(direction: number, items: HTMLElement[]) {
    if (items.length === 0) {
      return;
    }

    const currentIndex = this.focusedIndex();
    let nextIndex = currentIndex + direction;

    if (nextIndex < 0) {
      nextIndex = items.length - 1;
    } else if (nextIndex >= items.length) {
      nextIndex = 0;
    }

    this.focusedIndex.set(nextIndex);
    this.updateItemFocus(items, nextIndex);
  }

  private selectFocusedItem(items: HTMLElement[]) {
    const currentIndex = this.focusedIndex();
    if (currentIndex >= 0 && currentIndex < items.length) {
      const item = items[currentIndex];
      const value = item.getAttribute("value");
      const label = item.textContent?.trim() ?? "";

      if (value === null || value === undefined) {
        console.warn("No value attribute found on selected item:", item);
        return;
      }

      this.selectItem(value, label);
    }
  }

  private focusFirstItem(items: HTMLElement[]) {
    if (items.length > 0) {
      this.focusedIndex.set(0);
      this.updateItemFocus(items, 0);
    }
  }

  private focusLastItem(items: HTMLElement[]) {
    if (items.length > 0) {
      const lastIndex = items.length - 1;
      this.focusedIndex.set(lastIndex);
      this.updateItemFocus(items, lastIndex);
    }
  }

  private updateItemFocus(items: HTMLElement[], focusedIndex: number) {
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      if (index === focusedIndex) {
        item.focus();
        item.setAttribute("aria-selected", "true");
        item.setAttribute("data-selected", "true");
      } else {
        item.removeAttribute("aria-selected");
        item.removeAttribute("data-selected");
      }
    }
  }

  private focusDropdown() {
    if (this.overlayRef?.hasAttached()) {
      const dropdownElement = this.overlayRef.overlayElement.querySelector('[role="listbox"]') as HTMLElement;
      if (dropdownElement) {
        dropdownElement.focus();
      }
    }
  }

  private focusButton() {
    const button = this.elementRef.nativeElement.querySelector("button");
    if (button) {
      button.focus();
    }
  }

  private focusSelectedItem() {
    const items = this.getSelectItems();
    if (items.length === 0) {
      return;
    }

    // Find the index of the currently selected item
    let selectedValue: string | undefined;
    const currentValue = this.value();
    if (Array.isArray(currentValue) && currentValue.length > 0) {
      [selectedValue] = currentValue;
    } else if (typeof currentValue === "string") {
      selectedValue = currentValue;
    }

    let selectedIndex = items.findIndex((item) => item.getAttribute("value") === selectedValue);

    // If no item is selected, focus the first item
    if (selectedIndex === -1) {
      selectedIndex = 0;
    }

    this.focusedIndex.set(selectedIndex);
    this.updateItemFocus(items, selectedIndex);
  }
}
