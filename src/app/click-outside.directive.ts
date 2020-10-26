import { Directive, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';

// lo usamos para deselecionar las cues al clicar fuera del div del listado

@Directive({
  selector: '[clickOutside]',
})
export class ClickOutsideDirective {

  @Output() clickOutside = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) { }

  @HostListener('document:click', ['$event.target'])
  public onClick(target) {
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }
}
