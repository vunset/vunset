<script setup lang="ts">
import {
  AccordionRoot,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionPanel,
  Icon
} from '@vunset/vue';
import './accordion.css';
</script>

<template>
  <AccordionRoot :default-value="['shipping']" class="demo-accordion">
    <AccordionItem value="shipping" class="demo-accordion-item">
      <AccordionHeader class="demo-accordion-header">
        <AccordionTrigger class="demo-accordion-trigger">
          How long does shipping take?
          <Icon name="chevron-right" class="demo-accordion-icon" />
        </AccordionTrigger>
      </AccordionHeader>

      <AccordionPanel class="demo-accordion-panel">
        <div class="demo-accordion-content">Two to four working days within the EU.</div>
      </AccordionPanel>
    </AccordionItem>

    <AccordionItem value="returns" class="demo-accordion-item">
      <AccordionHeader class="demo-accordion-header">
        <AccordionTrigger class="demo-accordion-trigger">
          Can I return an order?
          <Icon name="chevron-right" class="demo-accordion-icon" />
        </AccordionTrigger>
      </AccordionHeader>

      <AccordionPanel class="demo-accordion-panel">
        <div class="demo-accordion-content">Within 30 days, in its original packaging.</div>
      </AccordionPanel>
    </AccordionItem>

    <AccordionItem value="warranty" class="demo-accordion-item">
      <AccordionHeader class="demo-accordion-header">
        <AccordionTrigger class="demo-accordion-trigger">
          Is there a warranty?
          <Icon name="chevron-right" class="demo-accordion-icon" />
        </AccordionTrigger>
      </AccordionHeader>

      <AccordionPanel class="demo-accordion-panel">
        <div class="demo-accordion-content">Two years on every product.</div>
      </AccordionPanel>
    </AccordionItem>
  </AccordionRoot>
</template>
