<template>
  <div class="h-screen flex gap-2 p-6">
    <ResizablePanelGroup
      id="handle-demo-group-1"
      direction="horizontal"
      class="h-full w-full rounded-lg border shadow"
    >
      <ResizablePanel
        id="handle-demo-panel-1"
        :default-size="30"
        class="relative"
      >
        <div class="absolute z-50 bottom-0 left-0 m-4 flex flex-col gap-2">
          <Button @click="changeIsland('Philippines')" variant="secondary"
            >Philippines</Button
          >
          <Button @click="changeIsland('Luzon')">Luzon</Button>
          <Button @click="changeIsland('Visayas')">Visayas</Button>
          <Button @click="changeIsland('Mindanao')">Mindanao</Button>
        </div>

        <div class="absolute z-50 top-0 right-0 m-4 flex flex-col gap-2">
          <Button @click="showRegionNames = !showRegionNames">
            <Eye class="w-4 h-4 mr-2" />Show Region Names</Button
          >
        </div>
        <div id="map" class="h-full w-full z-0"></div>
      </ResizablePanel>
      <ResizableHandle id="handle-demo-handle-1" with-handle />
      <ResizablePanel id="handle-demo-panel-2" :default-size="70">
        <Dashboard />
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
</template>

<script setup lang="ts">
import geo from '@/assets/data/country/medres/country.0.01.json';
import { Button } from '@/components/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import {
  ATTR,
  LUZON,
  MAP_SKIN,
  MINDANAO,
  PH_COORDS,
  VISAYAS,
  defaultZoom,
  geoStyle,
  provinceStyle,
  regionStyle,
} from '@/lib/constants';
import { Coordinates } from '@/lib/types';
import { useMapStore } from '@/store/map.store';
import { type Map, geoJSON, map, tileLayer } from 'leaflet';
import { Eye } from 'lucide-vue-next';
import { onMounted, ref, watch } from 'vue';

import Dashboard from './Dashboard.vue';

const mapStore = useMapStore();
let mapC: Map;

// States
const showRegionNames = ref<boolean>(false);

function changeIsland(newIsland: string) {
  mapStore.handleChangeIsland(newIsland, mapC);
}

onMounted(() => {
  generateMap();
});

watch(
  [
    () => mapStore.island,
    () => mapStore.regionPsgc,
    () => mapStore.provincePsgc,
    () => mapStore.cityMunPsgc,
    showRegionNames,
  ],
  async () => {
    generateMap();

    if (mapStore.regionPsgc && mapStore.provincePsgc && mapStore.cityMunPsgc) {
      await generateMunicities();
    }

    if (
      mapStore.regionPsgc &&
      mapStore.provincePsgc &&
      mapStore.cityMunPsgc === ''
    ) {
      await generateProvince();
    }

    if (
      mapStore.regionPsgc &&
      mapStore.provincePsgc === '' &&
      mapStore.cityMunPsgc === ''
    ) {
      await generateRegion();
    }

    if (mapStore.island === 'Luzon' && mapStore.regionPsgc === '')
      mapC.fitBounds(LUZON as Coordinates);
    if (mapStore.island === 'Visayas' && mapStore.regionPsgc === '')
      mapC.fitBounds(VISAYAS as Coordinates);
    if (mapStore.island === 'Mindanao' && mapStore.regionPsgc === '')
      mapC.fitBounds(MINDANAO as Coordinates);
  },
);

async function generateMunicities() {
  if (mapC) mapC.remove();

  await import(
    `@/assets/data/municities/medres/bgysubmuns-municity-${mapStore.cityMunPsgc}.0.01.json`
  ).then((data) => {
    console.log(data);
    mapC = map('map');
    tileLayer(MAP_SKIN, {
      minZoom: defaultZoom,
      attribution: ATTR,
    }).addTo(mapC);
    mapC.fitBounds(
      geoJSON(data as any, {
        filter: (feature: any) =>
          feature.properties.adm3_psgc === mapStore.cityMunPsgc,
      }).getBounds(),
    );
    const municity: GeoJSON.FeatureCollection<any> = {
      type: 'FeatureCollection',
      features: data.features,
    };
    geoJSON(municity, { style: provinceStyle })
      .eachLayer((layer) => {
        const bgyName = (layer as any).feature.properties.adm4_en;
        layer.on('click', () => {
          mapStore.bgy = bgyName;
        });
        layer.bindTooltip(bgyName, {
          permanent: showRegionNames.value,
          direction: showRegionNames.value ? 'center' : 'top',
          className: 'text-xs',
          sticky: !showRegionNames.value,
        });
      })
      .addTo(mapC);
  });
}

