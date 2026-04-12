---
name: converting-controlvalueaccessor-to-signal-forms
description: Use when converting Angular ControlValueAccessor components to Signal-based forms, migrating from traditional form controls to Angular Signal forms, or removing zValue patterns from custom form components
---

# Converting ControlValueAccessor to Signal Forms

## Overview

Migrate Angular custom form controls from traditional `ControlValueAccessor` implementations to the modern Signal-based forms API. Eliminate duplicate state management by centralizing on the `value` signal instead of maintaining separate `zValue` variables.

**Core principle:** The `value` signal IS the source of truth. Remove all auxiliary state variables.

**Important:** Signal Forms uses a completely different paradigm. Components implement the `FormValueControl` interface and are used with the `[formField]` directive, not the traditional `ControlValueAccessor` pattern.

## When to Use

- Converting existing `ControlValueAccessor` components to Signal forms
- Creating new custom form components with Signal-based reactive forms
- Refactoring components that have both `value` and `zValue` state duplication
- Migrating from `writeValue`/`onChange` patterns to Signal-based `FormValueControl`

## Core Pattern

### Before: Traditional ControlValueAccessor

```typescript
import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-custom-input',
  template: `<input [ngModel]="zValue" (ngModelChange)="handleChange($event)">`,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CustomInputComponent),
    multi: true
  }]
})
export class CustomInputComponent implements ControlValueAccessor {
  zValue: string = '';  // ❌ Duplicate state
  disabled = false;
  
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.zValue = value;  // ❌ Manual sync required
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleChange(value: string): void {
    this.zValue = value;
    this.onChange(value);  // ❌ Manual notification
    this.onTouched();
  }
}
```

### After: Signal Forms

```typescript
import { Component, model } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';

@Component({
  selector: 'app-custom-input',
  template: `
    <input 
      [value]="value()" 
      (input)="value.set($any($event.target).value)"
      [disabled]="disabled()"
    >
  `,
})
export class CustomInputComponent implements FormValueControl<string> {
  // ✅ Single source of truth - no zValue
  value = model<string>('');
  disabled = model<boolean>(false);
}
```

### Consumer Usage

Signal Forms controls are used with the `[formField]` directive:

```typescript
import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { CustomInputComponent } from './custom-input.component';

@Component({
  selector: 'app-my-form',
  imports: [FormField, CustomInputComponent],
  template: `
    <app-custom-input [formField]="myForm.name" />
  `,
})
export class MyFormComponent {
  myForm = form({ name: '' });
}
```

## Migration Steps

1. **Remove `NG_VALUE_ACCESSOR` provider**: Delete the providers array with `NG_VALUE_ACCESSOR`

2. **Add `FormValueControl` interface**: Import and implement `FormValueControl<T>` from `@angular/forms/signals`

3. **Remove `ControlValueAccessor` interface**: Replace with `FormValueControl<T>`

4. **Replace `@Input` with `model()`**: Use `model<T>()` for `value` and `disabled` instead of `@Input()` with manual change detection

5. **Delete all manual synchronization**:
   - Remove `writeValue()` method
   - Remove `registerOnChange()` method
   - Remove `registerOnTouched()` method
   - Remove `setDisabledState()` method
   - Remove `onChange` and `onTouched` callbacks

6. **Remove zValue pattern**: Delete any `zValue`, `internalValue`, `_value`, or similar duplicate state variables. Use `value()` directly in templates.

7. **Update template bindings**:
   - Use `value()` for reading the signal
   - Use `value.set()` or `value.update()` for writing
   - Use `disabled()` and `disabled.set()` for disabled state

8. **Update consumers**: Change from `[(ngModel)]` or `formControlName` to `[formField]` directive

## Quick Reference

| Traditional API | Signal Forms API |
|-----------------|------------------|
| `implements ControlValueAccessor` | `implements FormValueControl<T>` |
| `NG_VALUE_ACCESSOR` provider | Remove - no provider needed |
| `forwardRef(() => Component)` | Not needed |
| `@Input() value` | `value = model<T>()` |
| `writeValue(v)` | Automatic via `model()` |
| `registerOnChange(fn)` | Automatic via `model()` |
| `registerOnTouched(fn)` | Automatic via `model()` |
| `setDisabledState(isDisabled)` | `disabled = model<boolean>()` |
| `onChange(value)` | `value.set(value)` |
| `zValue` / internal state | Direct `value()` usage |
| `[(ngModel)]` or `formControlName` | `[formField]` directive |

## Common Mistakes

### Keeping zValue alongside value

```typescript
// ❌ WRONG: Duplicate state
export class MyControl implements FormValueControl<string> {
  value = model<string>('');
  zValue = '';  // Remove this!
  
  someMethod() {
    this.zValue = this.value();  // Don't sync manually
  }
}
```

