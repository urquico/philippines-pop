import { Coordinates } from './types';

// 12.8797° N, 121.7740° E - Philippines
export const PH_COORDS: number[] = [12.8797, 121.774];

export const geoStyle = {
  color: 'green',
  weight: 2,
  opacity: 0.65,
};

export const defaultZoom: number = 6;

export const MAP_SKIN =
  'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}';

export const ATTR =
  '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// island coordinates:
export const LUZON: Coordinates = [
  [18.62616558722052, 119.82368607106855],
  [13.62954884019396, 122.34585973508759],
];

export const VISAYAS: Coordinates = [
  [12.709412795523074, 124.86453126248233],
  [9.047046879345226, 122.97010358234623],
];

export const MINDANAO: Coordinates = [
  [9.803475205756953, 125.79443176690069],
  [5.408040921433846, 122.0121087531571],
];
