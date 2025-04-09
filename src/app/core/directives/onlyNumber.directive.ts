import { Directive, ElementRef, HostListener, Input, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: '[onlyNumber]',
    standalone: true
})
export class OnlyNumberDirective {
    @Input() onlyNumber: boolean = true;

    constructor(private el: ElementRef, @Optional() private ngControl: NgControl) {}

    @HostListener('input', ['$event'])
    onInputChange(event: Event): void {
        if (this.onlyNumber) {
            const input = this.el.nativeElement;
            const initialValue = input.value;
            input.value = initialValue.replace(/[^0-9]/g, '');

            // Si el valor cambió, actualizar el formulario reactivo
            if (this.ngControl) {
                this.ngControl.control?.setValue(input.value, { emitEvent: true });
                this.ngControl.control?.markAsTouched();  // Opcional: marca el control como tocado
                this.ngControl.control?.updateValueAndValidity(); // Opcional: actualiza validaciones
            }

            if (initialValue !== input.value) {
                event.stopPropagation();
            }
        }
    }
}
