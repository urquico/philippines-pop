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
          <Button @click="changeIsland('Philippines')" variant="secondary"
            >Philippines</Button
          >
          <Button @click="changeIsland('Luzon')">Luzon</Button>
          <Button @click="changeIsland('Visayas')">Visayas</Button>
          <Button @click="changeIsland('Mindanao')">Mindanao</Button>
        </div>
        <div id="map" class="h-full w-full z-0"></div>
      </ResizablePanel>
      <ResizableHandle id="handle-demo-handle-1" with-handle />
      <ResizablePanel id="handle-demo-panel-2" :default-size="70">
        <div class="h-full w-full p-6">
          <h1 class="text-4xl font-bold mb-4">Dashboard</h1>
          <Separator />
          <h1 class="text-3xl font-medium my-4 text-zinc-600">
            {{ mapStore.island }}
            <span v-if="mapStore.region"> > {{ mapStore.region }}</span>
          </h1>
        </div>
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
import { Separator } from '@/components/ui/separator';
import {
  LUZON,
  MINDANAO,
  PH_COORDS,
  VISAYAS,
  defaultZoom,
  geoStyle,
} from '@/lib/constants';
import { Coordinates } from '@/lib/types';
import { useMapStore } from '@/store/map.store';
import { type Map, geoJSON, map, tileLayer } from 'leaflet';
import { onMounted, watch } from 'vue';

const mapStore = useMapStore();
let mapC: Map;

function changeIsland(newIsland: string) {
  mapStore.handleChangeIsland(newIsland, mapC);
}

onMounted(() => {
  generateMap();
});

watch(
  () => mapStore.island,
  () => {
    generateMap();
    if (mapStore.island === 'Luzon') mapC.fitBounds(LUZON as Coordinates);
    if (mapStore.island === 'Visayas') mapC.fitBounds(VISAYAS as Coordinates);
    if (mapStore.island === 'Mindanao') mapC.fitBounds(MINDANAO as Coordinates);
  },
);

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

  tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: defaultZoom,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(mapC);

  geoJSON(country, { style: geoStyle })
    .eachLayer((layer) => {
      const regionName = (layer as any).feature.properties.adm1_en;

      layer.on('mouseover', () => {
        layer.bindPopup(regionName).openPopup();
      });

      layer.on('click', () => {
        mapC.fitBounds((layer as any).getBounds());
        mapStore.region = regionName;
      });
    })
    .addTo(mapC);
}
</script>
