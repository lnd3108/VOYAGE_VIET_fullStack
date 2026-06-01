import { Component} from '@angular/core';
import { HomeHero } from './components/home-hero/home-hero';
import { HomeFloatingSocialComponent } from './components/home-floating-social/home-floating-social';

@Component({
  selector: 'app-home',
  imports: [HomeHero, HomeFloatingSocialComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
}
