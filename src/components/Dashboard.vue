<script setup lang="ts">
import { Separator } from '@/components/ui/separator';
import { useMapStore } from '@/store/map.store';

const mapStore = useMapStore();
</script>

<template>
  <div class="h-full w-full p-6">
    <h1 class="text-4xl font-bold mb-4">Dashboard</h1>
    <Separator />
    <h1 class="text-3xl font-medium my-4 text-zinc-600">
      {{ mapStore.island }}
      <span v-if="mapStore.region"> > {{ mapStore.region }}</span>
      <span v-if="mapStore.province"> > {{ mapStore.province }}</span>
      <span v-if="mapStore.province"> > {{ mapStore.cityMun }}</span>
      <span v-if="mapStore.province"> > {{ mapStore.bgy }}</span>
    </h1>
  </div>
</template>
