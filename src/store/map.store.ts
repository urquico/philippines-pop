import {
  LUZON,
  MINDANAO,
  PH_COORDS,
  VISAYAS,
  defaultZoom,
} from '@/lib/constants';
import { Coordinates, MapStoreType } from '@/lib/types';
import { Map } from 'leaflet';
import { defineStore } from 'pinia';

export const useMapStore = defineStore('map', {
  state: () =>
    ({
      island: 'Philippines',
      region: '',
    }) as MapStoreType,

  actions: {
    handleChangeIsland: function (
      this: { island: string; region: string },
      newIsland: string,
      map: Map,
    ) {
      this.island = newIsland;

      switch (newIsland) {
        case 'Luzon':
          map.fitBounds(LUZON as Coordinates);
          this.region = '';

          break;

        case 'Visayas':
          map.fitBounds(VISAYAS as Coordinates);
          this.region = '';

          break;

        case 'Mindanao':
          map.fitBounds(MINDANAO as Coordinates);
          this.region = '';

          break;

        default:
          map.setView([PH_COORDS[0], PH_COORDS[1]], defaultZoom);
          this.region = '';

          break;
      }
    },
  },
});