async function generateProvince() {
  if (mapC) mapC.remove();

  await import(
    `@/assets/data/provdists/medres/municities-provdist-${mapStore.provincePsgc}.0.01.json`
  ).then((data) => {
    mapC = map('map');

    tileLayer(MAP_SKIN, {
      minZoom: defaultZoom,
      attribution: ATTR,
    }).addTo(mapC);

    mapC.fitBounds(
      geoJSON(data as any, {
        filter: (feature: any) =>
          feature.properties.adm2_psgc === mapStore.provincePsgc,
      }).getBounds(),
    );

    const province: GeoJSON.FeatureCollection<any> = {
      type: 'FeatureCollection',
      features: data.features,
    };

    geoJSON(province, { style: provinceStyle })
      .eachLayer((layer) => {
        const cityMunName = (layer as any).feature.properties.adm3_en;
        const cityMunPsgc = (layer as any).feature.properties.adm3_psgc;

        layer.on('click', () => {
          mapStore.cityMun = cityMunName;
          mapStore.cityMunPsgc = cityMunPsgc;
        });

        layer.bindTooltip(cityMunName, {
          permanent: showRegionNames.value,
          direction: showRegionNames.value ? 'center' : 'top',
          className: 'text-xs',
          sticky: !showRegionNames.value,
        });
      })
      .addTo(mapC);
  });
}

async function generateRegion() {
  if (mapC) mapC.remove();

  // open a file with the region's data `provdists-region-${mapStore.regionPsgc}.0.01`
  await import(
    `@/assets/data/regions/medres/provdists-region-${mapStore.regionPsgc}.0.01.json`
  ).then((data) => {
    mapC = map('map');

    tileLayer(MAP_SKIN, {
      minZoom: defaultZoom,
      attribution: ATTR,
    }).addTo(mapC);

    mapC.fitBounds(
      geoJSON(data as any, {
        filter: (feature: any) =>
          feature.properties.adm1_psgc === mapStore.regionPsgc,
      }).getBounds(),
    );

    const region: GeoJSON.FeatureCollection<any> = {
      type: 'FeatureCollection',
      features: data.features,
    };

    geoJSON(region, { style: regionStyle })
      .eachLayer((layer) => {
        const provName = (layer as any).feature.properties.adm2_en;
        const provPsgc = (layer as any).feature.properties.adm2_psgc;

        layer.on('click', () => {
          mapStore.province = provName;
          mapStore.provincePsgc = provPsgc;
        });

        layer.bindTooltip(provName, {
          permanent: showRegionNames.value,
          direction: showRegionNames.value ? 'center' : 'top',
          className: 'text-xs',
          sticky: !showRegionNames.value,
        });
      })
      .addTo(mapC);
  });
}

function generateMap() {
  if (mapC) mapC.remove();

  const newGeo =
    mapStore.island === 'Philippines'
      ? (geo as any).features
      : (geo as any).features.filter(
          (feature: any) => feature.properties.island === mapStore.island,
        );

  const country: GeoJSON.FeatureCollection<any> = {
    type: 'FeatureCollection',
    features: newGeo,
  };

  mapC = map('map').setView([PH_COORDS[0], PH_COORDS[1]], defaultZoom);

  tileLayer(MAP_SKIN, {
    minZoom: defaultZoom,
    attribution: ATTR,
  }).addTo(mapC);

  geoJSON(country, { style: geoStyle })
    .eachLayer((layer) => {
      const regionName = (layer as any).feature.properties.adm1_en;
      const regionPsgc = (layer as any).feature.properties.adm1_psgc;

      layer.on('click', () => {
        mapStore.region = regionName;
        mapStore.regionPsgc = regionPsgc;
      });

      layer.bindTooltip(regionName, {
        permanent: showRegionNames.value,
        direction: showRegionNames.value ? 'center' : 'top',
        className: 'text-xs',
        sticky: !showRegionNames.value,
      });
    })
    .addTo(mapC);
}
</script>
