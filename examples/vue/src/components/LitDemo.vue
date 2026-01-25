<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import type { Dialog } from '@lit-ui/dialog';

const count = ref(0);
const dialogOpen = ref(false);
const dialogRef = ref<Dialog | null>(null);

// Handle dialog open/close through the DOM element
watch(dialogOpen, (isOpen) => {
  const dialog = dialogRef.value;
  if (!dialog) return;

  if (isOpen) {
    dialog.show();
  } else {
    dialog.close();
  }
});

// Listen for dialog close event
onMounted(() => {
  const dialog = dialogRef.value;
  if (!dialog) return;

  const handleClose = () => {
    dialogOpen.value = false;
  };
  dialog.addEventListener('close', handleClose);

  onUnmounted(() => {
    dialog.removeEventListener('close', handleClose);
  });
});
</script>

<template>
  <div class="demo" :style="{ '--lui-button-radius': '8px' }">
    <div class="button-row">
      <lui-button variant="primary" @click="count++">
        Clicked {{ count }} times
      </lui-button>

      <lui-button variant="secondary" @click="dialogOpen = true">
        Open Dialog
      </lui-button>
    </div>

    <lui-dialog ref="dialogRef">
      <span slot="title">Hello from Lit UI</span>
      <p>This dialog is a Lit component rendered in Vue.</p>
      <p>The showModal/close APIs work correctly with Vue reactivity.</p>
      <div slot="footer" class="dialog-footer">
        <lui-button variant="secondary" @click="dialogOpen = false">
          Close
        </lui-button>
        <lui-button variant="primary" @click="dialogOpen = false">
          Confirm
        </lui-button>
      </div>
    </lui-dialog>
  </div>
</template>

<style scoped>
.button-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.dialog-footer {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
</style>
