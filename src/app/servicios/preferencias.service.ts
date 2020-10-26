import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()

export class PreferenciasService {

  private numberSource = new BehaviorSubject(0);
  currentNumber = this.numberSource.asObservable();

  constructor() { }

  changeNumber(value): void {
    this.numberSource.next(value);
  }


}
