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
      regionPsgc: '',
      province: '',
      provincePsgc: '',
    }) as MapStoreType,

  actions: {
    handleChangeIsland: function (
      this: {
        island: string;
        region: string;
        regionPsgc: string;
        province: string;
        provincePsgc: string;
      },
      newIsland: string,
      map: Map,
    ) {
      this.island = newIsland;
      this.region = '';
      this.regionPsgc = '';
      this.province = '';
      this.provincePsgc = '';

      switch (newIsland) {
        case 'Luzon':
          map.fitBounds(LUZON as Coordinates);
          break;

        case 'Visayas':
          map.fitBounds(VISAYAS as Coordinates);
          break;

        case 'Mindanao':
          map.fitBounds(MINDANAO as Coordinates);
          break;

        default:
          map.setView([PH_COORDS[0], PH_COORDS[1]], defaultZoom);
          break;
      }
    },
  },
});
