<template>
  <v-card class="ma-0 pa-0" color=green>
    <v-card class="pt-4 ml-2">
      <v-card outlined class="ma-2">
      <div class="text-center text-h7"> status: {{ solutionStatus }} </div>
      <div v-if="solutionStatus==='running'" class="text-center">
        <v-progress-linear indeterminate color="primary" ></v-progress-linear>
      </div>
      </v-card>
      <v-card class="ma-2"><v-btn block small @click="compute()" :disabled="pending==false">Compute</v-btn></v-card>
    </v-card>
    <v-dialog v-model="showErrors" persistent max-width="600px">
      <v-card>
        <Error v-bind:errors = "errors"/>  
        <br><br><br>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn block  @click="showErrors = false" style="{text-align: right;}">
            <h2>OK</h2>
          </v-btn>     
        </v-card-actions>   
      </v-card> 
    </v-dialog>
  </v-card>
</template>

<script>
import {validateScenario} from '../scenarios/scenario-validation'
import Error from '../Error'
export default {
  name: 'realization-solution',
  components:{Error},
  props: ['parentObject'],
  data: function () {
    return {
      pending: true,
      showErrors: false,
      errors: []
    }
  },
  computed: {
    solutionStatus: {
      get: function () {
        return this.parentObject.simulation.computeStatus
      },
      set: function () {
        // This property is never set.  The setter is defined to prevent errors in the console.
      }
    }
  },
  methods: {
    compute: function () {
      this.errors = validateScenario(this.parentObject.scenario)
      if(this.errors.length > 0){
        this.showErrors = true;
      } else {
        this.$store.dispatch('conductRealizationSimulation', {realizationName: this.parentObject.name})
        this.pending = false
      }
    }
  }
}
</script>
