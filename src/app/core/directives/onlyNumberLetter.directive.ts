import { Directive, HostListener, ElementRef, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[onlyNumberLetter]',
  standalone: true
})
export class OnlyNumberLetterDirective {
    @Input() onlyNumberLetter: boolean;
    constructor(private el: ElementRef, private control: NgControl) { }

    @HostListener('input', ['$event'])

    onInput(event: Event): void {
        if (this.onlyNumberLetter) {
            const input = this.el.nativeElement as HTMLInputElement;
            const start = input.selectionStart;
            const end = input.selectionEnd;
            const inputValue = input.value;

            // Expresión regular que permite solo caracteres alfanuméricos
            const alphanumericRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ°\s\-._:]*$/;

            // Elimina espacios en blanco y convierte el valor del input a mayúsculas
            const newValue = inputValue.toUpperCase().split('').filter(char => alphanumericRegex.test(char)).join('');

            if (inputValue !== newValue) {
            input.value = newValue;
            input.dispatchEvent(new Event('input')); // Dispara el evento 'input' para mantener el ngModel actualizado
            }

            // Restaura la posición del cursor después de la conversión
            input.setSelectionRange(start - inputValue.length + newValue.length, end - inputValue.length + newValue.length);
        }
    }

    @HostListener('blur')
    onBlur() {
        if (this.onlyNumberLetter) {
            const value = this.el.nativeElement.value.trim();
            this.el.nativeElement.value = value;
            this.control.control?.updateValueAndValidity();
        }
    }

    @HostListener('paste', ['$event'])
    onPaste(event: ClipboardEvent) {
        if (this.onlyNumberLetter) {
            event.preventDefault();
            const clipboardData = event.clipboardData;
            if (clipboardData) {
                const pastedText = clipboardData.getData('text/plain');
                const sanitizedText = pastedText.replace(/['"%@#/>=<¿?¡!|$&*{}(),]/g, '');
                document.execCommand('insertText', false, sanitizedText);
                event.preventDefault();
            }
        }
    }
}



