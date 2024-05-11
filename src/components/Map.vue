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
        <div
          class="absolute z-50 bottom-0 left-0 mb-4 ml-4 flex flex-col gap-2"
        >
          <Button @click="handleChangeIsland('Philippines')" variant="secondary"
            >Philippines</Button
          >
          <Button @click="handleChangeIsland('Luzon')">Luzon</Button>
          <Button @click="handleChangeIsland('Visayas')">Visayas</Button>
          <Button @click="handleChangeIsland('Mindanao')">Mindanao</Button>
        </div>
        <div id="map" class="h-full w-full z-0"></div>
      </ResizablePanel>
      <ResizableHandle id="handle-demo-handle-1" with-handle />
      <ResizablePanel id="handle-demo-panel-2" :default-size="70">
        <div class="h-full w-full p-6">
          <h1 class="text-4xl font-bold mb-4">Dashboard</h1>
          <Separator />
          <h1 class="text-3xl font-medium my-4 text-zinc-600">
            {{ island }}
            <span v-if="region"> > {{ region }}</span>
          </h1>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
</template>

<script setup lang="ts">
import geo from '@/assets/geojson/country/medres/country.0.01.json';
import { Button } from '@/components/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Separator } from '@/components/ui/separator';
import { type Map, geoJSON, map, tileLayer } from 'leaflet';
import { onMounted, ref, watch } from 'vue';

const island = ref('Philippines');
const region = ref('');
const defaultZoom = ref(6);

let mapC: Map;

// 12.8797° N, 121.7740° E - Philippines
const PH_COORDS: number[] = [12.8797, 121.774];

const geoStyle = {
  color: 'green',
  weight: 2,
  opacity: 0.65,
};

const handleChangeIsland = (newIsland: string) => {
  island.value = newIsland;
  switch (newIsland) {
    case 'Luzon':
      region.value = '';

      break;
    case 'Visayas':
      region.value = '';

      break;
    case 'Mindanao':
      region.value = '';

      break;
    default:
      region.value = '';

      break;
  }
};

onMounted(() => {
  generateMap();
});

watch(island, () => {
  generateMap();

  if (island.value === 'Luzon')
    mapC.fitBounds([
      [18.62616558722052, 119.82368607106855],
      [13.62954884019396, 122.34585973508759],
    ]);

  if (island.value === 'Visayas')
    mapC.fitBounds([
      [12.709412795523074, 124.86453126248233],
      [9.047046879345226, 122.97010358234623],
    ]);

  if (island.value === 'Mindanao')
    mapC.fitBounds([
      [9.803475205756953, 125.79443176690069],
      [5.408040921433846, 122.0121087531571],
    ]);
});

function generateMap() {
  if (mapC) mapC.remove();

  const newGeo =
    island.value === 'Philippines'
      ? (geo as any).features
      : (geo as any).features.filter(
          (feature: any) => feature.properties.island === island.value,
        );

  const country: GeoJSON.FeatureCollection<any> = {
    type: 'FeatureCollection',
    features: newGeo,
  };

  mapC = map('map').setView([PH_COORDS[0], PH_COORDS[1]], defaultZoom.value);

  tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: defaultZoom.value,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(mapC);

  geoJSON(country, { style: geoStyle })
    .eachLayer((layer) => {
      const regionName = (layer as any).feature.properties.adm1_en;

      layer.on('click', () => {
        mapC.fitBounds((layer as any).getBounds());
        region.value = regionName;
      });

      layer.bindPopup(regionName);
    })
    .addTo(mapC);
}
</script>
