import { Component} from '@angular/core';
import { HomeHero } from './components/home-hero/home-hero';
import { HomeFloatingSocialComponent } from './components/home-floating-social/home-floating-social';
import { HomeTourSection } from './components/home-tour-section/home-tour-section';

@Component({
  selector: 'app-home',
  imports: [HomeHero, HomeFloatingSocialComponent,HomeTourSection],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
}
