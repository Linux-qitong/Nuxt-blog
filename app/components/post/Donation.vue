<script setup lang="ts">
const { donation } = useAppConfig()
</script>

<template>
<div class="donation" v-if="donation?.enable">
  <Tooltip :delay="200" interactive hide-on-click="toggle" max-width="">
    <ZButton class="donate-button" icon="ph:heart-fill" text="赞赏作者" />
    <template #content>
      <div class="donation-content">
        <div class="donation-list" v-if="Object.keys(donation.items).length">
          <figure class="donation-item" v-for="(image, label) in donation.items">
            <UtilImg class="image" width="160" height="160" :src="image" />
            <figcaption class="label">{{ label }}</figcaption>
          </figure>
        </div>
        <p class="donation-message" v-if="donation.message">{{ donation.message }}</p>
      </div>
    </template>
  </Tooltip>
</div>
</template>

<style lang="scss" scoped>
.donation {
  display: flex;
  justify-content: center;

  .donate-button {
    padding: .6rem .8rem;
    border: 1px solid var(--c-border);
    box-shadow: none;
  }

  .donation-content {
    text-align: center;
    padding: .5rem .6rem;

    .donation-list {
      display: flex;
      padding: .5rem 0;
      gap: 1.5rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .donation-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: .5rem;

      .image {
        border-radius: .5rem;
      }

      .label {
        color: var(--c-text-2);
      }
    }

    .donation-message {
      color: var(--c-text-1);
    }
  }

  :deep([data-tippy-root]) {
    max-width: calc(100% - 1rem);

    .tippy-box {
      border: 1px solid var(--c-border);
      background-color: var(--c-bg-2);
    }

    .tippy-svg-arrow {
      fill: var(--c-bg-2);
    }
  }
}
</style>
