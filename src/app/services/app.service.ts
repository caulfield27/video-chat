import { Injectable, signal } from "@angular/core";


@Injectable({
    providedIn: 'root'
})

export class AppService{
    currentView = signal<'menu' | 'create' | 'join' | 'call'>('menu');
}