### Using @Input instead of model()

```typescript
// ❌ WRONG: @Input doesn't integrate with forms
export class MyControl implements FormValueControl<string> {
  @Input() value: string = '';  // Use model() instead
}

// ✅ CORRECT
export class MyControl implements FormValueControl<string> {
  value = model<string>('');
}
```

### Forgetting to remove ControlValueAccessor methods

```typescript
// ❌ WRONG: Keeping old methods
export class MyControl implements FormValueControl<string> {
  value = model<string>('');
  
  writeValue(v: string) {  // Remove this
    this.value.set(v);
  }
}

// ✅ CORRECT
export class MyControl implements FormValueControl<string> {
  value = model<string>('');
  disabled = model<boolean>(false);
}
```

### Keeping the NG_VALUE_ACCESSOR provider

```typescript
// ❌ WRONG: Old provider pattern
@Component({
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MyControl),
    multi: true
  }]
})
export class MyControl {}

// ✅ CORRECT
@Component({
  // No providers needed for FormValueControl
})
export class MyControl implements FormValueControl<string> {
  value = model<string>('');
  disabled = model<boolean>(false);
}
```

### Using old form directives with new controls

```typescript
// ❌ WRONG: Using ngModel with FormValueControl
<app-custom-input [(ngModel)]="name" />

// ✅ CORRECT: Using formField directive
<app-custom-input [formField]="myForm.name" />
```

## Validation Integration

Signal Forms validation is handled in the form schema, not in the control:

```typescript
import { Component, model } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';

@Component({
  selector: 'app-validated-input',
  template: `
    <input 
      [value]="value()" 
      (input)="value.set($any($event.target).value)"
      [disabled]="disabled()"
    >
  `,
})
export class ValidatedInputComponent implements FormValueControl<string> {
  value = model<string>('');
  disabled = model<boolean>(false);
}
```

Usage with validators:

```typescript
import { Component, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';

@Component({
  imports: [FormField, ValidatedInputComponent],
  template: `<app-validated-input [formField]="myForm.email" />`,
})
export class MyForm {
  myModel = signal({ email: '' });
  myForm = form(this.myModel, (schemaPath) => {
    required(schemaPath.email, { message: 'Email is required' });
  });
}
```

## Real-World Example: Select Component

```typescript
import { Component, model, computed, input, signal } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';

interface Option {
  id: string;
  label: string;
}

@Component({
  selector: 'app-custom-select',
  template: `
    <div class="select-container">
      <button 
        type="button"
        (click)="open.set(!open())"
        [disabled]="disabled()"
      >
        {{ selectedOption()?.label || 'Select...' }}
      </button>
      
      @if (open()) {
        <div class="dropdown">
          @for (option of options(); track option.id) {
            <button
              type="button"
              (click)="select(option)"
              [class.selected]="value() === option.id"
            >
              {{ option.label }}
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class CustomSelectComponent implements FormValueControl<string> {
  // Form control state - required by FormValueControl
  value = model<string>('');
  disabled = model<boolean>(false);
  
  // Component-specific state (separate from form state)
  open = signal(false);
  options = input.required<Option[]>();
  
  selectedOption = computed(() => 
    this.options().find(o => o.id === this.value())
  );

  select(option: Option): void {
    this.value.set(option.id);  // ✅ Updates form control directly
    this.open.set(false);
  }
}
```

## Advanced: Optional State Signals

You can add optional state signals to respond to form state:

```typescript
import { Component, model, input } from '@angular/core';
import type { FormValueControl, ValidationError, DisabledReason } from '@angular/forms/signals';

@Component({
  selector: 'app-stateful-input',
  template: `
    <div class="input-wrapper">
      <input 
        [value]="value()" 
        (input)="value.set($any($event.target).value)"
        [disabled]="disabled()"
        (blur)="touched.set(true)"
      />
      @if (errors(); as errs) {
        @for (error of errs; track error) {
          <span class="error">{{ error.message }}</span>
        }
      }
    </div>
  `,
})
export class StatefulInput implements FormValueControl<string> {
  // Required
  value = model<string>('');
  
  // Optional form state - passed automatically by [formField] directive
  disabled = model<boolean>(false);
  touched = model<boolean>(false);
  errors = input<readonly ValidationError[]>([]);
}
```

## References

- [Angular Signal Forms - Custom Controls](https://angular.dev/guide/forms/signals/custom-controls)
- `FormValueControl` interface from `@angular/forms/signals`
- `model()` signal for two-way binding
- `form()` and `[formField]` directive from `@angular/forms/signals`
