<template>
  <v-card color=green>
    <v-card outlined class="ml-2">
      <analyze-scenario :scenario="scenario"/>
    </v-card>
    <v-card :class="'d-flex justify-space-between'">

      <delete-scenario :scenario="scenario"/>

      <edit-scenario :scenario="scenario"/>

      <export-scenario :scenario="scenario"/>

    </v-card>
  </v-card>
</template>

<script>
import ExportScenario from './ExportScenario'
import DeleteScenario from './DeleteScenario'
import EditScenario from './EditScenario'
import AnalyzeScenario from './analyze/AnalyzeScenario'

export default {
  name: 'scenario-tree-component',
  props: ['scenario', 'displayID'],
  data: function () {
    return {openPanel: false, openFile: false}
  },
  methods: {
    loadScenario: function (eventData) {
      console.log(eventData)
    },
    showScenario: function (hostCode, hostPhysics = '') {
      if (hostPhysics !== '') {
        let retval = this.scenario.hostPhysics === hostPhysics && this.scenario.hostCode === hostCode
        return retval
      } else {
        let retval = this.scenario.hostCode === hostCode
        return retval
      }
    }
  },
  components: {
    DeleteScenario,
    EditScenario,
    AnalyzeScenario,
    ExportScenario
  }
}
</script>
