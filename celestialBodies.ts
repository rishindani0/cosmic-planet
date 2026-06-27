import { CelestialBody } from '../types';

export const CELESTIAL_BODIES: CelestialBody[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    type: 'Planet',
    gravity: 3.7,
    relativeGravity: 0.38,
    temperature: '167°C',
    dayLength: '176 Earth days',
    fact: 'Mercury has only 38% of Earth\'s gravity, meaning you would weigh significantly less while maintaining the same mass. It is the smallest planet in our solar system.',
    color: '#A0A0A0',
    diameter: '4,879 km',
    distanceFromSun: '57.9M km'
  },
  {
    id: 'venus',
    name: 'Venus',
    type: 'Planet',
    gravity: 8.87,
    relativeGravity: 0.91,
    temperature: '464°C',
    dayLength: '243 Earth days',
    fact: 'Venus has 91% of Earth\'s gravity. It rotates backwards compared to most other planets, and its thick atmosphere traps heat in a runaway greenhouse effect.',
    color: '#E0B084',
    diameter: '12,104 km',
    distanceFromSun: '108.2M km'
  },
  {
    id: 'earth',
    name: 'Earth',
    type: 'Planet',
    gravity: 9.807,
    relativeGravity: 1.00,
    temperature: '15°C',
    dayLength: '24 hours',
    fact: 'Earth is your home planet, so your weight is the baseline (100% gravity). It is the only known planet to harbor life.',
    color: '#6B93D6',
    diameter: '12,742 km',
    distanceFromSun: '149.6M km'
  },
  {
    id: 'mars',
    name: 'Mars',
    type: 'Planet',
    gravity: 3.721,
    relativeGravity: 0.38,
    temperature: '-65°C',
    dayLength: '24h 37m',
    fact: 'Mars has only 38% of Earth\'s gravity, meaning you would weigh significantly less while maintaining the same mass.',
    color: '#D1492E',
    diameter: '6,779 km',
    distanceFromSun: '227.9M km'
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'Planet',
    gravity: 24.79,
    relativeGravity: 2.36,
    temperature: '-110°C',
    dayLength: '9h 56m',
    fact: 'Jupiter has 2.36 times Earth\'s gravity. You would feel incredibly heavy, and just standing up would be a massive physical challenge.',
    color: '#D39C7E',
    diameter: '139,820 km',
    distanceFromSun: '778.5M km'
  },
  {
    id: 'saturn',
    name: 'Saturn',
    type: 'Planet',
    gravity: 10.44,
    relativeGravity: 1.08,
    temperature: '-140°C',
    dayLength: '10h 34m',
    fact: 'Saturn has 108% of Earth\'s gravity. Despite its massive size, its low density means its surface gravity is surprisingly close to Earth\'s.',
    color: '#E8D2A6',
    diameter: '116,460 km',
    distanceFromSun: '1.43B km'
  },
  {
    id: 'uranus',
    name: 'Uranus',
    type: 'Planet',
    gravity: 8.69,
    relativeGravity: 0.89,
    temperature: '-195°C',
    dayLength: '17h 14m',
    fact: 'Uranus has 89% of Earth\'s gravity. It is an ice giant that rotates almost completely on its side.',
    color: '#7AC5CE',
    diameter: '50,724 km',
    distanceFromSun: '2.87B km'
  },
  {
    id: 'neptune',
    name: 'Neptune',
    type: 'Planet',
    gravity: 11.15,
    relativeGravity: 1.12,
    temperature: '-200°C',
    dayLength: '16h 6m',
    fact: 'Neptune has 112% of Earth\'s gravity. It is the windiest planet in our solar system, with gales reaching up to 2,100 km/h.',
    color: '#4B70DD',
    diameter: '49,244 km',
    distanceFromSun: '4.50B km'
  }
];
