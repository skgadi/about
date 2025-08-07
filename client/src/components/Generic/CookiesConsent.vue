<template>
  <q-dialog v-model="showCookieConsentDialog" persistent>
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-bold">Cookie Policy</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        We use cookies to enhance your experience. By continuing to visit this site you agree to our
        use of cookies.
      </q-card-section>
      <q-card-actions>
        <q-space />
        <q-btn no-caps color="primary" label="Don't show again" @click="acceptCookies" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { Cookies } from 'quasar';

function getCookieConsent() {
  return Cookies.get('cookie_consent') === 'true';
}

const showCookieConsentDialog = ref(!getCookieConsent());

const acceptCookies = () => {
  showCookieConsentDialog.value = false;
  Cookies.set('cookie_consent', 'true');
};
</script>
