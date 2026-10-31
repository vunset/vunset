<script setup lang="ts">
import { ref, useId } from 'vue';
import {
  MenubarRoot,
  MenuRoot,
  MenuTrigger,
  Portal,
  Positioner,
  Popup,
  MenuItem,
  Separator,
  ToggleGroup,
  Toggle,
  type Side
} from '@vunset/vue';
import '../menu/menu.css';
import './menubar.css';
import '../toggle-group/toggle.css';

const sideLabel = useId();
const last = ref('—');
const side = ref<Side>('right');
const sides: Side[] = ['right', 'left', 'top', 'bottom'];
const recent = ['report-q3.md', 'budget.xlsx', 'notes.txt'];
const formats = ['PDF', 'HTML', 'Markdown'];
</script>

<template>
  <div class="demo-menubar-stack">
    <div class="demo-menubar-option">
      <span :id="sideLabel">Open recent's side</span>
      <ToggleGroup v-model="side" required :aria-labelledby="sideLabel" class="demo-toggle-group">
        <Toggle v-for="option in sides" :key="option" :value="option" class="demo-toggle">{{ option }}</Toggle>
      </ToggleGroup>
    </div>

    <MenubarRoot open-on-hover class="demo-menubar">
      <MenuRoot>
        <MenuTrigger class="demo-menubar-trigger">File</MenuTrigger>

        <Portal>
          <Positioner>
            <Popup class="demo-menu-popup">
              <MenuItem class="demo-menu-item" @select="last = 'File › New'">New file</MenuItem>

              <MenuRoot :side="side">
                <MenuTrigger class="demo-menu-item">
                  Open recent
                  <span class="demo-menu-submenu-arrow" aria-hidden="true">›</span>
                </MenuTrigger>

                <Portal>
                  <Positioner>
                    <Popup class="demo-menu-popup">
                      <MenuItem
                        v-for="file in recent"
                        :key="file"
                        class="demo-menu-item"
                        @select="last = `File › Open recent › ${file}`"
                      >
                        {{ file }}
                      </MenuItem>
                      <Separator class="demo-menu-separator" />
                      <MenuItem class="demo-menu-item" @select="last = 'File › Clear recent'">Clear list</MenuItem>
                    </Popup>
                  </Positioner>
                </Portal>
              </MenuRoot>

              <Separator class="demo-menu-separator" />
              <MenuItem class="demo-menu-item" @select="last = 'File › Save'">Save</MenuItem>

              <MenuRoot>
                <MenuTrigger class="demo-menu-item">
                  Export as
                  <span class="demo-menu-submenu-arrow" aria-hidden="true">›</span>
                </MenuTrigger>

                <Portal>
                  <Positioner>
                    <Popup class="demo-menu-popup">
                      <MenuRoot v-for="format in formats" :key="format">
                        <MenuTrigger class="demo-menu-item">
                          {{ format }}
                          <span class="demo-menu-submenu-arrow" aria-hidden="true">›</span>
                        </MenuTrigger>

                        <Portal>
                          <Positioner>
                            <Popup class="demo-menu-popup">
                              <MenuItem class="demo-menu-item" @select="last = `Export › ${format} › current page`">
                                Current page
                              </MenuItem>
                              <MenuItem class="demo-menu-item" @select="last = `Export › ${format} › everything`">
                                Everything
                              </MenuItem>
                            </Popup>
                          </Positioner>
                        </Portal>
                      </MenuRoot>
                    </Popup>
                  </Positioner>
                </Portal>
              </MenuRoot>
            </Popup>
          </Positioner>
        </Portal>
      </MenuRoot>

      <MenuRoot>
        <MenuTrigger class="demo-menubar-trigger">Edit</MenuTrigger>

        <Portal>
          <Positioner>
            <Popup class="demo-menu-popup">
              <MenuItem class="demo-menu-item" @select="last = 'Edit › Undo'">Undo</MenuItem>
              <MenuItem class="demo-menu-item" @select="last = 'Edit › Redo'">Redo</MenuItem>
              <Separator class="demo-menu-separator" />
              <MenuItem class="demo-menu-item" @select="last = 'Edit › Cut'">Cut</MenuItem>
              <MenuItem class="demo-menu-item" @select="last = 'Edit › Copy'">Copy</MenuItem>
              <MenuItem class="demo-menu-item" disabled>Paste</MenuItem>
            </Popup>
          </Positioner>
        </Portal>
      </MenuRoot>

      <MenuRoot>
        <MenuTrigger class="demo-menubar-trigger">View</MenuTrigger>

        <Portal>
          <Positioner>
            <Popup class="demo-menu-popup">
              <MenuItem class="demo-menu-item" @select="last = 'View › Zoom in'">Zoom in</MenuItem>
              <MenuItem class="demo-menu-item" @select="last = 'View › Zoom out'">Zoom out</MenuItem>
              <Separator class="demo-menu-separator" />
              <MenuItem class="demo-menu-item" @select="last = 'View › Toggle sidebar'">Toggle sidebar</MenuItem>
            </Popup>
          </Positioner>
        </Portal>
      </MenuRoot>
    </MenubarRoot>
  </div>

  <DemoOutput>last action: {{ last }}</DemoOutput>
</template>
