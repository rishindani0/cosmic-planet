/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CelestialBody {
  id: string;
  name: string;
  type: 'Planet' | 'Dwarf Planet' | 'Moon';
  gravity: number; // m/s^2
  relativeGravity: number; // multiplier compared to Earth (0-X)
  temperature: string;
  dayLength: string;
  fact: string;
  color: string; // Solid primary theme hex
  diameter: string;
  distanceFromSun: string; // Or distance from planet for moons
  textureUrl?: string;
}

export interface CalculationResult {
  earthWeight: number;
  bodyWeight: number;
  body: CelestialBody;
}
