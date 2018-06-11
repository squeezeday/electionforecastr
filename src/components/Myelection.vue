<template>
  <div>
    <div class="row">
      <div class="col-md-12">
        <form>
          <div class="row form-group">
            <div class="col-sm-5">Parti</div>
            <div class="col-sm-4"></div>
            <div class="col-sm-2">Andel röster</div>
            <div class="col-sm-1">Mandat</div>
          </div>
          <div v-for="item in parties" :key="item.name_short">
            <div class="row form-group">
              <div class="col-sm-5"><label>{{ item.name }}</label></div>
              <div class="col-sm-4  ">
                  <input type="range" class="form-control-range" v-model.number="item.val" min="0" max="100" step="0.1" v-on:change="recalc(item)"/>
              </div>
              <div class="col-sm-2"><input type="number" class="form-control" v-model.number="item.val" min="0" max="100" step="0.1" v-on:change="recalc(item)"/></div>
              <div class="col-sm-1">{{ item.mop }}</div>
            </div>
          </div>
          <div class="row form-group">
            <div class="col-sm-5"><label></label></div>
            <div class="col-sm-4  ">
            </div>
            <div class="col-sm-2">{{ sum }}%</div>
            <div class="col-sm-1">{{ sumMop }}</div>
          </div>
        </form>
      </div>
    </div>
    <div class="row" v-if="sum > 0">
      <div class="col-md-6">
      <party-chart :chart-data="partyChartData" :options="chartOptions" :width="400" :height="400" min="0" max="100"></party-chart>
      </div>
      <div class="col-md-6">
        <mop-chart :chart-data="mopChartData" :options="chartOptions" :width="400" :height="400"></mop-chart>
      </div>
    </div>
  </div>
</template>

<script>
import PartyChart from './PartyChart'
import MopChart from './MopChart'
import partiesData from '../assets/parties.json'
export default {
  name: 'Myelection',
  components: {
    PartyChart,
    MopChart
  },
  watch: {
    '$route' (to, from) {
      if (parseInt(this.$route.params.year) === 2014) {
        this.setResult(2014)
      } else if (parseInt(this.$route.params.year) === 2010) {
        this.setResult(2010)
      } else {
        this.setResult(null)
      }
    }
  },
  methods: {
    setResult: function (year) {
      if (year === 2014) {
        for (var j in this.parties) {
          this.parties[j].val = parseFloat(this.parties[j].val2014)
        }
      } else if (year === 2010) {
        for (j in this.parties) {
          this.parties[j].val = parseFloat(this.parties[j].val2010)
        }
      } else {
        for (j in this.parties) {
          this.parties[j].val = this.myValues[j]
        }
      }
      this.updateSum()
      this.updateChart()
    },
    updateChart: function () {
      var partyChartData = {
        labels: [],
        datasets: [{
          label: '%',
          data: [],
          backgroundColor: []
        },
        {
          label: '2014',
          data: []
        },
        {
          label: '2010',
          data: []
        }]
      }
      // mop
      var mopChartData = {
        labels: [],
        datasets: [{
          label: '%',
          data: [],
          backgroundColor: []
        }]
      }
      for (var p in this.parties) {
        var party = this.parties[p]
        partyChartData.labels.push(party.name_short)
        partyChartData.datasets[0].backgroundColor[p] = party.color
        partyChartData.datasets[0].data[p] = party.val
        partyChartData.datasets[1].data[p] = party.val2014
        partyChartData.datasets[2].data[p] = party.val2010
        mopChartData.labels.push(party.name_short)
        mopChartData.datasets[0].backgroundColor[p] = party.color
        mopChartData.datasets[0].data[p] = party.mop
      }
      this.partyChartData = partyChartData
      this.mopChartData = mopChartData
    },
    updateSum: function () {
      this.sum = 0
      this.sumMop = 0
      this.sumEligible = 0
      for (var p in this.parties) {
        var party = this.parties[p]
        var val = this.parties[p].val
        this.sum += val
        this.sumMop += this.parties[p].mop
        if (val >= 4 && party.name_short !== 'OVR') {
          this.sumEligible += val
        }
      }
      for (p in this.parties) {
        party = this.parties[p]
        party.mop = 0
        if (party.val >= 4 && party.name_short !== 'OVR') {
          party.mop = Math.round(party.val / this.sumEligible * 349)
        }
      }

      this.sum = Math.round(this.sum * 10) / 10
    },
    recalc: function (item) {
      this.updateSum()
      var sumExcept = this.sum - item.val
      var party = null
      var p = null
      if (this.sum >= 100) {
        for (p in this.parties) {
          party = this.parties[p]
          if (party.name_short !== item.name_short && party.val > 0) {
            party.val -= (party.val / sumExcept) * (this.sum - 100)
            party.val = Math.round(party.val * 10) / 10
          }
        }
      }
      // this.updateSum()
      // if (this.sum_start >= 100) {
      //   this.parties[this.parties.length - 1].val += 100 - this.sum
      //   if (this.parties[this.parties.length - 1].val < 0) {
      //     for (p in this.parties) {
      //       party = this.parties[p]
      //       if (party.id !== item.id) {
      //         party.val -= (party.val / sumExcept) * (this.sum - 100)
      //         party.val = Math.round(party.val * 10) / 10
      //       }
      //     }
      //   }
      // }
      this.updateSum()
      this.updateChart()

      this.myValues = []
      for (p in this.parties) {
        this.myValues[p] = this.parties[p].val
      }
    }
  },
  data () {
    return {
      sum: 0,
      sumMop: 0,
      sumEligible: 0,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        circumference: Math.PI,
        rotation: Math.PI
      },
      partyChartData: null,
      mopChartData: null,
      parties: partiesData,
      myValues: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>
